import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function AddDriver() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    licenseNo: "",
    licenseExpiry: "",
    experience: "",
    aadhaarNo: "",
    emergencyContact: "",
    bloodGroup: "",
    status: "Available",
  });

  const [files, setFiles] = useState({
    aadhaarFile: null,
    licenseFile: null,
    photoFile: null,
  });

  // ✅ Handle text input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle file uploads
  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    setFiles({ ...files, [name]: uploadedFiles[0] });
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Prepare multipart/form-data safely
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        const value = form[key] ?? ""; // ensure even empty values are included
        formData.append(key, value.toString());
      });

      Object.entries(files).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      // (Optional) Debug log to verify form data being sent
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // ✅ Send POST request
      const res = await apiFetch("/api/drivers", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      console.info('[AddDriver] response:', res.status, data);

      if (res.ok) {
        alert("✅ Driver added successfully!");
        localStorage.setItem("newDriverAdded", "true");
        navigate("/drivers");
      } else {
        alert(`❌ Failed: ${data.message || "Error adding driver!"}`);
      }
    } catch (error) {
      console.error("Error adding driver:", error);
      alert("⚠️ Unable to connect to the server!");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow mt-6 mb-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        🧑‍✈️ Add New Driver
      </h1>
      <p className="text-gray-500 mb-6">
        Enter the driver’s personal, contact, and license information.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Info */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Personal Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Age"
              name="age"
              type="number"
              value={form.age}
              onChange={handleChange}
              required
            />
            <Select
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              options={["Male", "Female", "Other"]}
            />
            <Input
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <Input
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
            <Input
              label="Aadhaar Number"
              name="aadhaarNo"
              value={form.aadhaarNo}
              onChange={handleChange}
            />
            <Input
              label="Blood Group"
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Professional Info */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Professional Details
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="License Number"
              name="licenseNo"
              value={form.licenseNo}
              onChange={handleChange}
              required
            />
            <Input
              label="License Expiry Date"
              name="licenseExpiry"
              type="date"
              value={form.licenseExpiry}
              onChange={handleChange}
            />
            <Input
              label="Experience (in years)"
              name="experience"
              type="number"
              value={form.experience}
              onChange={handleChange}
            />
            <Input
              label="Emergency Contact"
              name="emergencyContact"
              value={form.emergencyContact}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* File Upload Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Document Uploads
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <FileInput
              label="Upload Aadhaar"
              name="aadhaarFile"
              onChange={handleFileChange}
            />
            <FileInput
              label="Upload License"
              name="licenseFile"
              onChange={handleFileChange}
            />
            <FileInput
              label="Upload Photo"
              name="photoFile"
              onChange={handleFileChange}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Accepted formats: JPG, PNG, PDF (max 5MB)
          </p>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            type="submit"
            className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800"
          >
            Save Driver
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border px-6 py-2 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Input Components ---------- */

function Input({ label, name, type = "text", value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border rounded-lg p-2"
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg p-2"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function FileInput({ label, name, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="file"
        name={name}
        onChange={onChange}
        accept=".jpg,.jpeg,.png,.pdf"
        className="w-full border rounded-lg p-2"
      />
    </div>
  );
}
