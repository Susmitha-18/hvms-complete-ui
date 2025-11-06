// frontend/src/pages/DriverDashboard.jsx
import React from "react";

export default function DriverDashboard() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold mb-4">Driver Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome, <strong>Driver</strong> — view your assigned vehicle, salary info, and recent jobs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assigned Vehicle Card */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <h2 className="text-lg font-semibold mb-2">🚛 Assigned Vehicle</h2>
          <p className="text-sm text-gray-500 mb-3">
            Check your active assignment and current vehicle status.
          </p>
          <a href="/vehicle-history" className="text-yellow-600 font-medium hover:underline">
            View Vehicle History →
          </a>
        </div>

        {/* Salary Details Card */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <h2 className="text-lg font-semibold mb-2">💰 Salary Details</h2>
          <p className="text-sm text-gray-500 mb-3">
            Review your salary, payments, and performance bonuses.
          </p>
          <a href="/salary" className="text-yellow-600 font-medium hover:underline">
            Go to Salary →
          </a>
        </div>
      </div>
    </div>
  );
}
