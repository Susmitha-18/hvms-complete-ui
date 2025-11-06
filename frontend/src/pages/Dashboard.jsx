import React, { useEffect, useState } from 'react'
import axios from 'axios'
import MapCard from '../widgets/MapCard'
import StatCard from '../components/StatCard'
import QuickActions from '../widgets/QuickActions'
import SystemOverview from '../widgets/SystemOverview'

export default function Dashboard(){
  const [data, setData] = useState(null)

  useEffect(()=>{
    const load = async ()=>{
      try{
        const res = await axios.get('/api/dashboard')
        setData(res.data)
      }catch(err){
        const sample = await import('../data/sampleData.js')
        setData(sample.dashboardSample)
      }
    }
    load()
  },[])

  if(!data) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-extrabold">Welcome back, <span className="text-gray-800">{data.welcomeUser}</span></h1>
        <p className="text-gray-500 mt-1">Fleet operations overview and management dashboard</p>
      </div>

      <MapCard vehicles={data.vehicles} lastUpdatedText="Last updated: 2 minutes ago" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Fleet Status" value={`${data.fleetCount.active}/${data.fleetCount.total}`} icon="🚚" />
        <StatCard title="Driver Availability" value={`${data.driversCount.available}/${data.driversCount.total}`} icon="👨‍✈️" />
        <StatCard title="Maintenance Alerts" value={data.maintenanceAlerts} icon="🛠️" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><QuickActions /></div>
        <div><SystemOverview fleet={data.fleetCount} drivers={data.driversCount} maintenance={data.maintenanceAlerts} /></div>
      </div>
    </div>
  )
}
