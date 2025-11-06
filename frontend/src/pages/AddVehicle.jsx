import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddVehicle() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", // ✅ Required field for MongoDB schema
    registrationNumber: "",
    vehicleModel: "",
    vehicleType: "",
    manufacturingYear: "",
    vinNumber: "",
    engineType: "",
    loadCapacity: "",
    fuelType: "",
    additionalNotes: "",
    registrationExpiry: "",
    insuranceExpiry: "",
    purchaseDate: "",
    purchasePrice: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Vehicle added successfully!");
        console.log("Saved Vehicle:", data.vehicle);
        navigate("/vehicles");
      } else {
        console.error("❌ Server responded with error:", data);
        alert(`❌ Failed: ${data.message || "Error adding vehicle"}`);
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert("⚠️ Unable to connect to server.");
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

      <h1 className="text-3xl font-bold mb-2">Add New Vehicle</h1>
      <p className="text-gray-500 mb-6">
        Enter vehicle details to add to your fleet
      </p>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
        {/* Left Side */}
        <div className="md:col-span-2 bg-gray-50 rounded-lg border">
          <div className="bg-yellow-100 font-semibold text-lg px-6 py-3 border-b">
            🚚 Vehicle Information
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* ✅ Added Vehicle Name Field */}
              <Input
                name="name"
                label="Vehicle Name *"
                placeholder="e.g., Tata Truck 4900"
                onChange={handleChange}
                value={form.name}
              />
              <Input
                name="registrationNumber"
                label="Plate Number *"
                placeholder="e.g., MH-01-AB-1234"
                onChange={handleChange}
                value={form.registrationNumber}
              />
              <Input
                name="vehicleModel"
                label="Vehicle Model *"
                placeholder="e.g., Tata Prima 4940.S"
                onChange={handleChange}
                value={form.vehicleModel}
              />
              <Select
                name="vehicleType"
                label="Vehicle Type *"
                options={["Heavy Truck", "Mini Truck", "Trailer"]}
                onChange={handleChange}
                value={form.vehicleType}
              />
              <Input
                name="manufacturingYear"
                label="Manufacturing Year *"
                placeholder="e.g., 2022"
                onChange={handleChange}
                value={form.manufacturingYear}
              />
              <Input
                name="vinNumber"
                label="VIN Number *"
                placeholder="Vehicle Identification Number"
                onChange={handleChange}
                value={form.vinNumber}
              />
              <Input
                name="engineType"
                label="Engine Type"
                placeholder="e.g., BS6 500HP Diesel"
                onChange={handleChange}
                value={form.engineType}
              />
              <Input
                name="loadCapacity"
                label="Load Capacity"
                placeholder="e.g., 40 tons"
                onChange={handleChange}
                value={form.loadCapacity}
              />
              <Select
                name="fuelType"
                label="Fuel Type"
                options={["Diesel", "Petrol", "CNG", "Electric", "Hybrid"]}
                onChange={handleChange}
                value={form.fuelType}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Additional Notes</label>
              <textarea
                name="additionalNotes"
                className="w-full border rounded-lg p-2"
                placeholder="Any additional information about the vehicle..."
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

          <Input
            name="registrationExpiry"
            label="Registration Expiry"
            type="date"
            onChange={handleChange}
            value={form.registrationExpiry}
          />
          <Input
            name="insuranceExpiry"
            label="Insurance Expiry"
            type="date"
            onChange={handleChange}
            value={form.insuranceExpiry}
          />
          <Input
            name="purchaseDate"
            label="Purchase Date"
            type="date"
            onChange={handleChange}
            value={form.purchaseDate}
          />
          <Input
            name="purchasePrice"
            label="Purchase Price (₹)"
            placeholder="e.g., 2500000"
            onChange={handleChange}
            value={form.purchasePrice}
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded mt-4 hover:bg-gray-800"
          >
            💾 Save Vehicle
          </button>

          <button
            type="button"
            onClick={() => navigate("/vehicles")}
            className="w-full border mt-2 py-2 rounded hover:bg-gray-50"
          >
            ✖ Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, name, placeholder, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        className="w-full border rounded-lg p-2"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={label.includes("*")}
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
        className="w-full border rounded-lg p-2"
        value={value}
        onChange={onChange}
        required={label.includes("*")}
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
