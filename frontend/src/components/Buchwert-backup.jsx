// Buchwert.jsx – Version mejorada con Lebensdauer y Abschreibungsmethode + Abschreibung anual
import React, { useState } from "react";
import axios from "axios";

// ✅ FORMATO ALEMÁN (GLOBAL)
const formatDE = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

function Buchwert({ onResult }) {
  const [anschaffung, setAnschaffung] = useState("");
  const [alter, setAlter] = useState("");
  const [lebensdauer, setLebensdauer] = useState("25"); // estándar 25 años
  const [methode, setMethode] = useState("linear"); // linear / degressiv
  const [abschreibung, setAbschreibung] = useState(null);
  const [abschreibungJahr, setAbschreibungJahr] = useState(null);
  const [buchwert, setBuchwert] = useState(null);

  const calculateBuchwert = async () => {
    // ✅ FIX: soporta formato europeo (120.000, 120,000, etc.)
    const a = parseFloat(
      anschaffung.toString().replace(/\./g, "").replace(",", ".")
    );
    const al = parseFloat(
      alter.toString().replace(",", ".")
    );
    const ld = parseFloat(
      lebensdauer.toString().replace(",", ".")
    );

    if (isNaN(a) || isNaN(al) || isNaN(ld)) {
      alert("Bitte gültige Zahlen eingeben!");
      return;
    }

    try {
      let absch = 0;
      let bw = 0;
      let abschJ = 0;

      if (methode === "linear") {
        // Abschreibung anual = Anschaffungskosten / Lebensdauer
        abschJ = a / ld;
        // Abschreibung acumulada = Abschreibung anual × Alter
        absch = abschJ * al;
        bw = a - absch;
      } else if (methode === "degressiv") {
        const t = 0.2; // 20% degressivo
        bw = a;
        absch = 0;

        // Parte entera y decimal del Alter
        const alGanz = Math.floor(al);
        const alDez = al - alGanz;

        // Calcular acumulado y anual promedio
        for (let i = 0; i < alGanz; i++) {
          const jahresAbsch = bw * t;
          bw -= jahresAbsch;
          absch += jahresAbsch;
        }

        if (alDez > 0) {
          const jahresAbsch = bw * t * alDez;
          bw -= jahresAbsch;
          absch += jahresAbsch;
        }

        // Aproximar Abschreibung anual promedio
        abschJ = absch / al;
      }

      const restlaufzeit = Math.max(ld - al, 0);

      // ✅ GUARDAR COMO NÚMERO (NO STRING)
      setAbschreibung(absch);
      setAbschreibungJahr(abschJ);
      setBuchwert(bw);

      if (onResult) {
        onResult({
          anschaffung: a,
          alter: al,
          lebensdauer: ld,
          restlaufzeit: restlaufzeit,
          methode: methode,
          abschreibung: absch,
          abschreibungJahr: abschJ,
          buchwert: bw,
        });
      }
    } catch (error) {
      console.error(error);
      alert("Fehler beim Berechnen des Buchwerts!");
    }
  };

  return (
    <div className="card mb-4 p-3">
      <h4 className="text-primary fw-bold">3. Buchwert berechnen</h4>

      <div className="mb-2">
        <label>Anschaffungskosten / Investitionskosten (CAPEX) z.B. 50000 €:</label>
        <input
          type="number"
          className="form-control"
          value={anschaffung}
          onChange={(e) => setAnschaffung(e.target.value)}
        />
      </div>

      <div className="mb-2">
        <label>Alter der PV-Anlage (Jahre):</label>
        <input
          type="text"
          className="form-control"
          value={alter}
          onChange={(e) => setAlter(e.target.value)}
          placeholder="z.B. 8,5"
        />
      </div>

      <div className="mb-2">
        <label>Geschätzte Lebensdauer (Jahre) – Standard 25–30:</label>
        <input
          type="number"
          className="form-control"
          value={lebensdauer}
          onChange={(e) => setLebensdauer(e.target.value)}
        />
      </div>

      <div className="mb-2">
        <label>Abschreibungsmethode auswählen:</label>
        <select
          className="form-select"
          value={methode}
          onChange={(e) => setMethode(e.target.value)}
        >
          <option value="linear">Linear</option>
          <option value="degressiv">Degressiv</option>
        </select>
      </div>

      <button className="btn btn-primary mt-2" onClick={calculateBuchwert}>
        Berechnen
      </button>

      {abschreibung !== null && buchwert !== null && (
        <div className="alert alert-success mt-3">
          <h5>Ergebnis</h5>

          <p className="mb-1">
            <strong>Abschreibung pro Jahr:</strong>{" "}
            {formatDE(abschreibungJahr)} €
          </p>

          <p className="mb-1">
            <strong>Kumulierte Abschreibung:</strong>{" "}
            {formatDE(abschreibung)} €
          </p>

          <hr />

          <p className="mb-0 fs-5">
            <strong>Buchwert:</strong>{" "}
            <span className="fw-bold text-success">
              {formatDE(buchwert)} €
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default Buchwert;



