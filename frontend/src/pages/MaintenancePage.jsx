import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'
import MaintenanceRecords from "./MaintenanceRecords";
import MaintenanceAlerts from "./MaintenanceAlerts";

export default function MaintenancePage() {
  const [tab, setTab] = useState("records");

  const navigate = useNavigate()

  return (
    <div className="px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Maintenance Management</h1>
        <button onClick={()=>navigate('/maintenance/schedule', { state: { mode: 'add' } })} className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800">
          + Schedule Maintenance
        </button>
      </div>

      <p className="text-gray-500 mb-6">
        Track vehicle maintenance schedules, repairs, and service history
      </p>

      {/* Tabs */}
      <div className="flex bg-gray-200 rounded-lg overflow-hidden mb-8">
        <button
          className={`flex-1 py-2 font-medium ${
            tab === "records" ? "bg-gray-900 text-white" : "text-gray-700"
          }`}
          onClick={() => setTab("records")}
        >
          Maintenance Records
        </button>
        <button
          className={`flex-1 py-2 font-medium ${
            tab === "alerts" ? "bg-gray-900 text-white" : "text-gray-700"
          }`}
          onClick={() => setTab("alerts")}
        >
          Alerts & Reminders
        </button>
      </div>

      {/* Tab Content */}
      {tab === "records" ? <MaintenanceRecords /> : <MaintenanceAlerts />}
    </div>
  );
}
