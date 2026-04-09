import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function EditDriver() {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const driverId = query.get("id");

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

  const [loading, setLoading] = useState(true);

  // ✅ Fetch existing driver data
  useEffect(() => {
    const fetchDriver = async () => {
      try {
  const res = await fetch(`/api/drivers/${driverId}`);
        const data = await res.json();

        if (res.ok) {
          setForm({
            name: data.driver.name || "",
            age: data.driver.age || "",
            gender: data.driver.gender || "",
            phone: data.driver.phone || "",
            email: data.driver.email || "",
            address: data.driver.address || "",
            licenseNo: data.driver.licenseNo || "",
            licenseExpiry: data.driver.licenseExpiry || "",
            experience: data.driver.experience || "",
            aadhaarNo: data.driver.aadhaarNo || "",
            emergencyContact: data.driver.emergencyContact || "",
            bloodGroup: data.driver.bloodGroup || "",
            status: data.driver.status || "Available",
          });
        } else {
          alert("❌ Failed to load driver details");
        }
      } catch (err) {
        console.error("Error fetching driver:", err);
        alert("⚠️ Error loading driver data");
      } finally {
        setLoading(false);
      }
    };

    if (driverId) fetchDriver();
  }, [driverId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    setFiles({ ...files, [name]: uploadedFiles[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        const value = form[key] ?? "";
        formData.append(key, value.toString());
      });

      Object.entries(files).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const res = await fetch(`/api/drivers/edit/${driverId}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Driver updated successfully!");
        navigate(`/driver/profile?id=${driverId}`);
      } else {
        alert(`❌ Failed: ${data.message || "Error updating driver!"}`);
      }
    } catch (error) {
      console.error("Error updating driver:", error);
      alert("⚠️ Unable to connect to the server!");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading driver info...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow mt-6 mb-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">✏️ Edit Driver</h1>
      <p className="text-gray-500 mb-6">Update driver details and documents below.</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Info */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Personal Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required />
            <Input label="Age" name="age" type="number" value={form.age} onChange={handleChange} required />
            <Select label="Gender" name="gender" value={form.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
            <Input label="Phone Number" name="phone" value={form.phone} onChange={handleChange} required />
            <Input label="Email" name="email" value={form.email} onChange={handleChange} />
            <Input label="Address" name="address" value={form.address} onChange={handleChange} />
            <Input label="Aadhaar Number" name="aadhaarNo" value={form.aadhaarNo} onChange={handleChange} />
            <Input label="Blood Group" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} />
          </div>
        </section>

        {/* Professional Info */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Professional Details
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="License Number" name="licenseNo" value={form.licenseNo} onChange={handleChange} required />
            <Input label="License Expiry Date" name="licenseExpiry" type="date" value={form.licenseExpiry} onChange={handleChange} />
            <Input label="Experience (in years)" name="experience" type="number" value={form.experience} onChange={handleChange} />
            <Input label="Emergency Contact" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} />
          </div>
        </section>

        {/* File Upload Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Update Documents (optional)
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <FileInput label="Replace Aadhaar" name="aadhaarFile" onChange={handleFileChange} />
            <FileInput label="Replace License" name="licenseFile" onChange={handleFileChange} />
            <FileInput label="Replace Photo" name="photoFile" onChange={handleFileChange} />
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate(`/driver/profile?id=${driverId}`)}
            className="border px-6 py-2 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Reusable Input Components ---------- */

function Input({ label, name, type = "text", value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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
