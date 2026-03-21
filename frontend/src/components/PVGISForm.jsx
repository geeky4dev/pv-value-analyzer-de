import React, { useState } from "react";
import axios from "axios";

function PVGISForm({ BASE_URL, onResult }) {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [kwp, setKwp] = useState("");
  const [production, setProduction] = useState(null);

  const handlePVGIS = async () => {
    const la = parseFloat(lat);
    const lo = parseFloat(lon);
    const k = parseFloat(kwp);

    if (isNaN(la) || isNaN(lo) || isNaN(k)) {
      alert("Bitte gültige Werte eingeben!");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/pvgis`,
        {
          lat: la,
          lon: lo,
          kwp: k,
        }
      );

      const prod = response.data.annual_production;

      setProduction(prod);

      // enviar al padre (App.jsx)
      if (onResult) {
        onResult(prod);
      }

    } catch (error) {
      console.error(error);
      alert("Fehler bei PVGIS Anfrage!");
    }
  };

  return (
    <div className="card mb-4 p-3">
      <h4>PVGIS – Standortbasierte Berechnung</h4>

      <div className="mb-2">
        <label>Breitengrad (Latitude):</label>
        <input
          type="number"
          className="form-control"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
      </div>

      <div className="mb-2">
        <label>Längengrad (Longitude):</label>
        <input
          type="number"
          className="form-control"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
        />
      </div>

      <div className="mb-2">
        <label>Anlagengröße (kWp):</label>
        <input
          type="number"
          className="form-control"
          value={kwp}
          onChange={(e) => setKwp(e.target.value)}
        />
      </div>

      <button className="btn btn-primary mt-2" onClick={handlePVGIS}>
        PVGIS berechnen
      </button>

      {production && (
        <div className="mt-3">
          <strong>Jährliche Produktion:</strong> {production} kWh
        </div>
      )}
    </div>
  );
}

export default PVGISForm;
