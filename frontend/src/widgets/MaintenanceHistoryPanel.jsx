import React from "react";

export default function MaintenanceHistoryPanel({ vehicle, history = [] }) {
  const list = (history && history.length) ? history : [
    { id: "MH-1", title: "Routine Service", desc: "Oil change, filter replacement, brake inspection", date: "2024-09-15", mechanic: "Robert Wilson", cost: "$850", status: "completed" },
    { id: "MH-2", title: "Tire Replacement", desc: "Replaced front tires due to wear", date: "2024-08-20", mechanic: "Sarah Davis", cost: "$1200", status: "completed" },
    { id: "MH-3", title: "Engine Diagnostic", desc: "Engine performance check and tune-up", date: "2024-07-10", mechanic: "Mike Johnson", cost: "$650", status: "completed" }
  ];

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Maintenance History</h3>
      <div className="space-y-4">
        {list.map((it) => (
          <div key={it.id} className="bg-gray-50 border rounded p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg font-semibold">{it.title}</div>
                <div className="text-sm text-gray-600 mt-1">{it.desc}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Date:</div>
                <div className="font-medium">{it.date}</div>
                <div className="mt-3 px-3 py-1 bg-green-100 text-green-800 rounded text-sm">{it.status}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div><div className="text-gray-500">Mechanic:</div><div>{it.mechanic}</div></div>
              <div><div className="text-gray-500">Cost:</div><div>{it.cost}</div></div>
              <div><div className="text-gray-500">Notes:</div><div>—</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
