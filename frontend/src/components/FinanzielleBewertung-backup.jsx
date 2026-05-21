// FinanzielleBewertung.jsx PRO - Versión corregida FINAL (Sincronizada con Ertragswert y Formato Europeo)
import React, { useState, useContext } from "react";
import { FinancialContext } from "./FinancialContext.jsx";

function FinanzielleBewertung({ ertragswertData, buchwertData, onResult }) {
  const [discountRate, setDiscountRate] = useState("5");
  const [horizon, setHorizon] = useState("20");

  // ✅ Usar OPEX global
  const { opex, setOpex } = useContext(FinancialContext);

  const [npv, setNpv] = useState(null);
  const [irr, setIrr] = useState(null);
  const [cashflows, setCashflows] = useState([]);
  const [paybackYear, setPaybackYear] = useState(null);
  const [interpretation, setInterpretation] = useState("");

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

  // -----------------------------
  // Función IRR robusta
  // -----------------------------
  const calculateIRR = (flows, guess = 0.01, tol = 1e-6, maxIter = 1000) => {
    if (flows.every(f => f <= 0) || flows.every(f => f >= 0)) return "nicht erreichbar";

    let irrGuess = guess;
    for (let i = 0; i < maxIter; i++) {
      let npvTest = 0;
      let deriv = 0;
      for (let t = 0; t < flows.length; t++) {
        npvTest += flows[t] / Math.pow(1 + irrGuess, t);
        deriv += -t * flows[t] / Math.pow(1 + irrGuess, t + 1);
      }
      const newGuess = deriv !== 0 ? irrGuess - npvTest / deriv : irrGuess - npvTest / 1e-6;
      if (!isFinite(newGuess)) return "nicht erreichbar"; 
      if (Math.abs(newGuess - irrGuess) < tol) return (newGuess * 100).toFixed(2); 
      irrGuess = newGuess;
    }
    return (irrGuess * 100).toFixed(2); 
  };

  // -----------------------------
  // Cálculo de flujos, NPV, IRR y Payback
  // -----------------------------
  const calculateFinanzen = () => {
    if (!ertragswertData) {
      alert("Bitte zuerst Ertragswert berechnen!");
      return;
    }

    // Definición de variables base con parseo europeo
    const initialInvestment = parseEuroFloat(buchwertData?.buchwert || buchwertData?.anschaffung || 0);
    const horizonVal = parseEuroFloat(horizon);
    const restlaufzeit = parseEuroFloat(ertragswertData?.restlaufzeit || horizonVal);
    const einnahmen_jahr1 = parseEuroFloat(ertragswertData?.jahresertragBrutto || 0);
    const degradacion = parseEuroFloat(ertragswertData?.degradacion_anual || 0.5) / 100;
    const opexVal = parseEuroFloat(opex || 0);
    const r = parseEuroFloat(discountRate) / 100;
    const yearsWithFlow = Math.min(horizonVal, restlaufzeit);

    if (isNaN(initialInvestment) || initialInvestment <= 0) {
      alert("Buchwert (Investition) fehlt oder ist 0. Bitte CAPEX oben eingeben.");
      return;
    }

    if (isNaN(einnahmen_jahr1) || einnahmen_jahr1 <= 0) {
      alert("Ertragswerte fehlen! Bitte Schritt 4 berechnen.");
      return;
    }

    // -----------------------------
    // Construir flujos
    // -----------------------------
    const flows = [-initialInvestment]; 
    let cumulative = -initialInvestment;
    let payback = null;
    let currentYearIncome = einnahmen_jahr1;

    for (let t = 1; t <= yearsWithFlow; t++) {
      const annualNetFlow = currentYearIncome - opexVal;
      flows.push(annualNetFlow);

      cumulative += annualNetFlow;
      if (payback === null && cumulative >= 0) payback = t;

      currentYearIncome *= (1 - degradacion);
    }

    const npvCalc = flows.reduce((acc, val, t) => acc + val / Math.pow(1 + r, t), 0);
    const irrPercentRaw = calculateIRR(flows);
    
    // Formatear IRR para visualización europea si es un número
    const irrDisplay = (typeof irrPercentRaw === "string" && irrPercentRaw !== "nicht erreichbar") 
      ? irrPercentRaw.replace(".", ",") 
      : irrPercentRaw;

    let interpretationText =
      npvCalc > 0
        ? "✅ Investition ist wirtschaftlich sinnvoll"
        : "⚠️ Wirtschaftlichkeit eingeschränkt!\n Rentabilität nur bei hohem Eigenverbrauch erreichbar → Elektroauto, Heim-Batterie oder Wärmepumpe. Oder Anschaffungskosten (CAPEX) senken durch günstige Module, effiziente Installation oder Förderungen.";

    setNpv(npvCalc.toFixed(2));
    setIrr(irrDisplay);
    setCashflows(flows);
    setPaybackYear(payback);
    setInterpretation(interpretationText);

    if (onResult) {
      onResult({
        npv: npvCalc.toFixed(2),
        irr: irrPercentRaw,
        discount_rate: parseEuroFloat(discountRate),
        horizon: horizonVal,
        opex: opexVal,
        interpretation: interpretationText,
        cashflows: flows,
        payback: payback,
      });
    }
  };

  return (
    <div className="card mb-4 p-3">
      <h4 className="text-primary fw-bold">
        6. Finanzielle Bewertung & Übersicht <span className="badge bg-warning">PRO</span>
      </h4>

      <div className="row">
        <div className="col-md-4 mb-2">
          <label>Diskontsatz (%):</label>
          <input
            type="text"
            className="form-control"
            value={discountRate}
            onChange={(e) => setDiscountRate(e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-2">
          <label>Zeithorizont (Jahre):</label>
          <input
            type="text"
            className="form-control"
            value={horizon}
            onChange={(e) => setHorizon(e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-2">
          <label>Betriebskosten (OPEX) pro Jahr (€):</label>
          <input
            type="text"
            className="form-control"
            value={opex}
            onChange={(e) => setOpex(e.target.value)}
          />
        </div>
      </div>

      <button className="btn btn-dark w-100 mt-3" onClick={calculateFinanzen}>
        📊 Finanzanalyse berechnen
      </button>

      {npv && (
        <div className="mt-4 p-3 border rounded bg-light">
          <div className="row text-center">
            <div className="col-md-4">
              <h5 className="text-success">💰 Netto-Kapitalwert (NPV)</h5>
              <h3>{formatEuro(npv)} €</h3>
            </div>
            <div className="col-md-4">
              <h5 className="text-primary">📈 Interne Rendite (IRR)</h5>
              <h3>{irr} {irr === "nicht erreichbar" ? "" : "%"}</h3>
            </div>
            <div className="col-md-4">
              <h5 className="text-warning">⏱ Amortisationsdauer (Payback)</h5>
              <h3>{paybackYear ? `Jahr ${paybackYear}` : "–"}</h3>
            </div>
          </div>

          <hr />

          <h6>📊 Cashflow pro Jahr (inkl. Jahr 0):</h6>
          <div style={{ maxHeight: "180px", overflowY: "auto" }}>
            {cashflows.map((cf, index) => (
              <div key={index}>
                Jahr {index}: {formatEuro(cf)} €
              </div>
            ))}
          </div>

          <div className="alert alert-info mt-3" style={{ whiteSpace: 'pre-line' }}>
            <strong>Interpretation:</strong>
            <br />
            {interpretation}
          </div>
        </div>
      )}
    </div>
  );
}

export default FinanzielleBewertung;