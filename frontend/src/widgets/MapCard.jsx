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

export default function MapCard({ lastUpdatedText, vehicleLocations, vehicles: vehiclesProp }) {
  const [vehicles, setVehicles] = useState([]);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const geocodeCache = useRef({});
  const historyCache = useRef({});

  // Helper to detect if a string is a valid Indian pincode (used in multiple places)
  const isIndianPincode = (str) => {
    if (!str) return false;
    return /^\s*\d{6}\s*$/.test(str);
  };

  // ✅ Fetch vehicles with their latest address (from optimized backend)
  useEffect(() => {
    const loadMapData = async () => {
      try {
        // If the parent provided vehicleLocations (VehicleHistory) or vehicles (Dashboard), use them
        if (vehicleLocations && vehicleLocations.length > 0) {
          setVehicles(vehicleLocations.filter((e) => e && e.address && e.address.trim()));
          return;
        }

        if (vehiclesProp && vehiclesProp.length > 0) {
          setVehicles(vehiclesProp.filter((e) => e && (e.address || e.location) ));
          return;
        }

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
        setVehicles(enriched.filter((e) => e && e.address && e.address.trim()));
      } catch (err) {
        console.error("❌ Error loading vehicle map data:", err);
      }
    };

    loadMapData();
  }, [vehicleLocations]);

  // ✅ Initialize Leaflet map
  useEffect(() => {
    if (!map) {
      const newMap = L.map("vehicleMap").setView([11.0168, 76.9558], 8); // Coimbatore default
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
        minZoom: 4,
      }).addTo(newMap);
      L.control.scale().addTo(newMap);
      setMap(newMap);
      console.log('🗺️ Map initialized at Coimbatore coordinates');
    }
  }, [map]);

  // ✅ Plot vehicle markers
  useEffect(() => {
    if (!map || vehicles.length === 0) return;

    // Remove old markers only
    markers.forEach((marker) => map.removeLayer(marker));

    const newMarkers = [];

    // Helper to detect if a string is a valid Indian pincode
    const isIndianPincode = (str) => {
      return /^\s*\d{6}\s*$/.test(str); // Indian pincodes are exactly 6 digits
    };

    // Helper to geocode with in-memory cache (reduces Nominatim calls)
    const geocode = async (address) => {
      const key = address.trim();
      if (geocodeCache.current[key]) return geocodeCache.current[key];

      try {
        // Check if the address is just a pincode
        const isPincode = isIndianPincode(key);
        const searchQuery = isPincode ? `${key}, India` : key;

        // For all Indian addresses, add country context and limit
        const searchUrl = `https://nominatim.openstreetmap.org/search?` +
          `format=json&` +
          `q=${encodeURIComponent(searchQuery)}&` +
          `countrycodes=in&` + // Always search in India
          `limit=1&` +
          `addressdetails=1`; // Get detailed address info

        console.log('🔍', isPincode ? 'Geocoding Indian pincode:' : 'Geocoding address:', key, searchUrl);

        const geoRes = await fetch(searchUrl, {
          headers: { 'Accept-Language': 'en' }
        });

        if (!geoRes.ok) {
          throw new Error(`Geocoding failed with status ${geoRes.status}`);
        }

        const geoData = await geoRes.json();

        if (geoData && geoData.length > 0) {
          const { lat, lon, display_name } = geoData[0];
          const val = {
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            display_name,
            isPincode,
            originalAddress: key,
          };
          geocodeCache.current[key] = val;
          console.log('✅ Geocoded:', isPincode ? 'pincode' : 'address', key, '→', `${lat},${lon}`);
          return val;
        } else {
          console.log('⚠️ No geocoding results for:', key);
        }
      } catch (err) {
        console.error('❌ Geocode failed for', address, err);
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
        // Use a different marker style for pincodes
        const markerOptions = g.isPincode ? {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background-color: #4299E1; color: white; padding: 5px; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);'>📍</div>",
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })
        } : {};
        
        const marker = L.marker([lat, lon], markerOptions).addTo(map);
        const popupContent = g.isPincode
          ? `<div class="text-center">
               <b>${v.vehicleName || v.name}</b>
               <br/>📍 Pincode: ${v.address.trim()}
               <br/><small>Location: ${g.display_name}</small>
               <br/><small>Reg: ${v.registrationNumber || "N/A"} • ID: ${v.vehicleId || v.id}</small>
             </div>`
          : `<b>${v.vehicleName || v.name}</b>
             <br/>${g.display_name}
             <br/><small>Reg: ${v.registrationNumber || "N/A"} • ID: ${v.vehicleId || v.id}</small>`;
        
        marker.bindPopup(popupContent);
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
              const isPincode = key && isIndianPincode(key);
              
              return (
                <li key={i} className="border rounded p-2 bg-white">
                  <div className="font-semibold">{v.vehicleName || v.name} — {v.vehicleId || v.id}</div>
                  <div className="text-xs text-gray-600">
                    {isPincode ? (
                      <span>
                        Pincode: <span className="font-medium text-blue-600">{key}</span>
                      </span>
                    ) : (
                      <span>Address: {v.address}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    Location: {ge ? (
                      <span className="text-green-600">
                        {ge.lat.toFixed(4)}, {ge.lon.toFixed(4)}
                        {isPincode && " 📍"}
                      </span>
                    ) : (
                      <span className="text-orange-500">
                        {isPincode ? "Geocoding pincode..." : "Not geocoded yet"}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
