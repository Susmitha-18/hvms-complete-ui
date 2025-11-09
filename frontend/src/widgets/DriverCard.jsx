import React from 'react'
export default function DriverCard({d}){
  const statusTag = (s)=>{
    if(s==='Assigned') return <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded">Assigned</div>
    if(s==='Available') return <div className="px-3 py-1 bg-green-100 text-green-800 rounded">Available</div>
    return <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded">On Leave</div>
  }
  return (
    <div className="bg-white rounded-xl card-shadow p-6">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-lg font-bold">{d.name}</div>
          <div className="text-sm text-gray-500">{d.role}</div>
        </div>
        <div>{statusTag(d.status)}</div>
      </div>
      <div className="text-sm text-gray-600 mb-4">
        <div>{d.id}</div>
        <div className="mt-2">{d.phone}</div>
        <div>{d.email}</div>
        <div className="mt-2">{d.location}</div>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex-1 bg-gray-900 text-white rounded py-2">👁️ View Profile</button>
        <button className="p-2 border rounded">✏️</button>
      </div>
    </div>
  )
}
