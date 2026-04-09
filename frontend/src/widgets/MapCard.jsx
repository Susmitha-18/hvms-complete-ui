import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "../services/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon paths (same as FreeMap)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MapCard({ lastUpdatedText }) {
  const [vehicles, setVehicles] = useState([]);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const geocodeCache = useRef({});
  const historyCache = useRef({});

  // ✅ Fetch vehicles with their latest address (from optimized backend)
  useEffect(() => {
    const loadMapData = async () => {
      try {
        // If runtime asked to skip map fetch (production hotfix), do nothing
        if (typeof window !== 'undefined' && window.__HVMS_SKIP_MAP_FETCH) {
          setVehicles([]);
          return;
        }

        const vRes = await apiFetch("/api/vehicles/latest-locations");
        const vData = await vRes.json();
        const list = vData.vehicles || [];

        // For each vehicle, try to enrich with latest history (clientAddress)
        const enriched = await Promise.all(
          list.map(async (v) => {
            const vehicleId = v.vehicleId || v.id;

            // try cache first
            if (!historyCache.current[vehicleId]) {
              try {
                const hRes = await apiFetch(
                  `/api/vehicles/history/${vehicleId}`
                );
                const hData = await hRes.json();
                historyCache.current[vehicleId] = (hData.history && hData.history[0]) || null;
              } catch (err) {
                // ignore history fetch errors
                historyCache.current[vehicleId] = null;
              }
            }

            const latest = historyCache.current[vehicleId];
            const address = (latest && latest.clientAddress) || v.address || null;
            const vehicleName = v.vehicleName || v.name || (latest && latest.vehicleId && latest.vehicleId.name) || "Vehicle";
            const vid = v.vehicleId || v.id || (latest && latest.vehicleId && latest.vehicleId._id) || null;

            return {
              ...v,
              address,
              vehicleName,
              vehicleId: vid,
            };
          })
        );

        // Keep only those with valid addresses
        setVehicles(enriched.filter((e) => e.address && e.address.trim()));
      } catch (err) {
        console.error("❌ Error loading vehicle map data:", err);
      }
    };

    loadMapData();
  }, []);

  // ✅ Initialize Leaflet map
  useEffect(() => {
    if (!map) {
      const newMap = L.map("vehicleMap").setView([11.0168, 76.9558], 8); // Coimbatore default
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(newMap);
      setMap(newMap);
    }
  }, [map]);

  // ✅ Plot vehicle markers
  useEffect(() => {
    if (!map || vehicles.length === 0) return;

    // Remove old markers only
    markers.forEach((marker) => map.removeLayer(marker));

    const newMarkers = [];

    // Helper to geocode with in-memory cache (reduces Nominatim calls)
    const geocode = async (address) => {
      const key = address.trim();
      if (geocodeCache.current[key]) return geocodeCache.current[key];
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            address
          )}`
        );
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          const { lat, lon, display_name } = geoData[0];
          const val = { lat: parseFloat(lat), lon: parseFloat(lon), display_name };
          geocodeCache.current[key] = val;
          return val;
        }
      } catch (err) {
        console.error("❌ Geocode failed for", address, err);
      }
      geocodeCache.current[key] = null;
      return null;
    };

    (async () => {
      for (const v of vehicles) {
        if (!v.address) continue;
        const g = await geocode(v.address);
        if (!g) continue;
        const lat = Number(g.lat);
        const lon = Number(g.lon);
        if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
        const marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup(
          `<b>${v.vehicleName || v.name}</b><br/>${g.display_name}<br/><small>Reg: ${v.registrationNumber || "N/A"} • ID: ${v.vehicleId || v.id}</small>`
        );
        newMarkers.push(marker);
      }

      // Debug: log what was plotted
      try { console.debug('[MapCard] plotted markers:', newMarkers.length, vehicles); } catch(e) {}

      setMarkers(newMarkers);
    })();
  }, [vehicles, map]);

  return (
    <div className="card card-shadow p-6 map-gradient">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-extrabold">Live Vehicle Tracking</h3>
        <div className="text-sm text-gray-600">Vehicle Status</div>
      </div>

      <div
        id="vehicleMap"
        className="rounded-md border border-gray-300"
        style={{ height: "400px", width: "100%" }}
      ></div>

      <div className="mt-3 text-sm text-gray-600">
        <b>Last Update:</b> {lastUpdatedText || "Just now"}
      </div>

      {/* Debug panel: visible list of vehicles and resolved coords */}
      <div className="mt-4 text-sm text-gray-700">
        <h4 className="font-semibold mb-2">Debug: resolved vehicles</h4>
        {vehicles.length === 0 ? (
          <div className="text-gray-500">No vehicles with addresses found.</div>
        ) : (
          <ul className="space-y-2 max-h-48 overflow-auto">
            {vehicles.map((v, i) => {
              const key = v.address && v.address.trim();
              const ge = key ? geocodeCache.current[key] : null;
              return (
                <li key={i} className="border rounded p-2 bg-white">
                  <div className="font-semibold">{v.vehicleName || v.name} — {v.vehicleId || v.id}</div>
                  <div className="text-xs text-gray-600">Address: {v.address}</div>
                  <div className="text-xs text-gray-600">Geocode: {ge ? `${ge.lat}, ${ge.lon}` : "(not geocoded yet or failed)"}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
