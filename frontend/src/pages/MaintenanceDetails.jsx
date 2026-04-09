import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function MaintenanceDetails() {
  const query = new URLSearchParams(useLocation().search);
  const vehicleId = query.get("id");
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const [recordRes, vehicleRes] = await Promise.all([
          axios.get(`/api/maintenance/${vehicleId}`),
          axios.get(`/api/vehicles`),
        ]);

        const vehicleData = (vehicleRes.data.vehicles || []).find((v) => v._id === vehicleId) || null;
        setVehicle(vehicleData);

        const data = (recordRes.data.records || []).map((r) => ({
          ...r,
          isEditing: false, // track edit mode per row
          isNew: false,
        }));
        setRecords(data);
      } catch (err) {
        console.error("❌ Error fetching records:", err);
      }
    };
    fetchRecords();
  }, [vehicleId]);

  /* ✅ Add a new row */
  const handleAddRow = () => {
    setRecords([
      ...records,
      {
        _id: Date.now().toString(),
        serviceType: "",
        replacedParts: "",
        billFile: "",
        totalCost: "",
        description: "",
        serviceDate: "",
        startDate: "",
        endDate: "",
        isEditing: true,
        isNew: true,
      },
    ]);
  };

  /* ✅ Handle inline changes */
  const handleChange = (index, field, value) => {
    const newData = [...records];
    newData[index][field] = value;
    setRecords(newData);
  };

  /* ✅ File upload handler */
  const handleFileChange = (index, file) => {
    const newData = [...records];
    newData[index].billFile = file;
    setRecords(newData);
  };

  /* ✅ Save Record */
const handleSave = async (record, index) => {
  try {
    const formData = new FormData();

    // Only append vehicleId ONCE
    if (!record.vehicleId) formData.append("vehicleId", vehicleId);

    // Append all other editable fields
    for (const key in record) {
      if (
        !["_id", "isEditing", "isNew", "__v", "createdAt", "updatedAt"].includes(key) &&
        record[key] !== undefined &&
        record[key] !== null
      ) {
        // Skip duplicate vehicleId
        if (key === "vehicleId") continue;

        formData.append(key, record[key]);
      }
    }

    console.log("📦 Sending data:", Object.fromEntries(formData.entries()));

    const url = record.isNew
      ? "/api/maintenance"
      : `/api/maintenance/${record._id}`;

    const method = record.isNew ? "post" : "put";

    const res = await axios({
      method,
      url,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ Save response:", res.data);

    if (res.status === 200 || res.status === 201) {
      const updatedRecords = [...records];
      updatedRecords[index].isEditing = false;
      updatedRecords[index].isNew = false;

      if (res.data.updated)
        updatedRecords[index] = { ...res.data.updated, isEditing: false };
      if (res.data.record)
        updatedRecords[index] = { ...res.data.record, isEditing: false };

      setRecords(updatedRecords);
      alert("✅ Record saved successfully!");
    } else {
      throw new Error(res.data.message || "Unknown error");
    }
  } catch (err) {
    console.error("❌ Error saving record:", err.response?.data || err.message);
    alert(`⚠️ Failed to save: ${err.response?.data?.message || err.message}`);
  }
};

  /* ✅ Toggle edit mode */
  const handleEditToggle = (index) => {
    const updated = [...records];
    updated[index].isEditing = !updated[index].isEditing;
    setRecords(updated);
  };

  /* ✅ Export single record as PDF */
  const exportRecordPDF = (rec) => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const formatRupee = (val) => `Rs. ${val || 0}`;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Heavy Vehicle Management System", 14, 18);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Maintenance Record Report", 14, 28);
      doc.setFontSize(9);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 34);

      let startY = 44;
      doc.setFontSize(11);
      if (vehicle) {
        const info = [
          `Vehicle Name: ${vehicle.name || "N/A"}`,
          `Model: ${vehicle.vehicleModel || "N/A"}`,
          `Registration Number: ${vehicle.registrationNumber || "N/A"}`,
        ];
        info.forEach((line, i) => doc.text(line, 14, startY + i * 6));
        startY += info.length * 6 + 4;
      }

      const rows = [
        ["Service Type", rec.serviceType || "—"],
        ["Replaced Parts", rec.replacedParts || "—"],
        ["Total Cost", formatRupee(rec.totalCost)],
        ["Service Date", rec.serviceDate ? rec.serviceDate.split("T")[0] : "—"],
        ["Start Date", rec.startDate ? rec.startDate.split("T")[0] : "—"],
        ["End Date", rec.endDate ? rec.endDate.split("T")[0] : "—"],
        ["Remarks", rec.description || rec.remarks || "—"],
      ];

      autoTable(doc, {
        startY,
        head: [["Field", "Value"]],
        body: rows,
        theme: "grid",
        headStyles: { fillColor: [40, 89, 215], textColor: 255 },
        styles: { font: "helvetica", fontSize: 10 },
      });

      const filename = `${vehicle?.name || "Vehicle"}_maintenance_${rec._id}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Failed to export record. See console.");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🧰 Maintenance Details</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/maintenance/report?id=${vehicleId}`)}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
          >
            ⬇️ View Report
          </button>
          <button
            onClick={() => navigate(-1)}
            className="border px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            ← Back
          </button>
        </div>
      </div>

      <table className="min-w-full border border-gray-200 text-sm bg-white rounded-xl shadow">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <th className="p-3 border">S.No</th>
            <th className="p-3 border">Service Type</th>
            <th className="p-3 border">Replaced Parts</th>
            <th className="p-3 border">Bill</th>
            <th className="p-3 border">Total Cost</th>
            <th className="p-3 border">Description</th>
            <th className="p-3 border">Service Date</th>
            <th className="p-3 border">Start Date</th>
            <th className="p-3 border">End Date</th>
            <th className="p-3 border text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {records.map((rec, index) => (
            <tr key={rec._id} className="border-t hover:bg-gray-50">
              <td className="p-2 border text-center">{index + 1}</td>

              {/* Editable fields */}
              <td className="p-2 border">
                {rec.isEditing ? (
                  <input
                    type="text"
                    value={rec.serviceType}
                    onChange={(e) => handleChange(index, "serviceType", e.target.value)}
                    className="border p-1 w-full rounded"
                  />
                ) : (
                  <span>{rec.serviceType || "—"}</span>
                )}
              </td>

              <td className="p-2 border">
                {rec.isEditing ? (
                  <input
                    type="text"
                    value={rec.replacedParts}
                    onChange={(e) => handleChange(index, "replacedParts", e.target.value)}
                    className="border p-1 w-full rounded"
                  />
                ) : (
                  <span>{rec.replacedParts || "—"}</span>
                )}
              </td>

              <td className="p-2 border text-center">
                {rec.isEditing ? (
                  <input type="file" onChange={(e) => handleFileChange(index, e.target.files[0])} />
                ) : rec.billFile ? (
                  <a
                    href={`/uploads/${rec.billFile}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 text-xs"
                  >
                    View Bill
                  </a>
                ) : (
                  "—"
                )}
              </td>

              <td className="p-2 border">
                {rec.isEditing ? (
                  <input
                    type="number"
                    value={rec.totalCost}
                    onChange={(e) => handleChange(index, "totalCost", e.target.value)}
                    className="border p-1 w-full rounded"
                  />
                ) : (
                  <span>₹ {rec.totalCost || "—"}</span>
                )}
              </td>

              <td className="p-2 border">
                {rec.isEditing ? (
                  <textarea
                    value={rec.description}
                    onChange={(e) => handleChange(index, "description", e.target.value)}
                    className="border p-1 w-full rounded"
                  />
                ) : (
                  <span>{rec.description || "—"}</span>
                )}
              </td>

              <td className="p-2 border">
                {rec.isEditing ? (
                  <input
                    type="date"
                    value={rec.serviceDate?.split("T")[0] || ""}
                    onChange={(e) => handleChange(index, "serviceDate", e.target.value)}
                    className="border p-1 w-full rounded"
                  />
                ) : (
                  <span>{rec.serviceDate?.split("T")[0] || "—"}</span>
                )}
              </td>

              <td className="p-2 border">
                {rec.isEditing ? (
                  <input
                    type="date"
                    value={rec.startDate?.split("T")[0] || ""}
                    onChange={(e) => handleChange(index, "startDate", e.target.value)}
                    className="border p-1 w-full rounded"
                  />
                ) : (
                  <span>{rec.startDate?.split("T")[0] || "—"}</span>
                )}
              </td>

              <td className="p-2 border">
                {rec.isEditing ? (
                  <input
                    type="date"
                    value={rec.endDate?.split("T")[0] || ""}
                    onChange={(e) => handleChange(index, "endDate", e.target.value)}
                    className="border p-1 w-full rounded"
                  />
                ) : (
                  <span>{rec.endDate?.split("T")[0] || "—"}</span>
                )}
              </td>

              {/* ✅ Action buttons */}
              <td className="p-2 border text-center">
                {rec.isEditing ? (
                  <button
                    onClick={() => handleSave(rec, index)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditToggle(index)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/maintenance/report?id=${vehicleId}&record=${rec._id}`)}
                      className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                    >
                      View Report
                    </button>
                    <button
                      onClick={() => exportRecordPDF(rec)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Export Report
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-between">
        <button
          onClick={handleAddRow}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          + Add Row
        </button>
        <button
          onClick={() => navigate(-1)}
          className="border px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
