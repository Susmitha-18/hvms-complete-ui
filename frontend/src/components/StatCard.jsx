import React from 'react'
export default function StatCard({title, value, icon}){
  return (
    <div className="bg-white rounded-xl card-shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">{title}</div>
          <div className="text-2xl font-bold mt-2">{value}</div>
        </div>
        <div className="text-3xl text-gray-300">{icon}</div>
      </div>
    </div>
  )
}
