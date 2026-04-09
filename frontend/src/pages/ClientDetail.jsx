// frontend/src/pages/ClientDetail.jsx
import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { clientsList } from '../data/sampleData'

export default function ClientDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const client = useMemo(()=> clientsList.find(c=>c.id===id) || clientsList[0], [id])

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={()=>navigate('/clients')} className="px-4 py-2 border rounded text-gray-700">← Back to Clients</button>
          <h2 className="text-3xl font-bold mt-4">{client.name}</h2>
          <div className="text-gray-500 mt-1">{client.industry} • {client.contactName}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 bg-green-100 text-green-800 rounded">{client.status}</div>
          <button className="px-4 py-2 bg-gray-900 text-white rounded">Edit Client</button>
        </div>
      </div>

      <div className="bg-white rounded-xl card-shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-500">Contact</div>
            <div className="font-semibold mt-1">{client.contactName}</div>
            <div className="text-sm text-gray-700 mt-2">{client.email}</div>
            <div className="text-sm text-gray-700">{client.phone}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Address</div>
            <div className="mt-1 text-sm text-gray-700">{client.address}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Contract Value</div>
            <div className="text-xl font-bold mt-1">{client.contractValue}</div>
            <div className="text-sm text-gray-500 mt-3">Total Jobs: {client.totalJobs}</div>
            <div className="text-sm text-gray-500">Payment Terms: {client.paymentTerms}</div>
          </div>
        </div>

        <div className="mt-6 border-t pt-6">
          <h4 className="text-lg font-semibold mb-2">Notes & Activities</h4>
          <p className="text-sm text-gray-600">No recent activities recorded (sample data).</p>
        </div>
      </div>
    </div>
  )
}
