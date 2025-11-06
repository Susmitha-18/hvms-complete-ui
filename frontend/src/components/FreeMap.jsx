import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker paths
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// This component forces the map to refresh size dynamically
function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };

    // Run once initially
    setTimeout(handleResize, 400);

    // Recalculate when window resizes or scrolls
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [map]);

  return null;
}

export default function FreeMap({ vehicles = [], onTileError } ) {
  const center = [11.018, 78.121]; // Tamil Nadu region center
  const mapRef = useRef();

  return (
    <div
      ref={mapRef}
      className="w-full h-[60vh] sm:h-[70vh] md:h-[500px] lg:h-[550px] rounded-xl overflow-hidden relative"
      style={{ minHeight: "400px" }}
    >
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={true}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "0.75rem",
        }}
      >
        <ResizeMap />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          eventHandlers={{
            tileerror: (err) => {
              console.error('Tile load error', err)
              try{ onTileError && onTileError(true) }catch(e){}
            }
          }}
        />

        {vehicles.map((v, idx) => (
          <Marker key={idx} position={[v.lat, v.lng]}>
            <Popup>
              <strong>{v.name}</strong> <br />
              Status: {v.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
