import React, { useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function VehicleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Vehicle static/basic info (you can later fetch this from an API)
  const [vehicleData] = useState({
    plateNumber: "HV-001-TX",
    modelYear: "Volvo FH16 (2022)",
    vin: "1HGBH41JXMN109186",
    engine: "D13TC 500HP",
    capacity: "40 tons",
    mileage: "125,000 miles",
    status: "Active",
  });

  // === Shared state for all tabs (lifted to parent for Overview aggregation) ===
  const [operations, setOperations] = useState([]); // tracking tab (operation records)
  const [maintenanceRecords, setMaintenanceRecords] = useState([]); // maintenance tab
  const [documents, setDocuments] = useState([]); // documents tab

  // Current tab
  const [tab, setTab] = useState("overview");

  return (
    <div className="px-6 py-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/vehicles")}
        className="border rounded px-4 py-2 mb-6 hover:bg-gray-50"
      >
        ← Back to Vehicles
      </button>

      {/* Top Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{vehicleData.plateNumber}</h1>
          <p className="text-gray-500">{vehicleData.modelYear}</p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded ${
              vehicleData.status === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {vehicleData.status}
          </span>

          {/* Show "+ Add Documents" only on overview & other non-maintenance/tracking/doc tabs */}
          {tab !== "documents" &&
            tab !== "maintenance" &&
            tab !== "tracking" && (
              <button
                onClick={() => setTab("documents")}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900"
              >
                + Add Documents
              </button>
            )}
        </div>
      </div>
  

      {/* Tabs */}
      <div className="flex mt-6 bg-gray-100 rounded overflow-hidden">
        {["overview", "tracking", "maintenance", "documents"].map((t) => (
          <button
            key={t}
            className={`flex-1 py-2 ${
              tab === t ? "bg-black text-white" : "hover:bg-gray-200"
            }`}
            onClick={() => setTab(t)}
          >
            {t === "overview"
              ? "Overview"
              : t === "tracking"
              ? "Operation History"
              : t === "maintenance"
              ? "Maintenance"
              : "Documents"}
          </button>
        ))}
      </div>

      {/* Tabs content */}
      
      {tab === "overview" && (
        <OverviewTab
          vehicleData={vehicleData}
          operations={operations}
          maintenanceRecords={maintenanceRecords}
          documents={documents}
        />
      )}
      {tab === "tracking" && (
        <TrackingTab operations={operations} setOperations={setOperations} />
      )}
      {tab === "maintenance" && (
        <MaintenanceTab
          maintenanceRecords={maintenanceRecords}
          setMaintenanceRecords={setMaintenanceRecords}
        />
      )}
      {tab === "documents" && (
        <DocumentsTab documents={documents} setDocuments={setDocuments} />
      )}
    </div>
  );
}

/* ===========================
   Overview Tab (dashboard)
   =========================== */// place this above OverviewTab
function TopDriver({ operations }) {
  const driverCount = useMemo(() => {
    const map = {};
    operations.forEach((o) => {
      const d = (o.driver || "").trim();
      if (!d) return;
      map[d] = (map[d] || 0) + 1;
    });
    const entries = Object.entries(map);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0]; // [driver, count]
  }, [operations]);

  if (!driverCount) return <div className="text-sm text-gray-500 mt-2">No drivers yet</div>;
  return (
    <div className="mt-2">
      <div className="font-semibold">{driverCount[0]}</div>
      <div className="text-sm text-gray-600">{driverCount[1]} assignments</div>
    </div>
  );
}

function OverviewTab({ vehicleData, operations, maintenanceRecords, documents }) {
  // Notepad state + refs (kept inside OverviewTab)
  const [noteText, setNoteText] = useState("");
  const [noteFile, setNoteFile] = useState(null);
  const [savedNotes, setSavedNotes] = useState([]);
  const noteFileInputRef = useRef(null);

  const handleSaveNote = () => {
    if (!noteText && !noteFile) {
      alert("⚠️ Please enter some text or upload a file.");
      return;
    }
    setSavedNotes((s) => [...s, { text: noteText, file: noteFile }]);
    setNoteText("");
    setNoteFile(null);
    // reset input value so same file can be selected again if needed
    if (noteFileInputRef.current) noteFileInputRef.current.value = "";
  };

  const handleDeleteNote = (index) => {
    if (!window.confirm("🗑️ Delete this note?")) return;
    setSavedNotes((s) => s.filter((_, i) => i !== index));
  };

  // Derived metrics (auto-update because they use props/state)
  const maintenanceCount = maintenanceRecords.length;
  const operationsCount = operations.length;
  const totalWorkingHours = useMemo(() => {
    return operations.reduce((sum, op) => {
      const h = parseFloat(op.hoursWorked) || 0;
      return sum + h;
    }, 0);
  }, [operations]);

  const maintenanceCostTotal = useMemo(() => {
    return maintenanceRecords.reduce((sum, r) => {
      const c = parseFloat(r.cost) || 0;
      return sum + c;
    }, 0);
  }, [maintenanceRecords]);

  const uniqueClientsCount = useMemo(() => {
    const set = new Set(operations.map((o) => (o.clientName || "").trim() || null));
    set.delete(null);
    return set.size;
  }, [operations]);

  const lastMaintenance = useMemo(() => {
    if (maintenanceRecords.length === 0) return null;
    const sorted = [...maintenanceRecords].sort(
      (a, b) => new Date(b.serviceDate) - new Date(a.serviceDate)
    );
    return sorted[0];
  }, [maintenanceRecords]);

  const lastOperation = useMemo(() => {
    if (operations.length === 0) return null;
    const sorted = [...operations].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0];
  }, [operations]);

  const lastDriver = lastOperation ? lastOperation.driver : lastMaintenance ? lastMaintenance.mechanic : null;

  // upcoming document expiry within 30 days
  const upcomingExpiries = useMemo(() => {
    const now = new Date();
    const in30 = new Date();
    in30.setDate(now.getDate() + 30);
    return documents.filter((d) => {
      if (!d.expiry) return false;
      const ex = new Date(d.expiry);
      return ex >= now && ex <= in30;
    });
  }, [documents]);

  // simple health status calculation
  const healthStatus = useMemo(() => {
    if (maintenanceCount === 0) return { label: "No Maintenance Records", color: "yellow" };
    if (maintenanceCostTotal > 50000) return { label: "Needs Attention", color: "red" };
    if (totalWorkingHours > 200) return { label: "High Utilization", color: "green" };
    return { label: "Normal", color: "green" };
  }, [maintenanceCount, maintenanceCostTotal, totalWorkingHours]);

  return (
    <div className="mt-6 space-y-6">
      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Maintenance Done</div>
              <div className="text-2xl font-bold">{maintenanceCount}</div>
            </div>
            <div className="bg-yellow-50 text-yellow-700 rounded-full w-12 h-12 flex items-center justify-center text-xl">
              🛠️
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-2">Total Cost: ₹{maintenanceCostTotal}</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Work Assignments</div>
              <div className="text-2xl font-bold">{operationsCount}</div>
            </div>
            <div className="bg-blue-50 text-blue-700 rounded-full w-12 h-12 flex items-center justify-center text-xl">
              🚜
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-2">Clients Served: {uniqueClientsCount}</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total Working Hours</div>
              <div className="text-2xl font-bold">{totalWorkingHours.toFixed(2)} hrs</div>
            </div>
            <div className="bg-green-50 text-green-700 rounded-full w-12 h-12 flex items-center justify-center text-xl">
              ⏱️
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-2">Vehicle: {vehicleData.plateNumber}</div>
        </div>
      </div>

      {/* Health & Last Activity Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-lg ${healthStatus.color === "red" ? "bg-red-100 text-red-700" : healthStatus.color === "yellow" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
            {healthStatus.color === "red" ? "🔴" : healthStatus.color === "yellow" ? "🟡" : "🟢"}
          </div>
          <div>
            <div className="text-sm text-gray-500">Vehicle Health</div>
            <div className="text-lg font-semibold">{healthStatus.label}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500">Last Maintenance</div>
          {lastMaintenance ? (
            <>
              <div className="font-semibold">{lastMaintenance.serviceType}</div>
              <div className="text-sm text-gray-600">Date: {lastMaintenance.serviceDate}</div>
              <div className="text-sm text-gray-600">By: {lastMaintenance.mechanic}</div>
            </>
          ) : (
            <div className="text-sm text-gray-600">No maintenance found</div>
          )}
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500">Last Operation</div>
          {lastOperation ? (
            <>
              <div className="font-semibold">{lastOperation.siteName} ({lastOperation.clientName})</div>
              <div className="text-sm text-gray-600">Date: {lastOperation.date}</div>
              <div className="text-sm text-gray-600">Driver: {lastOperation.driver}</div>
            </>
          ) : (
            <div className="text-sm text-gray-600">No operations found</div>
          )}
        </div>
      </div>

      {/* Upcoming Expiries & Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500">Upcoming Document Expiries (30 days)</div>
          {upcomingExpiries.length === 0 ? (
            <div className="text-sm text-gray-600 mt-2">No upcoming expiries</div>
          ) : (
            upcomingExpiries.map((d, i) => (
              <div key={i} className="mt-2">
                <div className="font-semibold">{d.name}</div>
                <div className="text-sm text-gray-600">Expiry: {d.expiry}</div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500">Top Driver (most trips)</div>
          <TopDriver operations={operations} />
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500">Quick Numbers</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="font-bold">{maintenanceCount}</div>
              <div className="text-xs text-gray-500">Maint.</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{operationsCount}</div>
              <div className="text-xs text-gray-500">Ops</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{uniqueClientsCount}</div>
              <div className="text-xs text-gray-500">Clients</div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- NOTEPAD: place at the end of Overview ---------- */}
      <div className="bg-white rounded-lg p-4 shadow-sm mt-6">
        <h3 className="text-lg font-semibold mb-3">📝 Vehicle Notes</h3>
        <p className="text-sm text-gray-500 mb-3">Add quick notes or upload related files (like inspection reports, photos, etc.)</p>

        <div className="space-y-3">
          <textarea
            placeholder="Type your notes or descriptions here..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full border rounded p-2 text-sm"
            rows={4}
          ></textarea>

          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => noteFileInputRef.current && noteFileInputRef.current.click()}
                className="text-blue-600 underline"
                type="button"
              >
                📎 Upload File
              </button>
              <input
                type="file"
                ref={noteFileInputRef}
                onChange={(e) => setNoteFile(e.target.files && e.target.files[0])}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.docx"
              />
              {noteFile && <p className="text-green-700 text-sm mt-1">✅ {noteFile.name}</p>}
            </div>

            <button
              onClick={handleSaveNote}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              type="button"
            >
              💾 Save Note
            </button>
          </div>
        </div>

        {savedNotes.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <h4 className="font-semibold text-gray-700 mb-2">📚 Saved Notes</h4>
            <ul className="space-y-2 text-sm">
              {savedNotes.map((note, index) => (
                <li
                  key={index}
                  className="border rounded p-2 flex justify-between items-center"
                >
                  <div>
                    <p className="text-gray-800">{note.text}</p>
                    {note.file && (
                      <a
                        href={URL.createObjectURL(note.file)}
                        download={note.file.name}
                        className="text-blue-600 text-xs underline"
                      >
                        ⬇️ {note.file.name}
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteNote(index)}
                    className="text-red-600 text-xs hover:underline"
                    type="button"
                  >
                    🗑 Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}


/* ===========================
   Tracking Tab (Operations)
   =========================== */
function TrackingTab({ operations, setOperations }) {
  const [newOp, setNewOp] = useState({
    date: "",
    clientName: "",
    siteName: "",
    siteAddress: "",
    startTime: "",
    endTime: "",
    driver: "",
    hoursWorked: "",
    reportFile: null,
  });
  const fileInputRef = useRef(null);

  const calculateHours = (start, end) => {
    if (!start || !end) return "";
    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);
    const diff = (endTime - startTime) / (1000 * 60 * 60);
    return diff > 0 ? diff.toFixed(2) : "0.00";
  };

  // upload
  const handleFileSelect = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setNewOp({ ...newOp, reportFile: file });
  };

  const handleAddOperation = () => {
    const { date, clientName, siteName, siteAddress, startTime, endTime, driver } = newOp;
    if (!date || !clientName || !siteName || !siteAddress || !startTime || !endTime || !driver) {
      alert("⚠️ Please fill all required fields before saving.");
      return;
    }
    const hours = calculateHours(startTime, endTime);
    setOperations([...operations, { ...newOp, hoursWorked: hours, isEditing: false }]);
    setNewOp({
      date: "",
      clientName: "",
      siteName: "",
      siteAddress: "",
      startTime: "",
      endTime: "",
      driver: "",
      hoursWorked: "",
      reportFile: null,
    });
  };

  const handleEdit = (index) => {
    const updated = [...operations];
    updated[index].isEditing = true;
    setOperations(updated);
  };

  const handleSave = (index) => {
    const updated = [...operations];
    updated[index].hoursWorked = calculateHours(updated[index].startTime, updated[index].endTime);
    updated[index].isEditing = false;
    setOperations(updated);
  };

  const handleDelete = (index) => {
    if (!window.confirm("🗑️ Delete this operation record?")) return;
    setOperations(operations.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...operations];
    updated[index][field] = value;
    setOperations(updated);
  };

  return (
    <div className="mt-6 bg-gray-50 border rounded-lg p-6 text-gray-800">
      <h3 className="text-xl font-semibold mb-4">🚜 Vehicle Operation History</h3>
      <p className="text-sm text-gray-600 mb-4">Records of site operations, hours worked and driver.</p>

      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx" />

      <div className="mb-6 border rounded-lg bg-white p-4">
        <h4 className="font-semibold mb-3">Add New Work Record</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <input type="date" value={newOp.date} onChange={(e) => setNewOp({ ...newOp, date: e.target.value })} className="border px-2 py-1 rounded w-full" />
          <input type="text" placeholder="Client Name" value={newOp.clientName} onChange={(e) => setNewOp({ ...newOp, clientName: e.target.value })} className="border px-2 py-1 rounded w-full" />
          <input type="text" placeholder="Site / Project Name" value={newOp.siteName} onChange={(e) => setNewOp({ ...newOp, siteName: e.target.value })} className="border px-2 py-1 rounded w-full" />
          <input type="text" placeholder="Site Address / Location" value={newOp.siteAddress} onChange={(e) => setNewOp({ ...newOp, siteAddress: e.target.value })} className="border px-2 py-1 rounded w-full" />
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="text-gray-600 text-sm">Starting Time:</label>
            <input type="time" value={newOp.startTime} onChange={(e) => setNewOp({ ...newOp, startTime: e.target.value })} className="border px-2 py-1 rounded w-full" />
          </div>
          <div>
            <label className="text-gray-600 text-sm">Ending Time:</label>
            <input type="time" value={newOp.endTime} onChange={(e) => setNewOp({ ...newOp, endTime: e.target.value })} className="border px-2 py-1 rounded w-full" />
          </div>
        </div>

        <input type="text" placeholder="Driver Name" value={newOp.driver} onChange={(e) => setNewOp({ ...newOp, driver: e.target.value })} className="border px-2 py-1 rounded w-full mt-3" />

        <div className="flex justify-between items-center mt-3">
          <button onClick={handleFileSelect} className="text-blue-600 underline">📎 Upload Work Report</button>
          {newOp.reportFile && <span className="text-sm text-green-700">✅ {newOp.reportFile.name}</span>}
        </div>

        <button onClick={handleAddOperation} className="w-full bg-green-600 text-white py-2 mt-4 rounded hover:bg-green-700">💾 Save Work Record</button>
      </div>

      <h4 className="font-semibold text-lg mb-3">📅 Past Week Operations</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {operations.length === 0 && <p className="text-gray-500">No work history available for this vehicle.</p>}
        {operations.map((op, i) => (
          <div key={i} className="border rounded-lg bg-white p-4 shadow-sm flex flex-col justify-between">
            {op.isEditing ? (
              <>
                <input type="date" value={op.date} onChange={(e) => handleChange(i, "date", e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
                <input type="text" value={op.clientName} onChange={(e) => handleChange(i, "clientName", e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
                <input type="text" value={op.siteName} onChange={(e) => handleChange(i, "siteName", e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
                <input type="text" value={op.siteAddress} onChange={(e) => handleChange(i, "siteAddress", e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
                <input type="time" value={op.startTime} onChange={(e) => handleChange(i, "startTime", e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
                <input type="time" value={op.endTime} onChange={(e) => handleChange(i, "endTime", e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
                <input type="text" value={op.driver} onChange={(e) => handleChange(i, "driver", e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
                <button onClick={() => handleSave(i)} className="bg-green-600 text-white py-1 rounded hover:bg-green-700 w-full">💾 Save</button>
              </>
            ) : (
              <>
                <h4 className="font-semibold text-lg mb-1">{op.siteName} — {op.date}</h4>
                <p className="text-gray-600 text-sm mb-1">Client: <strong>{op.clientName}</strong></p>
                <p className="text-gray-600 text-sm mb-1">Address: {op.siteAddress}</p>
                <p className="text-gray-600 text-sm mb-1">Driver: <strong>{op.driver}</strong></p>
                <p className="text-gray-600 text-sm mb-1">Start Time: <strong>{op.startTime}</strong></p>
                <p className="text-gray-600 text-sm mb-1">End Time: <strong>{op.endTime}</strong></p>
                <p className="text-gray-600 text-sm mb-2">Worked: <strong>{op.hoursWorked || "N/A"} hrs</strong></p>

                {op.reportFile ? <p className="text-green-700 text-sm mb-2">✅ Report: {op.reportFile.name}</p> : <p className="text-gray-400 text-sm mb-2">No report uploaded</p>}

                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleEdit(i)} className="flex-1 border rounded py-1 hover:bg-gray-100">✎ Edit</button>
                  {op.reportFile && <a href={URL.createObjectURL(op.reportFile)} download={op.reportFile.name} className="flex-1 text-center bg-green-600 text-white rounded py-1 hover:bg-green-700">⬇️ Download</a>}
                  <button onClick={() => handleDelete(i)} className="flex-1 text-center bg-red-600 text-white rounded py-1 hover:bg-red-700">🗑 Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===========================
   Maintenance Tab
   =========================== */
function MaintenanceTab({ maintenanceRecords, setMaintenanceRecords }) {
  const [newRecord, setNewRecord] = useState({
    serviceType: "",
    serviceDate: "",
    mechanic: "",
    cost: "",
    remarks: "",
    billFile: null,
  });
  const fileInputRef = useRef(null);

  const handleFileSelect = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setNewRecord({ ...newRecord, billFile: file });
  };

  const handleAddRecord = () => {
    const { serviceType, serviceDate, mechanic, cost } = newRecord;
    if (!serviceType || !serviceDate || !mechanic || !cost) {
      alert("⚠️ Please fill in all required fields.");
      return;
    }
    setMaintenanceRecords([...maintenanceRecords, { ...newRecord, isEditing: false }]);
    setNewRecord({ serviceType: "", serviceDate: "", mechanic: "", cost: "", remarks: "", billFile: null });
  };

  const handleEdit = (index) => {
    const updated = [...maintenanceRecords];
    updated[index].isEditing = true;
    setMaintenanceRecords(updated);
  };

  const handleSave = (index) => {
    const updated = [...maintenanceRecords];
    updated[index].isEditing = false;
    setMaintenanceRecords(updated);
  };

  const handleDelete = (index) => {
    if (!window.confirm("🗑️ Are you sure you want to delete this record?")) return;
    setMaintenanceRecords(maintenanceRecords.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...maintenanceRecords];
    updated[index][field] = value;
    setMaintenanceRecords(updated);
  };

  return (
    <div className="mt-6 bg-gray-50 border rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">🛠 Vehicle Maintenance History</h3>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx" />

      <div className="mb-6 border rounded-lg bg-white p-4">
        <h4 className="font-semibold mb-3">Add New Maintenance Record</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <input type="text" placeholder="Service Type (e.g., Oil Change)" value={newRecord.serviceType} onChange={(e) => setNewRecord({ ...newRecord, serviceType: e.target.value })} className="border px-2 py-1 rounded w-full" />
          <input type="date" value={newRecord.serviceDate} onChange={(e) => setNewRecord({ ...newRecord, serviceDate: e.target.value })} className="border px-2 py-1 rounded w-full" />
          <input type="text" placeholder="Mechanic Name" value={newRecord.mechanic} onChange={(e) => setNewRecord({ ...newRecord, mechanic: e.target.value })} className="border px-2 py-1 rounded w-full" />
          <input type="number" placeholder="Service Cost (₹)" value={newRecord.cost} onChange={(e) => setNewRecord({ ...newRecord, cost: e.target.value })} className="border px-2 py-1 rounded w-full" />
        </div>
        <textarea placeholder="Remarks (optional)" value={newRecord.remarks} onChange={(e) => setNewRecord({ ...newRecord, remarks: e.target.value })} className="border px-2 py-1 rounded w-full mt-3"></textarea>

        <div className="flex justify-between items-center mt-3">
          <button onClick={handleFileSelect} className="text-blue-600 underline">📎 Upload Bill</button>
          {newRecord.billFile && <span className="text-sm text-green-700">✅ {newRecord.billFile.name}</span>}
        </div>

        <button onClick={handleAddRecord} className="w-full bg-green-600 text-white py-2 mt-4 rounded hover:bg-green-700">💾 Save Maintenance Record</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {maintenanceRecords.length === 0 && <p className="text-gray-500">No maintenance records yet.</p>}
        {maintenanceRecords.map((rec, i) => (
          <div key={i} className="border rounded-lg bg-white p-4 shadow-sm flex flex-col justify-between">
            {rec.isEditing ? (
              <>
                <input type="text" value={rec.serviceType} onChange={(e) => handleChange(i, "serviceType", e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
                <input type="date" value={rec.serviceDate} onChange={(e) => handleChange(i, "serviceDate", e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
                <input type="text" value={rec.mechanic} onChange={(e) => handleChange(i, "mechanic", e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
                <input type="number" value={rec.cost} onChange={(e) => handleChange(i, "cost", e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
                <textarea value={rec.remarks} onChange={(e) => handleChange(i, "remarks", e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
                <button onClick={() => handleSave(i)} className="bg-green-600 text-white py-1 rounded hover:bg-green-700 w-full">💾 Save</button>
              </>
            ) : (
              <>
                <h4 className="font-semibold text-lg">{rec.serviceType}</h4>
                <p className="text-gray-500 text-sm mb-1">Date: <strong>{rec.serviceDate}</strong></p>
                <p className="text-gray-500 text-sm mb-1">Mechanic: <strong>{rec.mechanic}</strong></p>
                <p className="text-gray-500 text-sm mb-1">Cost: <strong>₹{rec.cost}</strong></p>
                {rec.remarks && <p className="text-sm text-gray-600 mb-1">Remarks: {rec.remarks}</p>}
                {rec.billFile ? <p className="text-green-700 text-sm mb-2">✅ Bill: {rec.billFile.name}</p> : <p className="text-gray-400 text-sm mb-2">No bill uploaded</p>}
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleEdit(i)} className="flex-1 border rounded py-1 hover:bg-gray-100">✎ Edit</button>
                  {rec.billFile && <a href={URL.createObjectURL(rec.billFile)} download={rec.billFile.name} className="flex-1 text-center bg-green-600 text-white rounded py-1 hover:bg-green-700">⬇️ Download Bill</a>}
                  <button onClick={() => handleDelete(i)} className="flex-1 text-center bg-red-600 text-white rounded py-1 hover:bg-red-700">🗑 Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===========================
   Documents Tab
   =========================== */
function DocumentsTab({ documents, setDocuments }) {
  const [newDoc, setNewDoc] = useState({ name: "", expiry: "", file: null });
  const fileInputRef = useRef(null);

  const handleFileSelect = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setNewDoc({ ...newDoc, file });
  };

  const handleAddDocument = () => {
    if (!newDoc.name || !newDoc.expiry || !newDoc.file) {
      alert("⚠️ Please fill all fields before saving.");
      return;
    }
    setDocuments([...documents, { ...newDoc, isEditing: false }]);
    setNewDoc({ name: "", expiry: "", file: null });
  };

  const handleEdit = (index) => {
    const updated = [...documents];
    updated[index].isEditing = true;
    setDocuments(updated);
  };

  const handleSave = (index) => {
    const updated = [...documents];
    updated[index].isEditing = false;
    setDocuments(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...documents];
    updated[index][field] = value;
    setDocuments(updated);
  };

  return (
    <div className="mt-6 bg-gray-50 border rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">📄 Vehicle Documents</h3>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx" />

      <div className="mb-6 border rounded-lg bg-white p-4">
        <h4 className="font-semibold mb-3 flex justify-between">
          Add New Document
          <button id="addDocBtn" onClick={handleFileSelect} className="text-blue-600 underline">Select File</button>
        </h4>

        <input type="text" value={newDoc.name} onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })} placeholder="Enter Document Name" className="border px-2 py-1 rounded w-full mb-2" />
        <input type="date" value={newDoc.expiry} onChange={(e) => setNewDoc({ ...newDoc, expiry: e.target.value })} className="border px-2 py-1 rounded w-full mb-2" />
        {newDoc.file && <p className="text-sm text-green-700 mb-2">✅ Selected: {newDoc.file.name}</p>}
        <button onClick={handleAddDocument} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">💾 Save Document</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {documents.length === 0 && <p className="text-gray-500">No documents added yet.</p>}
        {documents.map((doc, i) => (
          <div key={i} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col justify-between">
            {doc.isEditing ? (
              <>
                <input type="text" value={doc.name} onChange={(e) => handleChange(i, "name", e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
                <input type="date" value={doc.expiry} onChange={(e) => handleChange(i, "expiry", e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
                <button onClick={() => handleSave(i)} className="bg-green-600 text-white w-full py-1 rounded hover:bg-green-700">💾 Save</button>
              </>
            ) : (
              <>
                <h4 className="font-semibold">{doc.name}</h4>
                <p className="text-sm text-gray-500 mb-1">Expiry: <strong>{doc.expiry}</strong></p>
                {doc.file ? <p className="text-green-700 text-sm mb-2">✅ Uploaded: {doc.file.name}</p> : <p className="text-gray-400 text-sm mb-2">No file uploaded</p>}
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleEdit(i)} className="flex-1 border rounded py-1 hover:bg-gray-100">✎ Edit</button>
                  {doc.file && <a href={URL.createObjectURL(doc.file)} download={doc.file.name} className="flex-1 text-center bg-green-600 text-white rounded py-1 hover:bg-green-700">⬇️ Download</a>}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
