import React from "react";

export default function LiveTrackingPanel({ vehicle }) {
  // sample location data (static)
  const location = {
    city: "Houston, TX",
    coords: "29.7604, -95.3698",
    lastUpdate: "2 minutes ago"
  };

  return (
    <div className="text-center py-12">
      <div className="inline-block text-gray-400 mb-4">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="12" cy="9" r="2.5" fill="#9CA3AF" />
        </svg>
      </div>

      <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
      <p className="text-gray-500 mb-4">Real-time GPS tracking would be displayed here</p>

      <div className="text-sm text-gray-700 max-w-md mx-auto">
        <div><strong>Current Location:</strong> {location.city}</div>
        <div><strong>Coordinates:</strong> {location.coords}</div>
        <div><strong>Last Update:</strong> {location.lastUpdate}</div>
      </div>
    </div>
  );
}
