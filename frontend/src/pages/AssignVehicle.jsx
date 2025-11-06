import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AssignVehicle() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");

  // ✅ Load all drivers and vehicles
  useEffect(() => {
  fetch("/api/drivers")
      .then((res) => res.json())
      .then((data) => setDrivers(data.drivers || []))
      .catch((err) => {
        console.error("❌ Error loading drivers:", err);
        setDrivers([]);
      });

  fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data) => setVehicles(data.vehicles || []))
      .catch((err) => {
        console.error("❌ Error loading vehicles:", err);
        setVehicles([]);
      });
  }, []);

  // ✅ Assign a vehicle to a driver
  const handleAssign = async () => {
    if (!selectedDriver || !selectedVehicle) {
      alert("⚠️ Please select both driver and vehicle.");
      return;
    }

    try {
      const res = await fetch(`/api/drivers/assign/${selectedDriver}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicleId: selectedVehicle }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("✅ Vehicle assigned successfully!");

        setDrivers((prev) =>
          prev.map((d) =>
            d._id === selectedDriver
              ? { ...d, status: "Assigned", assignedVehicle: selectedVehicle }
              : d
          )
        );

        setVehicles((prev) =>
          prev.map((v) =>
            v._id === selectedVehicle
              ? { ...v, status: "Working" }
              : v
          )
        );

        setSelectedDriver("");
        setSelectedVehicle("");
      } else {
        alert(`❌ Failed: ${data.message}`);
      }
    } catch (err) {
      console.error("⚠️ Error assigning vehicle:", err);
      alert("⚠️ Unable to connect to the server.");
    }
  };

  // ✅ Unassign a driver from vehicle
  const handleUnassign = async (driverId, vehicleId) => {
    if (!driverId || !vehicleId) {
      alert("⚠️ Driver or Vehicle missing!");
      return;
    }

    try {
      const res = await fetch(`/api/drivers/unassign/${driverId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicleId }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("✅ Driver successfully unassigned!");

        // Update UI instantly
        setDrivers((prev) =>
          prev.map((d) =>
            d._id === driverId
              ? { ...d, status: "Available", assignedVehicle: "" }
              : d
          )
        );

        setVehicles((prev) =>
          prev.map((v) =>
            v._id === vehicleId
              ? { ...v, status: "Free" }
              : v
          )
        );
      } else {
        alert(`❌ Failed to unassign: ${data.message}`);
      }
    } catch (err) {
      console.error("⚠️ Error unassigning vehicle:", err);
      alert("⚠️ Server connection failed.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🚛 Assign / Unassign Vehicle</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          ← Back
        </button>
      </div>

      {/* Assignment Form */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Assign Vehicle</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Select Driver</label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="">-- Select Driver --</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.driverId || d._id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Select Vehicle</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="">-- Select Vehicle --</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name} ({v.vehicleId})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAssign}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            >
              Assign Vehicle
            </button>
          </div>
        </div>
      </div>

      {/* Status Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Driver - Vehicle Status</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3">Driver ID</th>
              <th>Driver Name</th>
              <th>Vehicle ID</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d._id} className="border-t text-center">
                <td className="p-3">{d.driverId || d._id}</td>
                <td>{d.name}</td>
                <td>{d.assignedVehicle || "-"}</td>
                <td>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      d.status === "Assigned"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {d.status || "Available"}
                  </span>
                </td>
                <td>
                  {d.status === "Assigned" ? (
                    <button
                      onClick={() =>
                        handleUnassign(d._id, d.assignedVehicle)
                      }
                      className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                    >
                      Unassign
                    </button>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
