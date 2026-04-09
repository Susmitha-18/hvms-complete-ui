import React from "react";

export default function VehicleOverview({ vehicle }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Vehicle Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div><strong>Vehicle ID:</strong> {vehicle.id}</div>
          <div><strong>Model:</strong> {vehicle.model}</div>
          <div><strong>Type:</strong> {vehicle.type}</div>
          <div><strong>Mileage:</strong> {vehicle.mileage || "—"}</div>
          <div><strong>Assigned Driver:</strong> {vehicle.driver || "—"}</div>
        </div>

        <div className="space-y-3">
          <div><strong>Location:</strong> {vehicle.location || "—"}</div>
          <div><strong>Fuel Level:</strong> {vehicle.fuel != null ? `${vehicle.fuel}%` : "—"}</div>
          <div><strong>Status:</strong> {vehicle.status}</div>
          <div><strong>Last Maintenance:</strong> {vehicle.lastMaintenance || "2024-09-15"}</div>
        </div>
      </div>

      <div className="mt-6 border-t pt-6">
        <h4 className="font-semibold mb-2">Quick Actions</h4>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-900 text-white rounded">View Full History</button>
          <button className="px-4 py-2 border rounded">Schedule Maintenance</button>
        </div>
      </div>
    </div>
  );
}
