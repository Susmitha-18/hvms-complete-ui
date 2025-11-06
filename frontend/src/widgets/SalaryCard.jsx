import React from 'react'
export default function SalaryCard({it}){
  return (
    <div className="bg-white rounded-xl card-shadow p-6 mb-4 flex items-center justify-between">
      <div>
        <div className="text-lg font-bold">{it.name} <span className="ml-3 text-sm px-3 py-1 bg-green-100 text-green-800 rounded">{it.status}</span></div>
        <div className="text-sm text-gray-500">{it.month}</div>
        <div className="mt-4 grid grid-cols-3 gap-6 text-sm text-gray-600">
          <div><div className="text-gray-500">Base Salary:</div><div>₹{it.base}.00</div></div>
          <div><div className="text-gray-500">Overtime:</div><div>₹{it.overtime}.00</div></div>
          <div><div className="text-gray-500">Bonuses:</div><div>₹{it.bonuses}.00</div></div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-500">Gross Pay:</div>
        <div className="text-xl font-bold">₹{it.gross}.00</div>
        <div className="text-sm text-gray-500 mt-4">Net Pay:</div>
        <div className="text-lg font-semibold">₹{it.net}.00</div>
        <div className="mt-4 flex gap-2 justify-end">
          <button className="bg-gray-900 text-white rounded py-2 px-4">View Details</button>
          <button className="border rounded py-2 px-4">Download</button>
        </div>
      </div>
    </div>
  )
}
