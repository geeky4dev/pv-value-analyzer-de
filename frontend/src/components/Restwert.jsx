import React, { useState } from "react";
import { useEffect } from "react";

function Restwert({ ertragswert, performanceRatio, onResult, restlaufzeit, zustandAnlage }) {
  const [kostenabschlag, setKostenabschlag] = useState(10);
  const [verkaufsabschlag, setVerkaufsabschlag] = useState(50);
  const [wartungRegelmaessig, setWartungRegelmaessig] = useState(true);
  const [zustand, setZustand] = useState("gut");
  const [pr, setPr] = useState("80");
  const [restlaufzeitState, setRestlaufzeitState] = useState(restlaufzeit || "");
  const [marktfaktor, setMarktfaktor] = useState(100);

  const [zukunft, setZukunft] = useState(null);
  const [restwertCalc, setRestwertCalc] = useState(null);

  useEffect(() => {
    if (performanceRatio !== undefined && performanceRatio !== null) {
      setPr(String(performanceRatio));
    }
  }, [performanceRatio]);

  useEffect(() => {
    if (restlaufzeit !== undefined) {
      setRestlaufzeitState(String(restlaufzeit));
    }
  }, [restlaufzeit]);

  useEffect(() => {

    const zustandMapping = {
      "Sehr gut": "ausgezeichnet",
      "Gut": "gut",
      "Mittel": "durchschnittlich",
      "Schlecht": "schlecht"
    };

    if (zustandAnlage) {
      setZustand(zustandMapping[zustandAnlage] || "gut");
    }

  }, [zustandAnlage]);


  // Helper para procesar entradas con coma o punto
  const parseEuroFloat = (val) => {
    if (val === null || val === undefined || val === "") return 0;
    const str = String(val).replace(",", ".");
    return parseFloat(str) || 0;
  };

  // Helper para mostrar formato europeo en la interfaz
  const formatEuro = (valor) => {
    if (valor === null || valor === undefined) return "0,00";
    return parseFloat(valor).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calculateRestwert = () => {
    const ew = parseEuroFloat(ertragswert);
    if (isNaN(ew) || ew === 0) {
      alert("Bitte zuerst Ertragswert berechnen!");
      return;
    }

    const prVal = parseEuroFloat(pr);
    const rlVal = parseEuroFloat(restlaufzeit);

    let zukuenftigeGewinne = ew * (1 - kostenabschlag / 100);

    if (wartungRegelmaessig) zukuenftigeGewinne *= 1.15;

    const zustandMap = {
      ausgezeichnet: 1.1,
      gut: 1.0,
      durchschnittlich: 0.9,
      schlecht: 0.8
    };

    zukuenftigeGewinne *= zustandMap[zustand];

    if (prVal > 85) zukuenftigeGewinne *= 1.05;
    else if (prVal < 75) zukuenftigeGewinne *= 0.9;

    if (rlVal > 15) zukuenftigeGewinne *= 1.1;
    else if (rlVal < 10) zukuenftigeGewinne *= 0.85;

    zukuenftigeGewinne *= marktfaktor / 100;
    const restwert = zukuenftigeGewinne * (verkaufsabschlag / 100);

    setZukunft(zukuenftigeGewinne.toFixed(2));
    setRestwertCalc(restwert.toFixed(2));

    // ✅ ADDED: readable label for PDF (NO LOGIC CHANGE)
    const zustandLabels = {
      ausgezeichnet: "Ausgezeichnet (+10%)",
      gut: "Gut (0%)",
      durchschnittlich: "Durchschnittlich (-10%)",
      schlecht: "Schlecht (-20%)"
    };

    if (onResult) {
      onResult({
        ertragswert: ew.toFixed(2),
        zukuenftige_gewinne: zukuenftigeGewinne.toFixed(2),
        restwert: restwert.toFixed(2),
        kostenabschlag,
        verkaufsabschlag,
        wartung: wartungRegelmaessig,
        zustand,
        zustand_label: zustandLabels[zustand], // ✅ IMPORTANT ADDITION
        pr: prVal,
        restlaufzeit: rlVal,
        marktfaktor
      });
    }
  };

  return (
    <div className="card mb-4 p-3">
      <h4 className="text-primary fw-bold">
        7. Restwert berechnen 
      </h4>

      <div className="mb-3">
        <label>Ertragswert (€):</label>
        <input
          type="text"
          className="form-control"
          value={formatEuro(ertragswert)}
          readOnly
          style={{ backgroundColor: "#e9ecef" }}
        />
      </div>

      <div className="mb-3">
        <label>
          <strong>Abschlag für Kosten (%) auswählen:</strong>
          <span className="float-end fw-bold text-success">{kostenabschlag} %</span>
        </label>
        <input
          type="range"
          className="form-range"
          min="5"
          max="30"
          value={kostenabschlag}
          onChange={(e) => setKostenabschlag(Number(e.target.value))}
        />
      </div>

      <div className="mb-3">
        <label>
          <strong>Abschlag für Verkauf (%) auswählen:</strong>
          <span className="float-end fw-bold text-success">
            {verkaufsabschlag}%
          </span>
        </label>
        <input
          type="range"
          className="form-range"
          min="30"
          max="80"
          value={verkaufsabschlag}
          onChange={(e) => setVerkaufsabschlag(Number(e.target.value))}
        />
      </div>

      <div className="form-check form-switch mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          checked={wartungRegelmaessig}
          onChange={(e) => setWartungRegelmaessig(e.target.checked)}
        />
        <label className="form-check-label">
          Regelmäßige Wartung <span className="badge bg-success">+15%</span>
        </label>
      </div>

      <div className="mb-2">
        <label>Zustand der Anlage:</label>
        <select
          className="form-select"
          value={zustand}
          disabled
        >
          <option value="ausgezeichnet">Ausgezeichnet (+10%)</option>
          <option value="gut">Gut (0%)</option>
          <option value="durchschnittlich">Durchschnittlich (-10%)</option>
          <option value="schlecht">Schlecht (-20%)</option>
        </select>
      </div>

      <div className="mb-2">
        <label>Performance Ratio (%):</label>
        <input type="text" className="form-control" value={pr} readOnly disabled />
      </div>

      <div className="mb-2">
        <label>Restlaufzeit (Jahre):</label>
        <input
          type="text"
          className="form-control"
          value={restlaufzeit}
          onChange={(e) => setRestlaufzeit(e.target.value)}
        />
      </div>

      <div className="mb-2">
        <label>Marktfaktor:</label>
        <select
          className="form-select"
          value={marktfaktor}
          onChange={(e) => setMarktfaktor(Number(e.target.value))}
        >
          <option value="90">Schwach (90%)</option>
          <option value="100">Normal (100%)</option>
          <option value="110">Stark (110%)</option>
        </select>
      </div>

      <button
        className="btn btn-primary w-100 mt-3"
        onClick={calculateRestwert}
      >
        💰 Restwert berechnen
      </button>

      {restwertCalc && (
        <div className="alert alert-success mt-3">
          <h5>Ergebnis</h5>
          <p>
            <strong>Zukünftige Gewinne:</strong> {formatEuro(zukunft)} €
          </p>
          <p>
            <strong>Restwert:</strong> {formatEuro(restwertCalc)} €
          </p>
        </div>
      )}
    </div>
  );
}

export default Restwert;