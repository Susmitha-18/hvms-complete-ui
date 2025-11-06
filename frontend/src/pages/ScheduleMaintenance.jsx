import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

export default function ScheduleMaintenance() {
  const navigate = useNavigate()
  const location = useLocation()

  // mode can be 'add' or 'view' (default add)
  const incomingMode = location.state?.mode || 'add'
  const incomingDate = location.state?.date || null

  // default date is today when adding
  const today = new Date().toISOString().slice(0,10)
  const [date, setDate] = useState(() => incomingMode === 'add' ? (incomingDate || today) : (incomingDate || today))
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(incomingMode === 'add')

  // load existing for this date only when viewing (or when date changes and not in add-new editing state)
  useEffect(()=>{
    try{
      const all = JSON.parse(localStorage.getItem('hvms_maintenance_notes') || '{}')
      const entry = all[date]
      if(incomingMode === 'view'){
        setNotes(entry?.notes || '')
        setSaved(!!entry)
        setEditing(false)
      } else {
        // add mode: start with empty notes if explicitly adding a new one
        if(!editing){
          setNotes(entry?.notes || '')
          setSaved(!!entry)
        } else {
          // keep notes empty for a fresh add (do not auto-load existing)
          setNotes('')
          setSaved(false)
        }
      }
    }catch(e){console.error(e)}
  },[date, incomingMode, editing])

  const handleSave = ()=>{
    try{
      const all = JSON.parse(localStorage.getItem('hvms_maintenance_notes') || '{}')
      all[date] = { notes, updatedAt: new Date().toISOString() }
      localStorage.setItem('hvms_maintenance_notes', JSON.stringify(all))
      setSaved(true)
      setEditing(false)
      alert('Saved maintenance note for ' + date)
    }catch(e){console.error(e); alert('Save failed')}
  }

  const handleEdit = ()=>{
    setEditing(true)
  }

  const handleCancel = ()=>{
    // go back to previous page
    navigate(-1)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Schedule Maintenance - Notepad</h1>
        <button onClick={()=>navigate(-1)} className="px-3 py-2 border rounded">\u2190 Back</button>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <label className="block text-sm text-gray-600 mb-2">Date</label>
        <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="border p-2 rounded mb-4" />

        <label className="block text-sm text-gray-600 mb-2">Notes / Description</label>
        <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={10} className="w-full border p-3 rounded mb-4" placeholder="Type maintenance notes here..." readOnly={!editing}></textarea>

        <div className="flex gap-3">
          {editing ? (
            <>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
              <button onClick={handleCancel} className="px-4 py-2 border rounded">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={handleEdit} className="px-4 py-2 border rounded">Edit</button>
              <button onClick={()=>navigate(-1)} className="px-4 py-2 border rounded">Back</button>
            </>
          )}

          {saved && <div className="text-sm text-green-700 self-center">Saved</div>}
        </div>
      </div>
    </div>
  )
}
