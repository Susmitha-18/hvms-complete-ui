import React from "react";

export default function AdminProfile() {
  const admin = {
    username: "0405ironman",
    firstName: "iron_man",
    lastName: "",
    email: "0405ironman@gmail.com",
    phone: "",
    title: "System Administrator",
    memberSince: "October 5th, 2025",
    lastUpdated: "October 5th, 2025",
    lastLogin: "October 6th, 2025",
    status: "APPROVED",
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold">Administrator Profile</h1>
      <p className="text-gray-600">
        Manage your account settings and view your profile information
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6 border-t-8 border-yellow-200">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span>👤</span> Profile Information
          </h2>

          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              i
            </div>
            <div>
              <h3 className="text-xl font-semibold">{admin.username}</h3>
              <span className="px-2 py-1 text-xs rounded bg-black text-white">
                System Administrator
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">First Name</p>
              <p className="text-gray-800">{admin.firstName || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Name</p>
              <p className="text-gray-800">{admin.lastName || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <div className="flex items-center gap-2">
                <p className="text-gray-800">{admin.email}</p>
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                  Verified
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Numbers</p>
              <p className="text-gray-800">{admin.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Title</p>
              <p className="text-gray-800">{admin.title}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              📅 Account Details
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Member Since:</span>{" "}
                {admin.memberSince}
              </p>
              <p>
                <span className="text-gray-500">Last Updated:</span>{" "}
                {admin.lastUpdated}
              </p>
              <p>
                <span className="text-gray-500">Last Login:</span>{" "}
                {admin.lastLogin}
              </p>
              <p>
                <span className="text-gray-500">Account Status:</span>{" "}
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                  {admin.status}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              ⚙️ Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
                Account Settings
              </button>
              <button className="w-full bg-yellow-100 py-2 rounded hover:bg-yellow-200">
                Security Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
