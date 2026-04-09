import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SalaryHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await axios.get("/api/salary/history");
        setHistory(res.data.history || []);
      } catch (err) {
        console.error("❌ Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  if (loading)
    return (
      <div className="text-center mt-10 text-gray-600">
        Loading salary history...
      </div>
    );

  // 🧩 Group by month
  const groupedByMonth = history.reduce((acc, record) => {
    const date = new Date(record.updatedAt || record.createdAt);
    const monthYear = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(record);
    return acc;
  }, {});

  // 🧮 Calculate grand total
  const grandTotal = history.reduce((sum, r) => sum + Number(r.amount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Salary History</h1>
        <div className="flex gap-3">
          <button
            onClick={() => (window.location.href = "/salary")}
            className="px-4 py-2 bg-gray-900 text-white rounded shadow"
          >
            ← Back to Salary
          </button>
          <button
            onClick={() => downloadCsv(history)}
            className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
            title="Download CSV of current salary history"
          >
            ⤓ Download Report
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 text-left">S.No</th>
              <th className="p-3 text-left">Employee Name</th>
              <th className="p-3 text-left">Employee ID</th>
              <th className="p-3 text-left">Amount (₹)</th>
              <th className="p-3 text-left">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedByMonth).length > 0 ? (
              Object.entries(groupedByMonth).map(([month, records], idx) => {
                const monthTotal = records.reduce(
                  (sum, r) => sum + Number(r.amount || 0),
                  0
                );

                return (
                  <React.Fragment key={month}>
                    {/* Month Header */}
                    <tr className="bg-gray-200">
                      <td colSpan="5" className="p-3 font-semibold text-gray-800">
                        {month}
                      </td>
                    </tr>

                    {/* Month Records */}
                    {records.map((record, index) => (
                      <tr
                        key={record._id || index}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3">
                          {index + 1 + (idx * 100)} {/* to keep numbering unique */}
                        </td>
                        <td className="p-3">{record.name}</td>
                        <td className="p-3">{record.empId}</td>
                        <td className="p-3 font-semibold text-green-700">
                          ₹{record.amount}
                        </td>
                        <td className="p-3">
                          {new Date(
                            record.updatedAt || record.createdAt
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}

                    {/* Monthly Total */}
                    <tr className="bg-green-50 border-t-2 border-green-200">
                      <td colSpan="3" className="p-3 text-right font-semibold">
                        Total for {month}:
                      </td>
                      <td colSpan="2" className="p-3 font-bold text-green-800">
                        ₹{monthTotal.toLocaleString()}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No salary history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 🧾 Grand Total */}
        {history.length > 0 && (
          <div className="text-right p-4 font-bold text-lg bg-gray-100 border-t">
            Grand Total: <span className="text-green-700">₹{grandTotal.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Generate and download CSV from history records
 */
function downloadCsv(history) {
  if (!history || history.length === 0) {
    alert('No salary records to export')
    return
  }

  const headers = ['Employee ID', 'Employee Name', 'Amount', 'Month', 'Date']
  const rows = history.map((r) => {
    const date = new Date(r.updatedAt || r.createdAt)
    return [
      (r.empId || '').toString(),
      (r.name || '').toString(),
      (r.amount || 0).toString(),
      (r.month || ''),
      isNaN(date.getTime()) ? '' : date.toISOString(),
    ]
  })

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${('' + c).replace(/"/g, '""')}"`).join(',')).join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const now = new Date().toISOString().slice(0, 10)
  a.download = `salary-report-${now}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
