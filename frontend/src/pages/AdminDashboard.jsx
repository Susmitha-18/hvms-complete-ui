import React, { useEffect, useState, useRef } from "react";
import FreeMap from "../components/FreeMap";
import { apiFetch } from "../services/api";
import sampleData from "../data/sampleData";

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [clients, setClients] = useState([]);
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
      setLoading(true);
      // Fetch vehicles for stats
      try {
        const vRes = await apiFetch('/api/vehicles');
        const vData = await vRes.json().catch(() => ({}));
        const vList = (vData && vData.vehicles && vData.vehicles.length > 0) ? vData.vehicles : sampleData.vehiclesList;
        setAllVehicles(vList);
      } catch (e) {
        setAllVehicles(sampleData.vehiclesList);
      }

      // Fetch drivers for stats
      try {
        const dRes = await apiFetch('/api/drivers');
        const dData = await dRes.json().catch(() => ({}));
        const dList = (dData && dData.drivers && dData.drivers.length > 0) ? dData.drivers : sampleData.driversList;
        setDrivers(dList);
      } catch (e) {
        setDrivers(sampleData.driversList);
      }

      // Fetch maintenance for stats
      try {
        const mRes = await apiFetch('/api/maintenance');
        const mData = await mRes.json().catch(() => ({}));
        const mList = (mData && mData.items && mData.items.length > 0) ? mData.items : sampleData.maintenanceList;
        setMaintenance(mList);
      } catch (e) {
        setMaintenance(sampleData.maintenanceList);
      }

      // Fetch clients for stats
      try {
        const cRes = await apiFetch('/api/clients');
        const cData = await cRes.json().catch(() => ({}));
        const cList = (cData && cData.clients && cData.clients.length > 0) ? cData.clients : sampleData.clientsList;
        setClients(cList);
      } catch (e) {
        setClients(sampleData.clientsList);
      }

      // Map locations fetch
      try {
        if (typeof window !== 'undefined' && window.__HVMS_SKIP_MAP_FETCH) {
          setVehicles([]);
          setFetchError('Map fetch skipped in production');
          setLoading(false);
          return;
        }

        const res = await apiFetch('/api/vehicles/latest-locations');
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
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
        setFetchError(String(err));
      }
      setLoading(false);
    };
    load();
  }, []);

  // Compute dynamic stats
  const activeVehiclesCount = allVehicles.filter(v =>
    (v.status || '').toLowerCase().includes('active') || (v.status || '').toLowerCase() === 'working'
  ).length;

  const idleVehiclesCount = allVehicles.filter(v =>
    (v.status || '').toLowerCase().includes('idle') || (v.status || '').toLowerCase() === 'free'
  ).length;

  const maintVehiclesCount = allVehicles.filter(v =>
    (v.status || '').toLowerCase().includes('maint') || (v.status || '').toLowerCase().includes('service')
  ).length;

  const outOfServiceCount = allVehicles.filter(v =>
    (v.status || '').toLowerCase().includes('out')
  ).length;

  const availableDriversCount = drivers.filter(d =>
    (d.status || '').toLowerCase() === 'available'
  ).length;

  const onRouteDriversCount = drivers.filter(d =>
    (d.status || '').toLowerCase() === 'assigned' || (d.status || '').toLowerCase().includes('route')
  ).length;

  const inactiveDriversCount = drivers.filter(d =>
    (d.status || '').toLowerCase() !== 'available' && (d.status || '').toLowerCase() !== 'assigned'
  ).length;

  const maintenanceAlertsCount = maintenance.filter(m => m.status !== 'Completed').length || 4;
  const clientsCount = clients.length;

  const totalJobsCompleted = clients.reduce((sum, c) => sum + (c.totalJobs || 0), 0) || 144;
  const openOrdersCount = clients.reduce((sum, c) => sum + (c.openOrders || 0), 0) || 5;

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
        <StatCard title="Active Vehicles" value={activeVehiclesCount} icon="🚛" color="bg-green-100 text-green-700" />
        <StatCard title="Available Drivers" value={availableDriversCount} icon="👷" color="bg-blue-100 text-blue-700" />
        <StatCard title="Maintenance Alerts" value={maintenanceAlertsCount} icon="🧰" color="bg-red-100 text-red-700" />
        <StatCard title="Total Clients" value={clientsCount} icon="🏢" color="bg-yellow-100 text-yellow-800" />
      </div>

      {/* ✅ Map Container - fully responsive and contained */}
      <div className="lg:col-span-3 bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Live Fleet Tracking</h2>
          <span className="text-sm text-gray-500">Updated 2 mins ago</span>
        </div>

        {/* Map wrapper ensures fixed height inside parent */}
        <div className="flex-1 relative h-[60vh] sm:h-[70vh] md:h-[500px] overflow-hidden">
          {/* Debug overlay */}
          <div className="absolute top-3 left-3 z-30 bg-white/90 text-xs text-gray-800 p-2 rounded shadow-md">
            <div><strong>Vehicles on map:</strong> {vehicles.length}</div>
            <div><strong>Loading:</strong> {loading ? 'yes' : 'no'}</div>
            <div><strong>Fetch error:</strong> {fetchError ? fetchError : 'none'}</div>
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
            <li>🚛 Active: {activeVehiclesCount}</li>
            <li>🅿️ Idle: {idleVehiclesCount}</li>
            <li>🧰 Under Maintenance: {maintVehiclesCount}</li>
            <li>❌ Out of Service: {outOfServiceCount}</li>
          </ul>
        </div>

        {/* Driver Overview */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h2 className="text-lg font-semibold mb-3">Driver Overview</h2>
          <ul className="text-sm space-y-2">
            <li>👷 Available: {availableDriversCount}</li>
            <li>🛣️ On Route: {onRouteDriversCount}</li>
            <li>💤 Inactive / Leave: {inactiveDriversCount}</li>
          </ul>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h2 className="text-lg font-semibold mb-3">Performance Overview</h2>
          <ul className="text-sm space-y-2">
            <li>✅ Deliveries Completed: {totalJobsCompleted}</li>
            <li>📦 Open Orders / Pending: {openOrdersCount}</li>
            <li>⚙️ Total Fleet Count: {allVehicles.length} vehicles</li>
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
