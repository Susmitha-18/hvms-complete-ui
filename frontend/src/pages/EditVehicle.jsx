import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function EditVehicle() {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const vehicleId = query.get("id");

  const [form, setForm] = useState(null);

  // Fetch the vehicle details from backend
  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const res = await fetch(`/api/vehicles`);
        const data = await res.json();
        const found = data.vehicles.find((v) => v._id === vehicleId);
        if (found) setForm(found);
      } catch (err) {
        console.error("❌ Error loading vehicle:", err);
      }
    };
    loadVehicle();
  }, [vehicleId]);

  if (!form)
    return <div className="p-6 text-center">Loading vehicle details...</div>;

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle save
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
    } catch (err) {
      console.error("⚠️ Error saving vehicle:", err);
      alert("⚠️ Failed to connect to the server.");
    }
  };

  return (
    <div className="px-6 py-6">
      <button
        onClick={() => navigate("/vehicles")}
        className="border rounded px-4 py-2 mb-6 hover:bg-gray-50"
      >
        ← Back to Vehicles!
      </button>

      <h1 className="text-3xl font-bold mb-2">Edit Vehicle</h1>
      <p className="text-gray-500 mb-6">
        Modify the details and click Save to update.
      </p>

      <form onSubmit={handleSave} className="grid md:grid-cols-3 gap-6">
        {/* Left section */}
        <div className="md:col-span-2 bg-gray-50 rounded-lg border">
          <div className="bg-yellow-100 font-semibold text-lg px-6 py-3 border-b">
            🚚 Vehicle Information
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Vehicle Name *" name="name" value={form.name} onChange={handleChange} />
              <Input label="Plate Number *" name="registrationNumber" value={form.registrationNumber} onChange={handleChange} />
              <Input label="Vehicle Model *" name="vehicleModel" value={form.vehicleModel} onChange={handleChange} />
              <Select label="Vehicle Type *" name="vehicleType" options={["Heavy Truck", "Mini Truck", "Trailer", "Car", "Van", "Bus"]} value={form.vehicleType} onChange={handleChange} />
              <Input label="Manufacturing Year *" name="manufacturingYear" value={form.manufacturingYear} onChange={handleChange} />
              <Input label="VIN Number" name="vinNumber" value={form.vinNumber} onChange={handleChange} />
              <Input label="Engine Type" name="engineType" value={form.engineType} onChange={handleChange} />
              <Input label="Load Capacity" name="loadCapacity" value={form.loadCapacity} onChange={handleChange} />
              <Select label="Fuel Type" name="fuelType" options={["Diesel", "Petrol", "CNG", "Electric", "Hybrid"]} value={form.fuelType} onChange={handleChange} />
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

        {/* Right section */}
        <div className="bg-gray-50 rounded-lg border p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-2">Documentation & Dates</h3>
          <Input label="Registration Expiry" name="registrationExpiry" type="date" value={form.registrationExpiry} onChange={handleChange} />
          <Input label="Insurance Expiry" name="insuranceExpiry" type="date" value={form.insuranceExpiry} onChange={handleChange} />
          <Input label="Purchase Date" name="purchaseDate" type="date" value={form.purchaseDate} onChange={handleChange} />
          <Input label="Purchase Price (₹)" name="purchasePrice" value={form.purchasePrice} onChange={handleChange} />
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
