// frontend/src/widgets/ClientsOverview.jsx
import React from 'react'

export default function ClientsOverview({ clients = [], contracts = [] }){
  const totalClients = clients.length
  const activeContracts = contracts.filter(c=>c.status==='active').length
  const totalRevenue = contracts.reduce((s,c)=>{
    // attempts to parse crores like '₹24.00Cr' -> number 24
    const m = (c.value||'').match(/([0-9,.]+)/)
    return s + (m ? parseFloat(m[1].replace(/,/g,'')) : 0)
  }, 0)
  const avgContract = (contracts.length ? (totalRevenue / contracts.length).toFixed(2) : 0)

  // top clients by contract value (using clients contractValue if present)
  const ranked = clients.slice().sort((a,b)=>{
    const pa = parseFloat((a.contractValue||'').replace(/[₹,Cr ]/g,'')) || 0
    const pb = parseFloat((b.contractValue||'').replace(/[₹,Cr ]/g,'')) || 0
    return pb - pa
  }).slice(0,3)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Total Clients" value={totalClients} icon="🏢" />
        <MetricCard title="Active Contracts" value={activeContracts} icon="📄" />
        <MetricCard title="Total Revenue" value={`₹${totalRevenue.toFixed(2)}Cr`} icon="💰" />
        <MetricCard title="Avg Contract" value={`₹${avgContract}Cr`} icon="📈" />
      </div>

      <div className="bg-white rounded-xl card-shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Top Clients by Contract Value</h3>
        <div className="space-y-4">
          {ranked.map((c)=>(
            <div key={c.id} className="p-4 border rounded flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-hvmsYellow rounded flex items-center justify-center text-2xl">🏢</div>
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-500">{c.industry}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{c.contractValue}</div>
                <div className="text-sm text-gray-500">{c.totalJobs} jobs completed</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon }){
  return (
    <div className="bg-white rounded-xl card-shadow p-6 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold mt-2">{value}</div>
      </div>
      <div className="text-3xl text-gray-300">{icon}</div>
    </div>
  )
}
