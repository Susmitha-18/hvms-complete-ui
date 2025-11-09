import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [history, setHistory] = useState([]);
  const [vehicleSearch, setVehicleSearch] = useState(""); // 🔍 top search
  const [historySearch, setHistorySearch] = useState(""); // 🔍 history search
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
  // ✅ Load all vehicles
  const res = await axios.get("/api/vehicles");
  console.info('[VehiclesPage] vehicles response:', res.data);
  setVehicles(res.data.vehicles || []);

  // ✅ Load all vehicle assignment history
  const hist = await axios.get("/api/vehicles/history");
  console.info('[VehiclesPage] history response:', hist.data);
  setHistory(hist.data.history || []);
      } catch (err) {
        console.error("❌ Error loading vehicles or history:", err);
      }
    };
    load();
  }, []);

  // Summary Stats
  const working = vehicles.filter((v) => v.status === "Working").length;
  const free = vehicles.filter((v) => v.status === "Free").length;
  const inService = vehicles.filter((v) => v.status === "In Service").length;
  const total = vehicles.length;

  // ✅ Search filter for vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const query = vehicleSearch.toLowerCase();
    return (
      v.name?.toLowerCase().includes(query) ||
      v.vehicleId?.toLowerCase().includes(query) ||
      v.registrationNumber?.toLowerCase().includes(query) ||
      v.vehicleType?.toLowerCase().includes(query)
    );
  });

  // ✅ Sort + filter history
  const sortedHistory = [...history]
    .sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt))
    .filter((item) => {
      const query = historySearch.toLowerCase();
      return (
        item.vehicleId?.name?.toLowerCase().includes(query) ||
        item.vehicleId?.vehicleId?.toLowerCase().includes(query) ||
        item.driverId?.name?.toLowerCase().includes(query)
      );
    });

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Vehicle Management</h1>

        <div className="flex items-center gap-3">
          {/* 🔍 Global Vehicle Search */}
          <input
            type="text"
            placeholder="Search vehicles..."
            value={vehicleSearch}
            onChange={(e) => setVehicleSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />

          <button
            onClick={() => navigate("/vehicles/add")}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            + Add New Vehicle
          </button>
        </div>
      </div>

      <p className="text-gray-500 mb-6">
        Manage and track all vehicles in your fleet with live status updates
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Working" value={working} icon="🚚" />
        <MetricCard title="Free" value={free} icon="🟢" />
        <MetricCard title="In Service" value={inService} icon="🧰" />
        <MetricCard title="Total Vehicles" value={total} icon="🚗" />
      </div>

      {/* ✅ Vehicle History Section */}
      <div className="bg-white shadow rounded-xl p-6 mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            🕓 Vehicle Assignment History
          </h2>

          {/* 🔍 History Search */}
          <input
            type="text"
            placeholder="Search history..."
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {sortedHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="p-3 border">Vehicle ID</th>
                  <th className="p-3 border">Vehicle Name</th>
                  <th className="p-3 border">Driver Name</th>
                  <th className="p-3 border">Assigned Date</th>
                  <th className="p-3 border">End Date</th>
                  <th className="p-3 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedHistory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="p-3 border">{item.vehicleId?.vehicleId || "N/A"}</td>
                    <td className="p-3 border">{item.vehicleId?.name || "N/A"}</td>
                    <td className="p-3 border">{item.driverId?.name || "N/A"}</td>
                    <td className="p-3 border">
                      {item.assignedAt
                        ? new Date(item.assignedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="p-3 border">
                      {item.unassignedAt
                        ? new Date(item.unassignedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="p-3 border font-medium">
                      {item.status === "Active" ? (
                        <span className="text-green-700">Active</span>
                      ) : (
                        <span className="text-gray-600">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-2">
              Showing {sortedHistory.length} assignment records (past, current & upcoming)
            </p>
          </div>
        ) : (
          <p className="text-gray-500 italic">No vehicle history records found.</p>
        )}
      </div>

      {/* Vehicle Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10">
            No matching vehicles found.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Helper Components ---------- */

function MetricCard({ title, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-2xl font-bold mt-1">{value}</h2>
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  );
}

function VehicleCard({ vehicle }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-xs text-gray-500 font-mono">
            ID: {vehicle.vehicleId || "N/A"}
          </p>
          <h2 className="font-semibold text-lg text-gray-800">
            {vehicle.name || "Unnamed Vehicle"}
          </h2>
        </div>
        <StatusBadge status={vehicle.status} />
      </div>

      {/* Details */}
      <div className="mt-2 text-sm text-gray-600 space-y-1">
        <p>🪪 Reg. Number: {vehicle.registrationNumber || "N/A"}</p>
        <p>🚘 Model: {vehicle.vehicleModel || "N/A"}</p>
        <p>⚙️ Type: {vehicle.vehicleType || "N/A"}</p>
        <p>🛠️ Engine: {vehicle.engineType || "N/A"}</p>
        <p>⛽ Fuel: {vehicle.fuelType || "N/A"}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-3 text-sm text-gray-700">
        <div>
          <p>Load Capacity:</p>
          <p className="font-semibold">{vehicle.loadCapacity || "N/A"}</p>
        </div>
        <div>
          <p>Manufactured:</p>
          <p className="font-semibold">{vehicle.manufacturingYear || "N/A"}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={() => navigate(`/vehicle/profile?id=${vehicle._id}`)}
          className="bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800"
        >
          View Details
        </button>

        <button
          onClick={() => navigate(`/vehicle/history?id=${vehicle._id}`)}
          className="bg-blue-100 text-blue-900 py-2 rounded-lg border border-blue-300 hover:bg-blue-200"
        >
          Vehicle History
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    Working: "bg-green-100 text-green-800",
    Free: "bg-blue-100 text-blue-800",
    "In Service": "bg-yellow-100 text-yellow-800",
  };

  return (
    <div
      className={`text-xs px-2 py-1 rounded font-medium ${
        colors[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </div>
  );
}
