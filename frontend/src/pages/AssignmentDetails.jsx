import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function AssignmentDetails() {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const driverId = query.get("id");

  const [driver, setDriver] = useState(null);
  const [vehicle, setVehicle] = useState(null);

  // ✅ Load driver and vehicle info
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!driverId) return;
        const driverRes = await apiFetch(`/api/drivers/${driverId}`);
        const driverData = await driverRes.json().catch(() => ({}));
        console.info('[AssignmentDetails] driver response:', driverRes.status, driverData);
        setDriver(driverData.driver || null);

        if (driverData.driver?.assignedVehicle) {
          const vehicleRes = await apiFetch(`/api/vehicles`);
          const vehiclesData = await vehicleRes.json().catch(() => ({}));
          console.info('[AssignmentDetails] vehicles response:', vehicleRes.status, vehiclesData);
          const foundVehicle = (vehiclesData.vehicles || []).find(
            (v) => String(v._id) === String(driverData.driver.assignedVehicle)
          );
          setVehicle(foundVehicle || null);
        }
      } catch (err) {
        console.error("❌ Error loading assignment details:", err);
      }
    };

    loadData();
  }, [driverId]);

  // ✅ Handle unassign
  const handleUnassign = async () => {
    try {
      const res = await apiFetch(`/api/drivers/unassign/${driverId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: driver.assignedVehicle }),
      });
      const data = await res.json().catch(() => ({}));
      console.info('[AssignmentDetails] unassign response:', res.status, data);
      if (res.ok) {
        alert("✅ Driver successfully unassigned!");
        // Refresh the driver and history so UI updates immediately
        // navigate back to drivers list after a short delay to allow UI refresh
        setTimeout(() => navigate("/drivers"), 300);
      } else {
        alert(`❌ Failed to unassign: ${data && data.message ? data.message : 'Unknown error'}`);
      }
    } catch (err) {
      console.error("⚠️ Unassign error:", err);
      alert("⚠️ Unable to connect to the server.");
    }
  };

  if (!driver)
    return (
      <div className="p-6 text-center text-gray-600">Loading details...</div>
    );

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow rounded-xl mt-8 mb-12">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Assignment Details
      </h1>

      {/* Driver Details */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">
          Driver Details
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-gray-600">
          <p>
            <strong>Name:</strong> {driver.name}
          </p>
          <p>
            <strong>Driver ID:</strong> {driver.driverId}
          </p>
          <p>
            <strong>Email:</strong> {driver.email}
          </p>
          <p>
            <strong>Phone:</strong> {driver.phone}
          </p>
        </div>
      </div>

      {/* Vehicle Details */}
      {vehicle ? (
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-700">
            Vehicle Details
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-gray-600">
            <p>
              <strong>Vehicle ID:</strong> {vehicle.vehicleId}
            </p>
            <p>
              <strong>Name:</strong> {vehicle.name}
            </p>
            <p>
              <strong>Model:</strong> {vehicle.vehicleModel}
            </p>
            <p>
              <strong>Type:</strong> {vehicle.vehicleType}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 italic">No vehicle assigned.</p>
      )}

      {/* ✅ Assignment History Section */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">
          Assignment History
        </h2>
        <AssignmentHistory driverId={driverId} />
      </div>

      {/* Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => navigate("/drivers")}
          className="px-5 py-2 border rounded-lg hover:bg-gray-100"
        >
          ← Back
        </button>
        {vehicle && (
          <button
            onClick={handleUnassign}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            🔓 Unassign
          </button>
        )}
      </div>
    </div>
  );
}

/* ✅ New Component: Driver Assignment History */
function AssignmentHistory({ driverId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!driverId) {
          setHistory([]);
          return;
        }
        const res = await apiFetch(`/api/drivers/history/${driverId}`);
        const data = await res.json().catch(() => ({}));
        console.info('[AssignmentDetails] history response:', res.status, data);
        setHistory(data.history || []);
      } catch (err) {
        console.error("Error loading history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [driverId]);

  if (loading)
    return <p className="text-gray-500 italic">Loading assignment history...</p>;

  if (history.length === 0)
    return <p className="text-gray-500 italic">No assignment history available.</p>;

  return (
  <div className="overflow-x-auto">
    <table className="min-w-full border-collapse border border-gray-200 mt-3">
      <thead>
        <tr className="bg-gray-50 text-left">
          <th className="p-3 border">Vehicle ID</th>
          <th className="p-3 border">Vehicle Name</th>
          <th className="p-3 border">Assigned Date</th>
          <th className="p-3 border">Unassigned Date</th>
          <th className="p-3 border">Status</th>
        </tr>
      </thead>
      <tbody>
        {history.map((h) => (
          <tr key={h._id} className="border-t hover:bg-gray-50">
            <td className="p-3 border">{h.vehicleId?.vehicleId || "—"}</td>
            <td className="p-3 border">{h.vehicleId?.name || "—"}</td>
            <td className="p-3 border">
              {new Date(h.assignedAt).toLocaleString()}
            </td>
            <td className="p-3 border">
              {h.unassignedAt
                ? new Date(h.unassignedAt).toLocaleString()
                : "—"}
            </td>
            <td className="p-3 border font-medium">
              {h.status === "Active" ? (
                <span className="text-green-700">Active</span>
              ) : (
                <span className="text-gray-500">Completed</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* ✅ Added this line below the table */}
    <p className="text-xs text-gray-500 mt-2">
      Showing {history.length} total assignment records (active + past)
    </p>
  </div>
);

}
