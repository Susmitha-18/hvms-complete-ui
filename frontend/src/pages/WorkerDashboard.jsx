import React from 'react'

export default function WorkerDashboard() {
  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-8 mt-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        👷 Worker Dashboard
      </h1>
      <p className="text-gray-600">
        Welcome, Driver! Here you can view your assigned vehicles, trips, and schedules.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-yellow-100 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Assigned Vehicles</h2>
          <p className="text-3xl font-bold text-gray-900">2</p>
        </div>

        <div className="bg-green-100 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Active Trips</h2>
          <p className="text-3xl font-bold text-gray-900">1</p>
        </div>

        <div className="bg-blue-100 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Completed Jobs</h2>
          <p className="text-3xl font-bold text-gray-900">14</p>
        </div>
      </div>
    </div>
  )
}
