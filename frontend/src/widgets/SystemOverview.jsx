import React from 'react'
export default function SystemOverview({fleet,drivers,maintenance}){
  return (
    <div className="card card-shadow p-6">
      <h4 className="text-lg font-semibold mb-4">System Overview</h4>
      <div className="space-y-3">
        <div className="flex items-center justify-between"><div>Fleet Status</div><div className="px-3 py-1 bg-gray-900 text-white rounded">{fleet.active}/{fleet.total}</div></div>
        <div className="flex items-center justify-between"><div>Available Drivers</div><div className="px-3 py-1 bg-gray-900 text-white rounded">{drivers.available}</div></div>
        <div className="flex items-center justify-between"><div>Maintenance Alerts</div><div className="px-3 py-1 badge badge-red">{maintenance}</div></div>
        <div className="mt-4"><button className="w-full bg-black text-white rounded py-2">$ Client Management</button></div>
      </div>
    </div>
  )
}
