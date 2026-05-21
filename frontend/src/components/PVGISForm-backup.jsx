import React, { useEffect, useState } from "react";
import axios from "axios";
import PVGISMap from "./PVGISMap";

function PVGISForm({ BASE_URL, pvgisData, onChange }) {
  // Locales para inputs controlados
  const [lat, setLat] = useState(pvgisData.latitude || "");
  const [lon, setLon] = useState(pvgisData.longitude || "");
  const [kwp, setKwp] = useState(pvgisData.anlagengroesse || "");
  const [production, setProduction] = useState(null);
  const [spezErtrag, setSpezErtrag] = useState(null);

  // Sincronizar cambios locales con estado global
  useEffect(() => {
    if (onChange) {
      onChange({
        latitude: lat,
        longitude: lon,
        anlagengroesse: kwp
      });
    }
  }, [lat, lon, kwp]);

  useEffect(() => {
    if (pvgisData?.anlagengroesse) {
      setKwp(pvgisData.anlagengroesse);
    }
  }, [pvgisData?.anlagengroesse]);

  const handlePVGIS = async () => {
    const la = parseFloat(lat);
    const lo = parseFloat(lon);
    const k = parseFloat(kwp);

    if (isNaN(la) || isNaN(lo) || isNaN(k) || k <= 0) {
      alert("Bitte gültige Werte eingeben!");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/pvgis`, {
        lat: la,
        lon: lo,
        kwp: k,
        loss: 0, // <--- Forzar PVGIS a no restar el 14% (pérdidas) sino considerar el PR ingresado
      });

      const prod = response.data.annual_production; // kWh/a
      setProduction(prod);

      const se = prod / k;
      setSpezErtrag(se);

      if (onChange) {
        // ✅ KEY CORREGIDO: spezifischer_ertrag para Ertragswert
        onChange({
          latitude: la,
          longitude: lo,
          anlagengroesse: k,
          production: prod,
          spezifischer_ertrag: se// ← FIXED!
        });
      }
    } catch (error) {
      console.error(error);
      alert("Fehler bei PVGIS Anfrage!");
    }
  };

  const handleMapClick = (clickedLat, clickedLon) => {
    setLat(clickedLat.toFixed(5));
    setLon(clickedLon.toFixed(5));
  };

  return (
    <div className="card mb-4 p-3">

      {/* HEADER */}
      <h4 className="mb-2 text-primary fw-bold">
        5. PVGIS-Standortanalyse{" "}
        <span className="badge bg-info align-middle">OPTIONAL</span>
      </h4>

      <p className="text-muted">
        Automatische Berechnung von Jahresertrag und spezifischem
        Ertrag anhand von Standortdaten.
      </p>

      <hr />

      {/* STANDORT */}
      <h5 className="mb-3">
        Standort auswählen oder Koordinaten eingeben
      </h5>

      {/* MAP */}
      <PVGISMap
        lat={lat}
        lon={lon}
        onClick={handleMapClick}
      />

      {/* LATITUDE */}
      <div className="mb-3 mt-3">
        <label className="form-label">
          Breitengrad (Latitude)
        </label>

        <input
          type="number"
          step="any"
          className="form-control"
          placeholder="z.B. 48.1374"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
      </div>

      {/* LONGITUDE */}
      <div className="mb-3">
        <label className="form-label">
          Längengrad (Longitude)
        </label>

        <input
          type="number"
          step="any"
          className="form-control"
          placeholder="z.B. 11.5755"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
        />

        <div className="form-text">
          Koordinaten können direkt eingegeben oder über die Karte
          ausgewählt werden.
        </div>
      </div>

      <hr />

      {/* ANLAGENGRÖSSE */}
      <div className="mb-3">
        <label className="form-label">
          Anlagengröße (kWp)
        </label>

        <input
          type="number"
          step="any"
          className="form-control"
          placeholder="z.B. 10"
          value={kwp}
          onChange={(e) => setKwp(e.target.value)}
        />

        <div className="form-text">
          Automatisch aus den Anlagendaten übernommen.
        </div>
      </div>

      {/* BUTTON */}
      <button
        className="btn btn-primary mt-2"
        onClick={handlePVGIS}
      >
        PVGIS berechnen
      </button>

      {/* RESULTS */}
      {production != null && (
        <div className="alert alert-success mt-4">

          <h5 className="mb-3">
            PVGIS Ergebnisse
          </h5>

          <div>
            <strong>Jährliche Produktion:</strong>{" "}
            {production.toFixed(0)} kWh/a
          </div>

          {spezErtrag != null && (
            <div>
              <strong>Spezifischer Ertrag:</strong>{" "}
              {spezErtrag.toFixed(0)} kWh/kWp
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default PVGISForm;
