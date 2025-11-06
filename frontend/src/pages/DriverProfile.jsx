import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function DriverProfile() {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const driverId = query.get("id");

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch driver details
  useEffect(() => {
    const fetchDriver = async () => {
      try {
  const res = await fetch(`/api/drivers/${driverId}`);
        const data = await res.json();

        if (res.ok) {
          setDriver(data.driver);
        } else {
          console.error("Failed to fetch driver:", data.message);
        }
      } catch (error) {
        console.error("Error fetching driver details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (driverId) fetchDriver();
  }, [driverId]);

  if (loading)
    return <div className="p-8 text-center text-gray-500">Loading driver details...</div>;

  if (!driver)
    return (
      <div className="p-8 text-center text-red-600">
        Driver not found
        <button
          className="ml-4 px-4 py-2 bg-gray-800 text-white rounded"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>

    );

  return (
    <div className="max-w-5xl mx-auto bg-white shadow rounded-xl p-8 mt-6 mb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🧑‍✈️ Driver Profile</h1>
        <button
          onClick={() => navigate(`/driver/edit?id=${driver._id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ✏️ Edit Profile
        </button>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Side - Photo */}
        <div className="flex-shrink-0 text-center">
          <img
            src={
        driver.photoFile
          ? `/uploads/${driver.photoFile}`
                : "/default-driver.png"
            }
            alt="Driver"
            className="w-40 h-40 object-cover rounded-full border"
          />
          <p className="mt-3 text-gray-600 text-sm italic">
            {driver.status === "Available"
              ? "🟢 Available"
              : driver.status === "Assigned"
              ? "🔵 Assigned"
              : "🟡 On Leave"}
          </p>
        </div>

        {/* Right Side - Details */}
        <div className="flex-1 space-y-3 text-gray-800">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4">Personal Information</h2>

          <Info label="Driver ID" value={driver.driverId || driver._id} />
          <Info label="Full Name" value={driver.name} />
          <Info label="Age" value={driver.age} />
          <Info label="Gender" value={driver.gender} />
          <Info label="Phone" value={driver.phone} />
          <Info label="Email" value={driver.email} />
          <Info label="Address" value={driver.address} />
          <Info label="Blood Group" value={driver.bloodGroup || "N/A"} />
          <Info label="Emergency Contact" value={driver.emergencyContact || "N/A"} />
          <Info label="Experience" value={`${driver.experience || 0} years`} />
          <Info label="Rating" value={`⭐ ${driver.rating || "4.5/5.0"}`} />
        </div>
      </div>

      {/* Professional Info */}
      <div className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Professional Details</h2>
        <Info label="License No" value={driver.licenseNo || "N/A"} />
        <Info label="License Expiry" value={driver.licenseExpiry || "N/A"} />
        <Info label="Assigned Vehicle" value={driver.assignedVehicle || "Not Assigned"} />
      </div>

      {/* Uploaded Documents */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Uploaded Documents</h2>

        <div className="grid sm:grid-cols-3 gap-6">
          <DocCard
            title="Aadhaar Card"
            file={driver.aadhaarFile}
            icon="📄"
          />
          <DocCard
            title="License Document"
            file={driver.licenseFile}
            icon="🚗"
          />
          <DocCard
            title="Driver Photo"
            file={driver.photoFile}
            icon="🧍"
          />
        </div>
      </div>

      {/* Back Button */}
      {/* Back Button */}
<div className="mt-10 flex justify-end">
  <button
    className="px-5 py-2 border rounded-lg hover:bg-gray-100"
    onClick={() => navigate("/drivers")}
  >
    ← Back
  </button>
</div>

    </div>
  );
}

/* 🔹 Reusable Info Line */
function Info({ label, value }) {
  return (
    <p className="flex justify-between border-b py-2">
      <span className="font-medium text-gray-600">{label}</span>
      <span className="text-gray-800">{value || "N/A"}</span>
    </p>
  );
}

/* 🔹 Document Card */
function DocCard({ title, file, icon }) {
  return (
    <div className="border p-4 rounded-lg text-center shadow-sm hover:shadow-md transition">
      <div className="text-4xl mb-2">{icon}</div>
      <p className="font-semibold text-gray-700 mb-2">{title}</p>
      {file ? (
        <a
          href={`/uploads/${file}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 text-sm hover:underline"
        >
          View / Download
        </a>
      ) : (
        <p className="text-gray-500 text-sm italic">Not uploaded</p>
      )}
    </div>
  );
}
