import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddClient() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    industry: "",
    status: "Active",
    notes: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
  const res = await axios.post("/api/clients", form);
      if (res.status === 201) {
        alert("✅ Client added successfully!");
        navigate("/clients"); // Go back to clients tab
      }
    } catch (err) {
      console.error("❌ Error adding client:", err);
      alert("⚠️ Failed to save client.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">➕ Add New Client</h1>

      <form onSubmit={handleSave} className="grid grid-cols-2 gap-6">
        <Input label="Client Name *" name="name" value={form.name} onChange={handleChange} />
        <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
        <Input label="Email" name="email" value={form.email} onChange={handleChange} />
        <Input label="Address" name="address" value={form.address} onChange={handleChange} />
        <Input label="City" name="city" value={form.city} onChange={handleChange} />
        <Input label="State" name="state" value={form.state} onChange={handleChange} />
        <Input label="Industry" name="industry" value={form.industry} onChange={handleChange} />

        <div>
          <label className="block text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option>Active</option>
            <option>Inactive</option>
            <option>Pending</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            rows="3"
          ></textarea>
        </div>

        <div className="col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            💾 Save Client
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg p-2"
      />
    </div>
  );
}
