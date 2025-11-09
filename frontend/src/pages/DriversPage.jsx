import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function DriversPage() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ New state for search input

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await apiFetch("/api/drivers");
        const data = await res.json().catch(() => ({}));
        console.info('[DriversPage] drivers response:', data);
        const list = data.drivers || [];
        setDrivers(list);
      } catch (error) {
        console.error("Error fetching drivers:", error);
        setDrivers([]);
      }
    };

    fetchDrivers();

    if (localStorage.getItem("newDriverAdded")) {
      localStorage.removeItem("newDriverAdded");
      fetchDrivers();
    }
  }, []);

  // ✅ Filter and prioritize search results
  const filteredDrivers = [...drivers].sort((a, b) => {
    const aMatch = a.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const bMatch = b.name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  const available = drivers.filter((d) => d.status === "Available").length;
  const assigned = drivers.filter((d) => d.status === "Assigned").length;
  const onLeave = drivers.filter((d) => d.status === "On Leave").length;
  const total = drivers.length;

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Driver Management</h1>

        {/* ✅ Add Search + Button */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="🔍 Search driver by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-gray-400 outline-none"
          />
          <button
            onClick={() => navigate("/driver/add")}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            + Add New Driver
          </button>
        </div>
      </div>

      <p className="text-gray-500 mb-6">
        Manage driver profiles, assignments, and performance tracking
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Available" value={available} icon="✅" />
        <MetricCard title="Assigned" value={assigned} icon="🚚" />
        <MetricCard title="On Leave" value={onLeave} icon="⏰" />
        <MetricCard title="Total Drivers" value={total} icon="👤" />
      </div>

      {/* Driver Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.length > 0 ? (
          filteredDrivers.map((driver) => (
            <DriverCard key={driver._id} driver={driver} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10">
            No drivers found. Please add one.
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

function DriverCard({ driver }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-xs text-gray-500 font-mono">
            ID: {driver.driverId || "N/A"}
          </p>
          <h2 className="font-semibold text-lg text-gray-800">
            Name: {driver.name || "N/A"}
          </h2>
        </div>
        <StatusBadge status={driver.status} />
      </div>

      {/* Details */}
      <p className="text-gray-500 text-sm">{driver.licenseNo}</p>
      <div className="mt-3 space-y-1 text-sm text-gray-600">
        <div>📞 {driver.phone || "N/A"}</div>
        <div>✉️ {driver.email || "N/A"}</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-3 text-sm text-gray-700">
        <div>
          <p>Experience:</p>
          <p className="font-semibold">{driver.experience || "0 years"}</p>
        </div>
        <div>
          <p>Rating:</p>
          <p className="font-semibold">⭐ {driver.rating || "4.5/5.0"}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={() => navigate(`/driver/profile?id=${driver._id}`)}
          className="bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800"
        >
          View Profile
        </button>

        {driver.status === "Available" ? (
          <button
            onClick={() => navigate(`/driver/assign-vehicle?id=${driver._id}`)}
            className="bg-yellow-100 text-gray-900 py-2 rounded-lg border border-yellow-300 hover:bg-yellow-200"
          >
            Assign Vehicle
          </button>
        ) : (
          <button
            onClick={() =>
              navigate(`/driver/assignment-details?id=${driver._id}`)
            }
            className="bg-blue-100 text-blue-900 py-2 rounded-lg border border-blue-300 hover:bg-blue-200"
          >
            View Assignment
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    Available: "bg-green-100 text-green-800",
    Assigned: "bg-blue-100 text-blue-800",
    "On Leave": "bg-yellow-100 text-yellow-800",
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
