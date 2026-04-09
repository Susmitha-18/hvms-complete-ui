import React from 'react'
import { useNavigate } from 'react-router-dom'
export default function VehicleCard({v}){
  const navigate = useNavigate()
  const fuelBar = (p)=>{
    const color = p>70? 'bg-green-500': p>40? 'bg-yellow-400': 'bg-red-500'
    return <div className={'h-2 rounded-full '+color} style={{width: p + '%'}}></div>
  }
  const statusTag = (s)=>{
    if(s==='Active') return <div className="badge badge-green">Active</div>
    if(s==='Maintenance') return <div className="badge badge-yellow">Maintenance</div>
    if(s==='Idle') return <div className="badge badge-blue">Idle</div>
    return <div className="badge badge-red">Out-Of-Service</div>
  }
  return (
    <div className="vehicle-card card card-shadow p-3 sm:p-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-lg font-bold">{v.id}</div>
          <div className="text-sm text-gray-500">{v.model}</div>
        </div>
        <div>{statusTag(v.status)}</div>
      </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm text-gray-600 mb-4">
        <div><div className="text-gray-500">Type:</div><div>{v.type}</div></div>
        <div><div className="text-gray-500">Mileage:</div><div>{v.mileage}</div></div>
        <div><div className="text-gray-500">Driver:</div><div>{v.driver}</div></div>
        <div><div className="text-gray-500">Location:</div><div>{v.location}</div></div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-500">Fuel: {v.fuel}%</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">{fuelBar(v.fuel)}</div>
      </div>

  <div className="flex flex-wrap items-center gap-2 sm:gap-3 vehicle-actions">
        <button
          onClick={() => navigate(`/vehicles/${encodeURIComponent(v.id)}`)}
          className="flex-1 btn"
        >
          👁️ View Details
        </button>
        <button className="p-2 border rounded">✏️</button>
      </div>
    </div>
  )
}
