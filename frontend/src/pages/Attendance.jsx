import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Attendance() {
  const [drivers, setDrivers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [monthSummary, setMonthSummary] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const currentMonth = date.substring(0, 7); // YYYY-MM

  // Fetch driver list from DB
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await axios.get("/api/drivers");
        const list = res.data?.drivers || res.data || [];
        setDrivers(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load drivers:", err);
        setDrivers([]);
      }
    };
    fetchDrivers();
  }, []);

  // Handle attendance marking (P or A)
  const handleAttendanceChange = (id, value) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Fetch attendance for selected date and month summary
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Build driver id map for consistency
        const driverMap = {};
        drivers.forEach((d) => {
          const id = d._id || d.id;
          if (id) driverMap[id] = d;
        });

        // Fetch attendance for specific date
        const attendanceRes = await axios.get(`/api/attendance?date=${date}`);
        const records = attendanceRes.data?.records || [];
        const map = {};
        for (const r of records) {
          const driverId = r.driverId;
          if (driverId && driverMap[driverId]) {
            map[driverId] = r.status;
          }
        }
        setAttendance(map);

        // Fetch month summary
        const summaryRes = await axios.get(`/api/attendance/month-summary?month=${currentMonth}`);
        setMonthSummary(summaryRes.data.summary || {});
      } catch (err) {
        console.debug("Failed to load attendance data:", err?.message || err);
        setAttendance({});
        setMonthSummary({});
      }
    };

    if (drivers.length >= 0) {
      fetchData();
    }
  }, [date, drivers, currentMonth]);

  // Submit attendance
  const handleSubmit = async () => {
    try {
      const month = date.substring(0, 7); // YYYY-MM from YYYY-MM-DD

      // Get driver ID map for looking up driver details
      const driverMap = {};
      drivers.forEach(d => {
        const id = d._id || d.id;
        if (id) driverMap[id] = d;
      });

      // Filter out drivers with no selected status or invalid values
      const records = Object.entries(attendance)
        .map(([driverId, status]) => ({ 
          driverId,
          status,
          name: driverMap[driverId]?.name // Include name for reference
        }))
        .filter((r) => r.status === "P" || r.status === "A");

      if (records.length === 0) {
        return alert("No attendance to save — please select P or A for at least one driver before saving.");
      }

      const payload = { date, month, records };
      console.log("Sending attendance payload:", payload);

      const saveRes = await axios.post("/api/attendance/mark", payload);
      console.log("Save response:", saveRes.data);

      // Refresh month summary after saving
      try {
        console.log("Fetching updated month summary for:", month);
        const summaryRes = await axios.get(`/api/attendance/month-summary?month=${month}`);
        console.log("Summary response:", summaryRes.data);
        setMonthSummary(summaryRes.data.summary || {});
        alert("Attendance saved successfully!");
      } catch (summaryErr) {
        console.error("Error fetching month summary:", summaryErr);
        // Still show success since the save likely worked
        alert("Attendance saved, but failed to refresh totals. Please refresh the page.");
      }
    } catch (err) {
      console.error("Error saving attendance:", err.response?.data || err.message || err);
      alert("Failed to save attendance: " + (err.response?.data?.message || err.message || "Unknown error"));
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4">Driver Attendance</h2>

      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700">Date:</label>
        <input
          type="date"
          className="border p-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <table className="w-full border-collapse border rounded-lg mt-4">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border p-2">S.No</th>
            <th className="border p-2">Driver ID</th>
            <th className="border p-2">Driver Name</th>
            <th className="border p-2 text-center">Mark Attendance (P/A)</th>
            <th className="border p-2 text-center">Total Present Days</th>
          </tr>
        </thead>
        <tbody>
          {drivers.length > 0 ? (
            drivers.map((driver, index) => {
              const driverId = driver._id || driver.id;
              return (
                <tr key={driverId}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">{driverId}</td>
                  <td className="border p-2">{driver.name}</td>
                  <td className="border p-2 text-center">
                    <select
                      className="border p-1 rounded"
                      value={attendance[driverId] || ""}
                      onChange={(e) => handleAttendanceChange(driverId, e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="P">P</option>
                      <option value="A">A</option>
                    </select>
                  </td>
                  <td className="border p-2 text-center">
                    {monthSummary[driverId] || 0}
                  </td>
                </tr>
              );
            }) 
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-gray-500 p-4">
                No drivers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Attendance
        </button>
      </div>
    </div>
  );
}
