// frontend/src/widgets/PayrollRecords.jsx
import React from "react";

/**
 * payrolls: array of payroll objects (sampleData.salaryList)
 * Each payroll expected to have:
 *   id, name, month, base, overtime, bonuses, gross, net, status, paidOn (optional)
 */

export default function PayrollRecords({ payrolls = [] }) {
  if (!payrolls || payrolls.length === 0) {
    return <div className="text-gray-500 p-4">No payroll records found.</div>;
  }

  return (
    <div className="space-y-6">
      {payrolls.map((p) => (
        <div key={p.id} className="bg-white rounded-xl card-shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold">{p.name}</div>
              <div className="text-sm text-gray-500">{p.month}</div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={p.status} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-gray-700">
            <div>
              <div className="text-gray-500">Base Salary:</div>
              <div className="mt-1">₹{formatMoney(p.base)}</div>
            </div>
            <div>
              <div className="text-gray-500">Overtime:</div>
              <div className="mt-1">₹{formatMoney(p.overtime)}</div>
            </div>
            <div>
              <div className="text-gray-500">Bonuses:</div>
              <div className="mt-1">₹{formatMoney(p.bonuses)}</div>
            </div>
            <div>
              <div className="text-gray-500">Gross Pay:</div>
              <div className="mt-1 font-semibold">₹{formatMoney(p.gross)}</div>
            </div>
            <div>
              <div className="text-gray-500">Net Pay:</div>
              <div className="mt-1 font-semibold">₹{formatMoney(p.net)}</div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <button className="px-4 py-2 bg-gray-900 text-white rounded">View Details</button>
            <button className="px-4 py-2 border rounded">Download</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Paid: "bg-green-100 text-green-800",
    Processed: "bg-blue-100 text-blue-800",
    Pending: "bg-yellow-100 text-yellow-800",
  };
  return <div className={`px-3 py-1 rounded ${map[status] || "bg-gray-100 text-gray-700"}`}>{status}</div>;
}

function formatMoney(n) {
  if (n === undefined || n === null) return "0.00";
  return Number(n).toLocaleString();
}
