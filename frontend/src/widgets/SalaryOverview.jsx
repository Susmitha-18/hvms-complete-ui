import React from "react";

export default function SalaryOverview({ payrolls = [], employees = [] }) {
  const totalEmployees = employees.length || 0;
  const totalGross = payrolls.reduce((sum, p) => sum + (p.gross || 0), 0);
  const avgSalary = payrolls.length ? (totalGross / payrolls.length).toFixed(2) : 0;

  const months = [
    { month: "September 2024", employees: totalEmployees, gross: "₹2,850,000", net: "₹2,350,000", deductions: "₹500,000", status: "Completed" },
    { month: "October 2024", employees: totalEmployees, gross: "₹2,900,000", net: "₹2,400,000", deductions: "₹500,000", status: "Processing" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Employees" value={totalEmployees} icon="👥" />
        <MetricCard title="Monthly Payroll" value="₹29L" icon="💲" />
        <MetricCard title="Avg. Salary" value="₹5.5L" icon="📈" />
      </div>


      {/* <div className="bg-white rounded-xl card-shadow p-6">
        <h3 className="text-2xl font-semibold mb-4">Payroll Summary</h3>
        <div className="space-y-4">
          {months.map((m) => (
            <div key={m.month} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xl font-semibold">{m.month}</div>
                  <div className="text-sm text-gray-500 mt-2">Employees: <span className="text-gray-800">{m.employees}</span></div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Gross Pay:</div>
                  <div className="font-semibold text-lg">{m.gross}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Net Pay:</div>
                  <div className="font-semibold text-lg">{m.net}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Deductions:</div>
                  <div className="font-semibold text-lg">{m.deductions}</div>
                </div>
                <div className="ml-6">
                  <StatusBadge status={m.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}

function MetricCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-xl card-shadow p-6 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold mt-2">{value}</div>
      </div>
      <div className="text-3xl text-gray-300">{icon}</div>
    </div>
  );
}

function StatusBadge({ status = "Completed" }) {
  const cls =
    status === "Completed" ? "bg-green-100 text-green-800" :
    status === "Processing" ? "bg-blue-100 text-blue-800" :
    "bg-yellow-100 text-yellow-800";
  return <div className={`px-3 py-1 rounded ${cls}`}>{status}</div>;
}
