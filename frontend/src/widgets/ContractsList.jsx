// frontend/src/widgets/ContractsList.jsx
import React from 'react'

export default function ContractsList({ contracts = [] }){
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Active Contracts</h3>
      <div className="space-y-4">
        {contracts.map(ct => (
          <div key={ct.id} className="bg-white rounded-xl card-shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg font-semibold">{ct.title}</div>
                <div className="text-sm text-gray-500">{ct.clientName}</div>
                <div className="text-sm text-gray-600 mt-3">{ct.description}</div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
                  <div><div className="text-gray-500">Start Date:</div><div>{ct.startDate}</div></div>
                  <div><div className="text-gray-500">End Date:</div><div>{ct.endDate}</div></div>
                  <div><div className="text-gray-500">Services:</div><div>{(ct.services||[]).join(', ')}</div></div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">Status</div>
                <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded inline-block">{ct.status}</div>
                <div className="text-2xl font-bold mt-4">{ct.value}</div>
                <div className="mt-4 flex gap-2 justify-end">
                  <button className="bg-gray-900 text-white rounded py-2 px-4">View Contract</button>
                  <button className="border rounded py-2 px-3">View Jobs</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
