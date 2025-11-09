// frontend/src/pages/SalaryPage.jsx
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SalaryOverview from "../widgets/SalaryOverview";
import EmployeeCard from "../widgets/EmployeeCard";
import PayrollRecords from "../widgets/PayrollRecords";
import sampleData from "../data/sampleData";
import Attendance from "./Attendance";

export default function SalaryPage() {
  const navigate = useNavigate();

  // tabs
  const [tab, setTab] = useState("overview");

  // master lists
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]); // baseline/current payroll overview
  const [history, setHistory] = useState([]); // month-specific records

  // selected month default to current
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [loading, setLoading] = useState(true);

  // initial data load: employees + history for selectedMonth
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const resEmp = await axios.get("/api/drivers");
        if (!mounted) return;
        setEmployees(resEmp.data.drivers || sampleData.driversList);
      } catch (e) {
        setEmployees(sampleData.driversList);
      }

      try {
        const resHist = await axios.get(`/api/salary/history?month=${selectedMonth}`);
        if (!mounted) return;
        console.log('Loaded history for month:', selectedMonth, resHist.data);
        // Ensure history is an array
        setHistory(Array.isArray(resHist.data.history) ? resHist.data.history : []);
      } catch (e) {
        console.error('Error loading history:', e);
        setHistory([]);
      }

      if (mounted) setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []); // run once — selectedMonth fetch handled in the next effect

  // whenever selectedMonth changes, fetch month-specific history
  useEffect(() => {
    let mounted = true;
    const fetchMonth = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/salary/history?month=${selectedMonth}`);
        if (!mounted) return;
        setHistory(Array.isArray(res.data.history) ? res.data.history : []);
      } catch (err) {
        console.error("Failed to load month history:", err);
        setHistory([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchMonth();
    return () => {
      mounted = false;
    };
  }, [selectedMonth]);

  // Called by SalaryBox after save to refresh month history and optionally payrolls
  const handleSalarySaved = async (saved) => {
    try {
      // refresh this month's history so UI matches backend
      const resHist = await axios.get(`/api/salary/history?month=${selectedMonth}`);
      setHistory(Array.isArray(resHist.data.history) ? resHist.data.history : []);

      // If this save happened for current month, update baseline payrolls view (optional)
      const now = new Date();
      const currentMonthLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      if (saved && saved.month === currentMonthLocal) {
        setPayrolls((prev) => {
          const found = prev.find((p) => String(p.empId) === String(saved.empId));
          if (found) {
            return prev.map((p) => (String(p.empId) === String(saved.empId) ? { ...p, ...saved } : p));
          }
          return [saved, ...prev];
        });
      }
    } catch (e) {
      console.error("Failed to refresh month history after save:", e);
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-600">Loading salary data...</div>;

  // Build an index for quick lookup: empId -> record for selected month
  const monthMap = {};
  history.forEach((rec) => {
    // normalize empId key (strings)
    if (!rec || (!rec.empId && !rec.empId === 0)) return;
    monthMap[String(rec.empId)] = rec;
  });

  // determine if user is viewing the current month (but we'll show only month-specific entries regardless)
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const viewingCurrentMonth = selectedMonth === currentMonth;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold">Salary Management</h1>
        <p className="text-gray-500 mt-1">
          Manage employee salaries, payroll processing, and compensation tracking
        </p>
      </div>

      {/* Top-right action buttons */}
      <div className="flex justify-end gap-4 mb-6">
        <button
          onClick={() => navigate('/salaryhistory')}
          className="px-4 py-2 border rounded"
          title="View salary history"
        >
          History
        </button>
        <button
          onClick={() => navigate('/salaryhistory')}
          className="px-4 py-2 border rounded"
          title="Preview & download salary report"
        >
          ⤓ Export Reports
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="bg-gray-200 rounded-lg p-1 flex gap-2">
          <Tab label="Overview" active={tab === "overview"} onClick={() => setTab("overview")} />
          <Tab label="Attendance" active={tab === "attendance"} onClick={() => setTab("attendance")} />
        </div>
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div>
          <SalaryOverview payrolls={history} employees={employees} />

          {/* Salary Sheet Section */}
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Salary Sheet</h2>

            {/* Month selector */}
            <div className="mb-4 flex items-center gap-4">
              <label className="font-medium text-gray-700">Month:</label>
              <input
                type="month"
                className="border p-2 rounded"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
              <div className="text-sm text-gray-600 ml-4">Showing salaries for <strong>{selectedMonth}</strong></div>
            </div>

            {/* If viewing a month with no records show helpful message */}
            {history.length === 0 && (
              <div className="mb-4 p-4 rounded bg-yellow-50 border border-yellow-200 text-yellow-800">
                No salary records found for the selected month ({selectedMonth}).
                You can enter salaries below — those will be saved specifically for {selectedMonth}.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Show every employee; their month-specific entry is read from monthMap */}
              {employees.map((driver) => {
                const empKey = String(driver._id || driver.id);
                // monthEntry only from monthMap (fetched for selectedMonth)
                const monthEntry = monthMap[empKey] || null;

                // Only show the entry if it exists for this specific month
                const existing = monthEntry || null;

                // Always pass the selectedMonth when saving so every save is month-scoped.
                // This ensures independence across months.
                return (
                  <SalaryBox
                    key={empKey}
                    driver={driver}
                    existing={existing}
                    month={selectedMonth}
                    onSave={handleSalarySaved}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "attendance" && <Attendance />}
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        "flex-1 py-3 rounded text-sm font-medium " +
        (active ? "bg-gray-900 text-white shadow-inner" : "text-gray-600")
      }
    >
      {label}
    </button>
  );
}

function SalaryBox({ driver, existing, onSave, month }) {
  const [isEditing, setIsEditing] = useState(false);

  // We store salary as string in the input; but keep numeric logic when saving.
  // Use null/empty string as "not set".
  const existingAmount = existing && (existing.amount !== undefined && existing.amount !== null)
    ? String(existing.amount)
    : "";

  const [salary, setSalary] = useState(existingAmount);

  // keep in sync when existing or month changes
  useEffect(() => {
    const val = existing && (existing.amount !== undefined && existing.amount !== null)
      ? String(existing.amount)
      : "";
    setSalary(val);
    setIsEditing(false);
  }, [existing, month]);

  const handleSave = async () => {
    // allow 0? you previously rejected <=0; we keep the same rule: must be > 0
    if (salary === "" || salary === null) return alert("Please enter a salary amount!");
    const numeric = Number(salary);
    if (!Number.isFinite(numeric) || numeric <= 0) return alert("Enter a valid salary greater than 0");

    try {
      const payload = {
        empId: driver._id || driver.id,
        name: driver.name,
        amount: numeric,
        month, // always save with selected month (ensures independence across months)
      };
      console.log('Saving salary with payload:', payload);

      const res = await axios.post("/api/salary", payload);
      console.log('Server response:', res.data);
      alert(res.data.message || "Salary saved successfully!");
      setIsEditing(false);

      const saved = res.data.salary || res.data.updated;
      console.log('Saved salary data:', saved);
      if (saved && saved.amount !== undefined) {
        // reflect saved value defensively
        setSalary(String(saved.amount));
      }

      if (typeof onSave === "function") onSave({ ...saved, month });
    } catch (err) {
      console.error("❌ Error saving salary:", err);
      alert("Failed to save salary");
    }
  };

  const displaySalary = (s) => {
    if (s === "" || s === null || s === undefined) return "Not Set";
    return `₹${s}`;
  };

  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition duration-200 bg-gray-50">
      <h3 className="text-lg font-bold text-gray-800">{driver.name}</h3>
      <p className="text-sm text-gray-600 mb-3">ID: {driver._id || driver.id}</p>
      <p className="text-sm text-gray-600 mb-3">Present: <span className="font-semibold">{driver.totalPresentDays || 0}</span></p>

      {!isEditing ? (
        <div className="flex justify-between items-center">
          <div
            className={`px-4 py-2 rounded-lg border text-center text-lg font-semibold ${salary ? "bg-green-50 border-green-400 text-green-700" : "bg-yellow-50 border-yellow-400 text-yellow-700"}`}
            style={{ minWidth: "100px" }}
          >
            { displaySalary(salary) }
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className={`ml-4 px-3 py-1 rounded text-sm font-medium ${salary ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-green-600 text-white hover:bg-green-700"}`}
          >
            {salary ? "Edit" : "Add"}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <input
            type="number"
            inputMode="numeric"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="Enter Salary"
            className="flex-1 border rounded-lg px-3 py-2 text-gray-800 [appearance:textfield]"
            onWheel={(e) => e.target.blur()} // Prevent scroll change
          />

          <button
            onClick={handleSave}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              // revert to last known existing amount
              setSalary(existingAmount);
            }}
            className="px-3 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
