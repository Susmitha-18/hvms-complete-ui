// frontend/src/widgets/ClientCard.jsx
import React from "react";

export default function ClientCard({ c }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition duration-200 ease-in-out">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          {c.name || "Unnamed Client"}
        </h2>

        <span
          className={
            "text-xs px-2 py-1 rounded font-medium " +
            (c.status === "Active"
              ? "bg-green-100 text-green-700"
              : c.status === "Inactive"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700")
          }
        >
          {c.status || "Unknown"}
        </span>
      </div>

      {/* Client Info */}
      <div className="text-sm text-gray-600 space-y-1">
        <p>📞 {c.phone || "No phone available"}</p>
        <p>✉️ {c.email || "No email provided"}</p>
        <p>
          🏙️ {c.city || "N/A"}
          {c.state ? `, ${c.state}` : ""}
        </p>
        <p>🏭 Industry: {c.industry || "N/A"}</p>
      </div>

      {/* Address */}
      {c.address && (
        <p className="text-xs text-gray-500 mt-3 leading-snug">
          📍 {c.address}
        </p>
      )}

      {/* Notes */}
      {c.notes && (
        <p className="text-xs text-gray-500 mt-3 italic border-t border-gray-200 pt-2">
          “{c.notes}”
        </p>
      )}
    </div>
  );
}
