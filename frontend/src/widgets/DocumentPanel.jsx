import React from "react";

export default function DocumentPanel({ vehicle }) {
  // sample values; in real app these are saved to backend
  const regExpiry = vehicle.regExpiry || "2025-06-30";
  const insExpiry = vehicle.insExpiry || "2025-03-15";

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Vehicle Documents</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-gray-500 block mb-1">Registration Expiry</label>
          <div className="bg-white border rounded p-3">{regExpiry}</div>
        </div>

        <div>
          <label className="text-gray-500 block mb-1">Insurance Expiry</label>
          <div className="bg-white border rounded p-3">{insExpiry}</div>
        </div>
      </div>

      <div className="space-y-3">
        <button className="w-full bg-gray-900 text-white rounded py-3">Upload Document</button>
        <button className="w-full border rounded py-3">View All Documents</button>
      </div>
    </div>
  );
}
