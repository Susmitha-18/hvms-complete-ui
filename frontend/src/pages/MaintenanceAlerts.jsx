import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'

export default function MaintenanceAlerts() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState([])

  useEffect(()=>{
    try{
      const all = JSON.parse(localStorage.getItem('hvms_maintenance_notes') || '{}')
      const now = new Date()
      const out = []
      Object.entries(all).forEach(([date, obj])=>{
        const d = new Date(date)
        const diffDays = Math.ceil((d - now) / (1000*60*60*24))
        // show alerts for next 30 days (including past due)
        if(diffDays <= 30) {
          out.push({ date, notes: obj.notes, daysUntil: diffDays })
        }
      })
      setAlerts(out.sort((a,b)=> a.daysUntil - b.daysUntil))
    }catch(e){ setAlerts([]) }
  },[])

  const dismiss = (date)=>{
    try{
      const all = JSON.parse(localStorage.getItem('hvms_maintenance_notes') || '{}')
      delete all[date]
      localStorage.setItem('hvms_maintenance_notes', JSON.stringify(all))
      setAlerts((s)=>s.filter(x=>x.date !== date))
    }catch(e){console.error(e)}
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">⚠️ Maintenance Alerts & Reminders</h2>
        <div className="space-y-4">
          {alerts.length > 0 ? alerts.map((a)=> (
            <div key={a.date} className="p-4 bg-gray-50 border rounded-lg flex justify-between items-center">
              <div>
                <div className="font-semibold text-lg text-gray-800">Maintenance on {a.date}</div>
                <div className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{a.notes || '—'}</div>
                <div className="text-sm text-gray-500 mt-2">{a.daysUntil < 0 ? `${Math.abs(a.daysUntil)} days overdue` : `${a.daysUntil} days remaining`}</div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={()=>navigate('/maintenance/schedule', { state: { mode: 'view', date: a.date } })} className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800">View</button>
                <button onClick={()=>dismiss(a.date)} className="border px-4 py-2 rounded-lg hover:bg-gray-100">Dismiss</button>
              </div>
            </div>
          )) : (
            <div className="text-center text-gray-500 py-10">No upcoming maintenance alerts (next 30 days).</div>
          )}
        </div>
      </div>
    </div>
  )
}
