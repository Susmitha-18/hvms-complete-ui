import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";

import MapCard from "../widgets/MapCard";


export default function VehicleHistory() {
  const query = new URLSearchParams(useLocation().search);
  const vehicleId = query.get("id");
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null); // Track which row is being edited

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!vehicleId) {
          setVehicle(null);
          setHistory([]);
          return;
        }

        // ✅ Fetch vehicle details (use apiFetch so runtime API overrides are respected)
        const vRes = await apiFetch(`/api/vehicles/${vehicleId}`);
  const vData = await vRes.json().catch(() => ({}));
  console.info('[VehicleHistory] vehicle response:', vData);
  setVehicle(vData.vehicle || null);

        // ✅ Fetch vehicle history
        const hRes = await apiFetch(`/api/vehicles/history/${vehicleId}`);
  const hData = await hRes.json().catch(() => ({}));
  console.info('[VehicleHistory] history response count:', (hData.history || []).length, hData);
  setHistory(hData.history || []);
      } catch (err) {
        console.error("❌ Error loading vehicle history:", err);
        setVehicle(null);
        setHistory([]);
      }
    };
    loadData();
  }, [vehicleId]);

  const handleEditChange = (index, field, value) => {
    const newHistory = [...history];
    newHistory[index][field] = value;
    setHistory(newHistory);
  };

  const handleSave = async (recordId, index) => {
    const record = history[index];
    const updatedData = {
      clientName: record.clientName,
      clientAddress: record.clientAddress,
    };

    try {
      const res = await fetch(
        `/api/vehicles/history/update/${recordId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("✅ History updated successfully!");
        setEditingIndex(null); // Disable edit mode
      } else {
        alert(`❌ Failed: ${data.message}`);
      }
    } catch (err) {
      alert("⚠️ Error saving changes");
      console.error(err);
    }
  };

  if (!vehicle) {
    return (
      <div className="p-8 text-gray-500">
        {vehicleId ? "Loading vehicle history..." : "No vehicle selected. Please open this page with a vehicle id."}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white shadow rounded-xl mt-6 mb-12">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🚗 Vehicle History</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Vehicle Details</h2>
        <p><strong>ID:</strong> {vehicle.vehicleId}</p>
        <p><strong>Name:</strong> {vehicle.name}</p>
        <p><strong>Model:</strong> {vehicle.vehicleModel}</p>
      </div>

      <h2 className="text-xl font-semibold mb-3 text-gray-700">Assignment History</h2>

      {history.length === 0 ? (
        <p className="text-gray-500 italic">No history available for this vehicle.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-3 border">Driver Name</th>
                <th className="p-3 border">Client</th>
                <th className="p-3 border">Address / Landmark</th>
                <th className="p-3 border">Assigned</th>
                <th className="p-3 border">Ended</th>
                <th className="p-3 border">Working Hours</th>
                <th className="p-3 border text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, index) => (
                <tr key={h._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 border">{h.driverId?.name || "—"}</td>

                  <td className="p-3 border">
                    <input
                      type="text"
                      value={h.clientName || ""}
                      onChange={(e) =>
                        handleEditChange(index, "clientName", e.target.value)
                      }
                      disabled={editingIndex !== index}
                      className={`border rounded p-1 w-full ${
                        editingIndex === index ? "bg-white" : "bg-gray-100"
                      }`}
                    />
                  </td>

                  <td className="p-3 border">
                    <input
                      type="text"
                      value={h.clientAddress || ""}
                      onChange={(e) =>
                        handleEditChange(index, "clientAddress", e.target.value)
                      }
                      disabled={editingIndex !== index}
                      className={`border rounded p-1 w-full ${
                        editingIndex === index ? "bg-white" : "bg-gray-100"
                      }`}
                    />
                  </td>

                  <td className="p-3 border">
                    {h.assignedAt ? new Date(h.assignedAt).toLocaleString() : "—"}
                  </td>

                  <td className="p-3 border">
                    {h.unassignedAt ? new Date(h.unassignedAt).toLocaleString() : "—"}
                  </td>

                  <td className="p-3 border">
                    {calculateDuration(h.assignedAt, h.unassignedAt)}
                  </td>

                  <td className="p-3 border text-center">
                    {editingIndex === index ? (
                      <button
                        onClick={() => handleSave(h._id, index)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingIndex(index)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-xs text-gray-500 mt-2">
            Showing {history.length} total assignment records (active + past)
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => navigate("/vehicles")}
          className="px-5 py-2 border rounded-lg hover:bg-gray-100"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

/* 🔹 Calculate duration (hours/days) */
function calculateDuration(start, end) {
  if (!start || !end) return "—";
  const diffMs = new Date(end) - new Date(start);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  return days > 0 ? `${days} day(s)` : `${hours} hr(s)`;
}
