// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import FreeMap from "../components/FreeMap"; // ✅ Import our map component

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [tileError, setTileError] = useState(false);
  const geocodeCache = useRef({});

  // Simple geocode helper with in-memory cache
  const geocode = async (address) => {
    const key = address.trim();
    if (geocodeCache.current[key]) return geocodeCache.current[key];
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const val = { lat: parseFloat(lat), lng: parseFloat(lon), display_name: data[0].display_name };
        geocodeCache.current[key] = val;
        return val;
      }
    } catch (err) {
      console.error("❌ Geocode error:", err);
    }
    geocodeCache.current[key] = null;
    return null;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
  const res = await fetch("/api/vehicles/latest-locations");
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        const data = await res.json();
        const list = data.vehicles || [];
        const out = [];
        for (const v of list) {
          if (!v.address || !v.address.trim()) continue;
          const g = await geocode(v.address);
          if (!g) continue;
          out.push({
            name: v.vehicleName || v.name || "Vehicle",
            lat: g.lat,
            lng: g.lng,
            status: v.status || "Unknown",
            id: v.vehicleId || v.id,
            registrationNumber: v.registrationNumber || "",
            displayAddress: g.display_name || v.address,
          });
        }
        setVehicles(out);
        setFetchError(null)
      } catch (err) {
        console.error("❌ Error loading vehicles for admin map:", err);
        setFetchError(String(err))
      }
      setLoading(false)
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-extrabold">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome back, <strong>Admin</strong> — monitor your fleet, track drivers, and manage logistics.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Active Vehicles" value="38" icon="🚛" color="bg-green-100 text-green-700" />
        <StatCard title="Available Drivers" value="14" icon="👷" color="bg-blue-100 text-blue-700" />
        <StatCard title="Maintenance Alerts" value="7" icon="🧰" color="bg-red-100 text-red-700" />
        <StatCard title="Total Clients" value="12" icon="🏢" color="bg-yellow-100 text-yellow-800" />
      </div>

      {/* ✅ Map Container - fully responsive and contained */}
<div className="lg:col-span-3 bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
  <div className="p-4 border-b flex justify-between items-center">
    <h2 className="text-lg font-semibold">Live Fleet Tracking</h2>
    <span className="text-sm text-gray-500">Updated 2 mins ago</span>
  </div>

  {/* Map wrapper ensures fixed height inside parent */}
  <div className="flex-1 relative h-[60vh] sm:h-[70vh] md:h-[500px] overflow-hidden">
      {/* Debug overlay: shows vehicles count and errors to help diagnose blank map */}
      <div className="absolute top-3 left-3 z-30 bg-white/90 text-xs text-gray-800 p-2 rounded shadow-md">
        <div><strong>Vehicles:</strong> {vehicles.length}</div>
        <div><strong>Loading:</strong> {loading ? 'yes' : 'no'}</div>
        <div><strong>Fetch error:</strong> {fetchError ? fetchError : 'none'}</div>
        <div><strong>Tile error:</strong> {tileError ? 'yes' : 'no'}</div>
      </div>
      <FreeMap vehicles={vehicles} onTileError={() => setTileError(true)} />
    </div>
</div>


      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Summary */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h2 className="text-lg font-semibold mb-3">Fleet Summary</h2>
          <ul className="text-sm space-y-2">
            <li>🚛 Active: 38</li>
            <li>🅿️ Idle: 7</li>
            <li>🧰 Under Maintenance: 5</li>
            <li>❌ Out of Service: 2</li>
          </ul>
        </div>

        {/* Driver Overview */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h2 className="text-lg font-semibold mb-3">Driver Overview</h2>
          <ul className="text-sm space-y-2">
            <li>👷 Available: 14</li>
            <li>🛣️ On Route: 32</li>
            <li>💤 Inactive: 6</li>
          </ul>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h2 className="text-lg font-semibold mb-3">Performance Overview</h2>
          <ul className="text-sm space-y-2">
            <li>✅ Deliveries Completed: 126</li>
            <li>📦 Deliveries Pending: 9</li>
            <li>⚙️ Maintenance Efficiency: 94%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ===== Subcomponents ===== */
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex justify-between items-center">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-3xl font-bold mt-2">{value}</div>
      </div>
      <div className={`text-3xl p-3 rounded-full ${color}`}>{icon}</div>
    </div>
  );
}
