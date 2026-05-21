import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";

function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      if (onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function PVGISMap({ lat, lon, onClick }) {
  const hasCoords = lat !== "" && lon !== "";
  const center = hasCoords
    ? [parseFloat(lat), parseFloat(lon)]
    : [48.1374, 11.5755]; // München por defecto

  return (
    <div style={{ height: "300px", width: "100%", marginTop: "8px" }}>
      <MapContainer
        center={center}
        zoom={10}
        style={{ 
          height: "100%", 
          width: "100%", 
          cursor: "crosshair"
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap-Mitwirkende'
        />

        {/* Escucha clics en el mapa */}
        <ClickHandler onClick={onClick} />

        {/* Marcador en las coords actuales */}
        {hasCoords && (
          <Marker position={[parseFloat(lat), parseFloat(lon)]}>
            <Popup>
              Lat: {parseFloat(lat).toFixed(5)}, Lon: {parseFloat(lon).toFixed(5)}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default PVGISMap;














