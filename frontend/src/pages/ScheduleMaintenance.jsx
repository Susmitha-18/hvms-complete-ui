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
  const [date, setDate] = useState(() => incomingDate || today)
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(incomingMode === 'add')

  // Load existing notes only on initial mount or date change
  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem('hvms_maintenance_notes') || '{}')
      const entry = all[date]
      
      // In 'add' mode, always start with empty notes
      if (incomingMode === 'add') {
        setNotes('')
        setSaved(false)
      } else if (!editing) {
        // In 'view' mode, load existing notes
        setNotes(entry?.notes || '')
        setSaved(!!entry)
      }
    } catch (e) {
      console.error('Failed to load notes:', e)
    }
  }, [date, incomingMode]) // Re-run if date or mode changes

  const handleSave = ()=>{
    try {
      const all = JSON.parse(localStorage.getItem('hvms_maintenance_notes') || '{}')
      
      // Check if there's an existing note for this date when in 'add' mode
      if (incomingMode === 'add' && all[date]) {
        if (!window.confirm(`A maintenance note already exists for ${date}. Do you want to create another note?`)) {
          return
        }
        // Create a new key with timestamp to allow multiple notes per day
        const timeKey = `${date}_${new Date().getTime()}`
        all[timeKey] = { notes, updatedAt: new Date().toISOString() }
      } else {
        // Normal save for view/edit mode or new date
        all[date] = { notes, updatedAt: new Date().toISOString() }
      }
      
      localStorage.setItem('hvms_maintenance_notes', JSON.stringify(all))
      setSaved(true)
      setEditing(false)
      alert('✅ Saved maintenance note for ' + date)
    } catch(e) {
      console.error(e)
      alert('❌ Save failed')
    }
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleCancel = () => {
    if (editing && !saved) {
      // If we have unsaved changes, confirm before leaving
      if (window.confirm('Discard unsaved changes?')) {
        // Reload the original data
        const all = JSON.parse(localStorage.getItem('hvms_maintenance_notes') || '{}')
        const entry = all[date]
        setNotes(entry?.notes || '')
        setEditing(false)
      }
    } else {
      // No unsaved changes, just exit edit mode
      setEditing(false)
    }
  }

  // Handle navigation back
  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Schedule Maintenance - Notepad</h1>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <label className="block text-sm text-gray-600 mb-2">Date</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e)=>setDate(e.target.value)} 
          className="border p-2 rounded mb-4"
          readOnly={!editing} 
        />

        <label className="block text-sm text-gray-600 mb-2">Notes / Description</label>
        <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={10} className="w-full border p-3 rounded mb-4" placeholder="Type maintenance notes here..." readOnly={!editing}></textarea>

        <div className="flex gap-3">
          {editing ? (
            <>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Save Changes
              </button>
              <button onClick={handleCancel} className="px-4 py-2 border rounded hover:bg-gray-100">
                Cancel Edit
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleEdit} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit Notes
              </button>
              <button 
                onClick={handleBack} 
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Back
              </button>
            </>
          )}

          {saved && <div className="text-sm text-green-700 self-center">Saved</div>}
        </div>
      </div>
    </div>
  )
}
