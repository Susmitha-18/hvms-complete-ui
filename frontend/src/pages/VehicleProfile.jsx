import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function EditVehicle() {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const vehicleId = query.get("id");

  const [form, setForm] = useState(null);

  // Fetch existing vehicle details
  useEffect(() => {
    const loadVehicle = async () => {
      try {
        if (!vehicleId) return;

        // Fetch the single vehicle by id — more reliable than pulling the full list
        const res = await apiFetch(`/api/vehicles/${vehicleId}`);
        const data = await res.json().catch(() => ({}));
        if (data && data.vehicle) setForm(data.vehicle);
      } catch (err) {
        console.error("❌ Error loading vehicle:", err);
      }
    };
    loadVehicle();
  }, [vehicleId]);

  if (!form) return <div className="p-6 text-center">{vehicleId ? 'Loading vehicle details...' : 'No vehicle selected.'}</div>;

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle save (PUT request)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Vehicle updated successfully!");
        navigate(`/vehicle/profile?id=${vehicleId}`);
      } else {
        alert(`❌ Failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("⚠️ Failed to connect to the server.");
    }
  };

  return (
    <div className="px-6 py-6">
       <button
        onClick={() => navigate("/vehicles")}
        className="border rounded px-4 py-2 mb-6 hover:bg-gray-50"
      >
        ← Back to Vehicles
      </button>

      <h1 className="text-3xl font-bold mb-2">Edit Vehicle</h1>
      <p className="text-gray-500 mb-6">Modify details and save changes</p>

      <form onSubmit={handleSave} className="grid md:grid-cols-3 gap-6">
        {/* Left Side */}
        <div className="md:col-span-2 bg-gray-50 rounded-lg border">
          <div className="bg-yellow-100 font-semibold text-lg px-6 py-3 border-b">
            🚚 Vehicle Information
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input name="name" label="Vehicle Name *" value={form.name} onChange={handleChange} />
              <Input name="registrationNumber" label="Plate Number *" value={form.registrationNumber} onChange={handleChange} />
              <Input name="vehicleModel" label="Vehicle Model *" value={form.vehicleModel} onChange={handleChange} />
              <Select name="vehicleType" label="Vehicle Type *" options={["Heavy Truck", "Mini Truck", "Trailer", "Car", "Van", "Bus"]} value={form.vehicleType} onChange={handleChange} />
              <Input name="manufacturingYear" label="Manufacturing Year *" value={form.manufacturingYear} onChange={handleChange} />
              <Input name="vinNumber" label="VIN Number *" value={form.vinNumber} onChange={handleChange} />
              <Input name="engineType" label="Engine Type" value={form.engineType} onChange={handleChange} />
              <Input name="loadCapacity" label="Load Capacity" value={form.loadCapacity} onChange={handleChange} />
              <Select name="fuelType" label="Fuel Type" options={["Diesel", "Petrol", "CNG", "Electric", "Hybrid"]} value={form.fuelType} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Additional Notes</label>
              <textarea
                name="additionalNotes"
                className="w-full border rounded-lg p-2"
                rows="3"
                onChange={handleChange}
                value={form.additionalNotes}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-gray-50 rounded-lg border p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-2">Documentation & Dates</h3>
          <Input name="registrationExpiry" label="Registration Expiry" type="date" value={form.registrationExpiry} onChange={handleChange} />
          <Input name="insuranceExpiry" label="Insurance Expiry" type="date" value={form.insuranceExpiry} onChange={handleChange} />
          <Input name="purchaseDate" label="Purchase Date" type="date" value={form.purchaseDate} onChange={handleChange} />
          <Input name="purchasePrice" label="Purchase Price (₹)" value={form.purchasePrice} onChange={handleChange} />

          <button type="submit" className="w-full bg-black text-white py-2 rounded mt-4 hover:bg-gray-800">
            💾 Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, name, value, type = "text", onChange }) {
  return (
    <div>
      <label className="block text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        className="w-full border rounded-lg p-2"
      />
    </div>
  );
}

function Select({ label, name, options, value, onChange }) {
  return (
    <div>
      <label className="block text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full border rounded-lg p-2"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
