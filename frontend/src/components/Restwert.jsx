import React, { useState } from "react";
import axios from "axios";

function Restwert({ onResult }) {
  const [ertragswert, setErtragswert] = useState("");
  const [kostenabschlag, setKostenabschlag] = useState(10);
  const [verkaufsabschlag, setVerkaufsabschlag] = useState(50);
  const [wartungRegelmaessig, setWartungRegelmaessig] = useState(true); // Nuevo estado
  const [zukunft, setZukunft] = useState(null);
  const [restwert, setRestwert] = useState(null);

  const calculateRestwert = async () => {
    const ew = parseFloat(ertragswert);
    const ka = parseFloat(kostenabschlag);
    const va = parseFloat(verkaufsabschlag);
    const wartung = wartungRegelmaessig ? 1 : 0.85; // +15% penalización si NO mantenimiento

    if (isNaN(ew) || isNaN(ka) || isNaN(va)) {
      alert("Bitte gültige Zahlen eingeben!");
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/restwert`, {
        ertragswert: ew,
        kostenabschlag: ka,
        verkaufsabschlag: va,
        wartung_regelmaessig: wartungRegelmaessig, // Nuevo parámetro backend
      });

      const zuk = response.data.zukuenftige_gewinne.toFixed(2);
      const rw = response.data.restwert.toFixed(2);

      setZukunft(zuk);
      setRestwert(rw);

      if (onResult) onResult({ 
        zukuenftige_gewinne: zuk, 
        restwert: rw,
        wartung_regelmaessig: wartungRegelmaessig 
      });
    } catch (error) {
      console.error(error);
      alert("Fehler beim Berechnen des Restwerts!");
    }
  };

  return (
    <div className="card mb-4 p-3">
      <h4>Restwert berechnen</h4>

      <div className="mb-3">
        <label className="form-label">Ertragswert (€): Oben berechnet</label>
        <input
          type="number"
          className="form-control"
          value={ertragswert}
          onChange={(e) => setErtragswert(e.target.value)}
        />
      </div>

      {/* SLIDER KOSTENABSLAG */}
      <div className="mb-3">
        <label className="form-label">
          <strong>Abschlag für Kosten (%)</strong>
          <span className="float-end fw-bold text-success">{kostenabschlag}%</span>
        </label>
        <input
          type="range"
          className="form-range"
          min="5"
          max="30"
          step="1"
          value={kostenabschlag}
          onChange={(e) => setKostenabschlag(e.target.value)}
        />
        <small className="text-muted">von 5% bis 30% (Standard: 10%)</small>
      </div>

      {/* SLIDER VERKAUFSABSLAG */}
      <div className="mb-3">
        <label className="form-label">
          <strong>Abschlag für fairen Verkaufspreis (%)</strong>
          <span className="float-end fw-bold text-success">{verkaufsabschlag}%</span>
        </label>
        <input
          type="range"
          className="form-range"
          min="30"
          max="80"
          step="1"
          value={verkaufsabschlag}
          onChange={(e) => setVerkaufsabschlag(e.target.value)}
        />
        <small className="text-muted">von 30% bis 80% (Standard: 50%)</small>
      </div>

      {/* ✅ TOGGLE MANTENIMIENTO NUEVO */}
      <div className="mb-3">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="wartungSwitch"
            checked={wartungRegelmaessig}
            onChange={(e) => setWartungRegelmaessig(e.target.checked)}
          />
          <label className="form-check-label fw-bold" htmlFor="wartungSwitch">
            ✅ Regelmäßige Wartung (jährliche Inspektion)
          </label>
        </div>
        <small className={`text-${wartungRegelmaessig ? 'success' : 'warning'}`}>
          {wartungRegelmaessig 
            ? "✨ +15% Restwert (bessere Marktchancen)" 
            : "⚠️ -15% Restwert (Wartungsnachweise fehlen)"
          }
        </small>
      </div>

      <button className="btn btn-primary w-100 mb-3" onClick={calculateRestwert}>
        🔄 Restwert berechnen
      </button>

      {zukunft !== null && restwert !== null && (
        <div className="alert alert-success">
          <h5>✅ Ergebnis</h5>
          <div className="row text-center mb-3">
            <div className="col-md-6">
              <div className="bg-light p-3 rounded">
                <strong>Zukünftige Gewinne:</strong><br />
                <span className="h4 text-success">{zukunft} €</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="bg-light p-3 rounded">
                <strong>Restwert:</strong><br />
                <span className="h4 text-success">{restwert} €</span>
              </div>
            </div>
          </div>

          <hr />
          <div className="row">
            <div className="col-md-8">
              <strong>Formel:</strong> Ertragswert × (1-{kostenabschlag}%) × (1-{verkaufsabschlag}%) × {wartungRegelmaessig ? 'Wartungsfaktor 1.0' : 'Wartungsmalus 0.85'}
            </div>
            <div className="col-md-4 text-end">
              <span className={`badge ${wartungRegelmaessig ? 'bg-success' : 'bg-warning'}`}>
                {wartungRegelmaessig ? '✨ Wartung OK' : '⚠️ Wartung fehlt'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Restwert;

