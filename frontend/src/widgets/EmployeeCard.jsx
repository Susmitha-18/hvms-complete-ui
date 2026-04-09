// frontend/src/widgets/EmployeeCard.jsx
import React from "react";

export default function EmployeeCard({ emp }) {
  // emp may come from driversList in sampleData (we're reusing driver data as employees)
  return (
    <div className="bg-white rounded-xl card-shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-lg font-semibold">{emp.name}</div>
          <div className="text-sm text-gray-500">{emp.role}</div>
        </div>

        <div>
          <div className="px-3 py-1 rounded text-sm bg-green-100 text-green-800">active</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <div>
          <div className="text-gray-500">Department:</div>
          <div className="mt-1">Operations</div>
        </div>
        <div>
          <div className="text-gray-500">Employment:</div>
          <div className="mt-1">Full Time</div>
        </div>

        <div>
          <div className="text-gray-500">Base Salary:</div>
          <div className="mt-1">₹480,000/year</div>
        </div>
        <div>
          <div className="text-gray-500">Hourly Rate:</div>
          <div className="mt-1">₹250/hr</div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button className="flex-1 bg-gray-900 text-white rounded py-2">View Payroll</button>
        <button className="p-2 border rounded">Edit</button>
      </div>
    </div>
  );
}
