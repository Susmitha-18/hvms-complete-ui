import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MaintenanceRecords() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const loadVehicles = async () => {
      try {
  const res = await axios.get("/api/vehicles");
        setVehicles(res.data.vehicles || []);
      } catch (err) {
        console.error("❌ Error loading vehicles:", err);
      }
    };
    loadVehicles();
  }, []);

  // load scheduled maintenance notes from localStorage
  const [notesByDate, setNotesByDate] = useState({})
  useEffect(()=>{
    try{
      const all = JSON.parse(localStorage.getItem('hvms_maintenance_notes') || '{}')
      setNotesByDate(all || {})
    }catch(e){ setNotesByDate({}) }
  },[])

  const filteredVehicles = vehicles.filter((v) => {
    const query = search.toLowerCase();
    const matchSearch =
      v.name?.toLowerCase().includes(query) ||
      v.vehicleId?.toLowerCase().includes(query) ||
      v.registrationNumber?.toLowerCase().includes(query);

    const matchStatus = statusFilter === "All" || v.status === statusFilter;
    const matchPriority = priorityFilter === "All" || v.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <MetricCard title="Scheduled" value="2" icon="📅" />
        <MetricCard title="In Progress" value="1" icon="🔧" />
        <MetricCard title="Overdue" value="1" icon="⚠️" />
        <MetricCard title="Completed" value="1" icon="✅" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3 mt-6">
        <input
          type="text"
          placeholder="Search vehicles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option>All</option>
          <option>Free</option>
          <option>Working</option>
          <option>In Service</option>
        </select>
        {/* <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option>All</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Critical</option>
        </select>
        <button className="border rounded-lg px-4 py-2 hover:bg-gray-100">
          Advanced Filters
        </button> */}
      </div>

      {/* Scheduled Maintenance Notes (from Schedule Maintenance page) */}
      <div className="mt-6 space-y-4">
        {Object.keys(notesByDate).length > 0 ? (
          Object.entries(notesByDate)
            .sort((a,b)=> new Date(b[0]) - new Date(a[0]))
            .map(([d, obj]) => (
              <div key={d} className="bg-white p-5 rounded-xl shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Scheduled: {d}</h2>
                    <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{obj.notes || '—'}</p>
                    <div className="text-sm text-gray-500 mt-2">Last updated: {obj.updatedAt ? new Date(obj.updatedAt).toLocaleString() : '—'}</div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button onClick={()=>navigate('/maintenance/schedule', { state: { mode: 'view', date: d } })} className="px-4 py-2 bg-gray-900 text-white rounded">View</button>
                    <button onClick={()=>{ navigator.clipboard?.writeText(obj.notes || '') ; alert('Notes copied to clipboard') }} className="px-4 py-2 border rounded">Copy Notes</button>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="text-center text-gray-500 py-10">
            No scheduled maintenance notes found. Click "+ Schedule Maintenance" to add one.
          </div>
        )}
      </div>

      {/* Vehicles List & Report Button */}
      <div className="mt-6 bg-white p-6 rounded-xl shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Vehicle Maintenance</h2>
          <div className="text-sm text-gray-500">{filteredVehicles.length} vehicles</div>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="text-gray-500">No vehicles found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 border text-left">Name</th>
                  <th className="p-3 border text-left">Registration</th>
                  <th className="p-3 border text-left">Model</th>
                  <th className="p-3 border text-left">Status</th>
                  <th className="p-3 border text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((v) => (
                  <tr key={v._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 border">{v.name || "—"}</td>
                    <td className="p-3 border">{v.registrationNumber || "—"}</td>
                    <td className="p-3 border">{v.vehicleModel || "—"}</td>
                    <td className="p-3 border">{v.status || "—"}</td>
                    <td className="p-3 border">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/maintenance/report?id=${v._id}`)}
                          className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm"
                        >
                          ⬇️ Report
                        </button>
                        <button
                          onClick={() => navigate(`/vehicle/${v._id}`)}
                          className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

function StatusBadge({ status }) {
  const colors = {
    Completed: "bg-green-100 text-green-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Scheduled: "bg-yellow-100 text-yellow-800",
    Overdue: "bg-red-100 text-red-800",
    Working: "bg-green-100 text-green-800",
    "In Service": "bg-yellow-100 text-yellow-800",
    Free: "bg-blue-100 text-blue-800",
  };
  return (
    <span
      className={`text-xs px-2 py-1 rounded ${colors[status] || "bg-gray-100 text-gray-800"}`}
    >
      {status || "Unknown"}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const colors = {
    Low: "bg-gray-100 text-gray-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-orange-100 text-orange-800",
    Critical: "bg-red-100 text-red-800",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[priority] || ""}`}>
      {priority}
    </span>
  );
}
