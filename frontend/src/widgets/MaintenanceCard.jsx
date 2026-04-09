import React from 'react'
export default function MaintenanceCard({it}){
  const statusTag = (s)=>{
    if(s==='Completed') return <div className="px-3 py-1 bg-green-100 text-green-800 rounded">Completed</div>
    if(s==='In Progress') return <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded">In Progress</div>
    if(s==='Scheduled') return <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded">Scheduled</div>
    return <div className="px-3 py-1 bg-red-100 text-red-800 rounded">Overdue</div>
  }
  return (
    <div className="bg-white rounded-xl card-shadow p-6 mb-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-lg font-bold">{it.title}</div>
          <div className="text-sm text-gray-500">{it.priority} • {it.vehicle}</div>
        </div>
        <div className="flex items-center gap-2">
          {statusTag(it.status)}
          <div className="text-sm text-gray-500">{it.date}</div>
        </div>
      </div>
      <div className="text-sm text-gray-600 mb-4">{it.assignedTo ? `Assigned to ${it.assignedTo}` : 'Unassigned'}</div>
      <div className="flex items-center gap-3 justify-end">
        <button className="bg-gray-900 text-white rounded py-2 px-4">View Details</button>
      </div>
    </div>
  )
}
