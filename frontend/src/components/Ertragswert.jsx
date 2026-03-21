// Ertragswert.jsx - PRO VERSION con EEG Auto-Update 2026/2027
import React, { useState, useEffect } from "react";
import axios from "axios";

function Ertragswert({ onResult, betriebsmodell }) {
  const [kwp, setKwp] = useState("10");
  const [spezErtrag, setSpezErtrag] = useState("1000");
  const [verguetung, setVerguetung] = useState("8.50");
  const [restlaufzeit, setRestlaufzeit] = useState("15");
  const [jahresertrag, setJahresertrag] = useState(null);
  const [ertragswert, setErtragswert] = useState(null);
  const [autoVerguetung, setAutoVerguetung] = useState(null);
  const [eegPeriod, setEegPeriod] = useState("Feb-Jul 2026");

  // 👉 PRO: Auto-detecta periodo EEG + tarifas
  useEffect(() => {
    const size = parseFloat(kwp) || 10;
    const now = new Date('2026-03-16'); // Hoy
    
    // AUTO-SELECCIONA periodo EEG
    let period, periodName;
    if (now < new Date('2026-08-01')) {
      period = 'h1'; // Feb-Jul 2026
      periodName = 'Feb-Jul 2026';
    } else if (now < new Date('2027-02-01')) {
      period = 'h2'; // Aug 2026-Ene 2027  
      periodName = 'Aug 2026-Jan 2027';
    } else {
      period = 'h3'; // Feb 2027+
      periodName = '2027+';
    }
    
    setEegPeriod(periodName);

    // 👉 EEG 2026/2027 TARIFAS COMPLETAS
    const tarifs = {
      h1: { // Feb-Jul 2026 (ACTUAL)
        volleinspeisung: size <= 10 ? 12.35 : 10.35,
        eigenverbrauch: size <= 10 ? 7.78 : 6.74,
        eigenverbrauch_batterie: size <= 10 ? 8.50 : 7.00,
        mieterstrom: 19.50,
        direktvermarktung: 5.00
      },
      h2: { // Aug 2026-Ene 2027 (-1%)
        volleinspeisung: size <= 10 ? 12.23 : 10.25,
        eigenverbrauch: size <= 10 ? 7.71 : 6.67,
        eigenverbrauch_batterie: size <= 10 ? 8.42 : 6.93,
        mieterstrom: 19.31,
        direktvermarktung: 4.95
      },
      h3: { // Feb 2027+ (-1% adicional)
        volleinspeisung: size <= 10 ? 12.11 : 10.15,
        eigenverbrauch: size <= 10 ? 7.63 : 6.60,
        eigenverbrauch_batterie: size <= 10 ? 8.34 : 6.86,
        mieterstrom: 19.12,
        direktvermarktung: 4.90
      }
    };

    const autoValue = tarifs[period][betriebsmodell] || 8.50;
    setAutoVerguetung(autoValue);
    setVerguetung(autoValue.toFixed(2));
  }, [betriebsmodell, kwp]);

  const calculateErtragswert = async () => {
    const k = parseFloat(kwp);
    const production = pvgisProduction || (k * se);
    const v = parseFloat(verguetung);
    const rl = parseFloat(restlaufzeit);

    if (isNaN(k) || isNaN(se) || isNaN(v) || isNaN(rl)) {
      alert("Bitte gültige Zahlen eingeben!");
      return;
    }

    try {
      console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/ertragswert`,
        {
          anlagengroesse: k,
          spezifischer_ertrag: se,
          einspeiseverguetung: v,
          restlaufzeit: rl,
          betriebsmodell: betriebsmodell
        }
      );

      const jahres = response.data.jahresertrag.toFixed(2);
      const ertrags = response.data.ertragswert.toFixed(2);

      setJahresertrag(jahres);
      setErtragswert(ertrags);

      if (onResult) {
        onResult({
          jahresertrag: jahres,
          ertragswert: ertrags,
          betriebsmodell: response.data.betriebsmodell,
          eeg_period: eegPeriod
        });
      }
    } catch (error) {
      console.error("Error Ertragswert:", error);
      alert("Fehler beim Berechnen!");
    }
  };

  return (
    <div className="card mb-4 p-3">
      <h4>Ertragswert berechnen <span className="badge bg-info">PRO</span></h4>

      {/* 👉 PRO HEADER */}
      <div className="alert alert-success mb-3">
        <div className="row align-items-center">
          <div className="col-md-4">
            <strong>📊 Betriebsmodell:</strong><br/>
            <span className="badge bg-success fs-6 mt-1">{betriebsmodell.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div className="col-md-4">
            <strong>⚡ AUTO-Vergütung:</strong><br/>
            <span className="badge bg-warning fs-6 mt-1">{autoVerguetung?.toFixed(2)} ct€/kWh</span>
          </div>
          <div className="col-md-4">
            <strong>📅 EEG-Periode:</strong><br/>
            <span className="badge bg-primary fs-6 mt-1">{eegPeriod}</span>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-2">
          <label>Anlagengröße (kWp):</label>
          <input
            type="number"
            className="form-control"
            value={kwp}
            onChange={(e) => setKwp(e.target.value)}
            placeholder="10"
          />
        </div>
        <div className="col-md-6 mb-2">
          <label>Spezifischer Ertrag (kWh/kWp):</label>
          <input
            type="number"
            className="form-control"
            value={spezErtrag}
            onChange={(e) => setSpezErtrag(e.target.value)}
            placeholder="1000"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-2">
          <label>Einspeisevergütung <span className="badge bg-success">AUTO</span>:</label>
          <input
            type="number"
            className="form-control"
            value={verguetung}
            style={{ 
              backgroundColor: '#d4edda', 
              color: '#155724',
              fontWeight: 'bold'
            }}
            readOnly
          />
          <small className="text-success">
            Automatisch EEG {eegPeriod} ✓ Ändert sich bei Anlagengröße/Modell
          </small>
        </div>
        <div className="col-md-6 mb-2">
          <label>Restlaufzeit (Jahre):</label>
          <input
            type="number"
            className="form-control"
            value={restlaufzeit}
            onChange={(e) => setRestlaufzeit(e.target.value)}
            placeholder="15"
          />
        </div>
      </div>

      <button className="btn btn-primary btn-lg w-100 mt-3" onClick={calculateErtragswert}>
        💰 Ertragswert berechnen
      </button>

      {jahresertrag !== null && ertragswert !== null && (
        <div className="mt-4 p-3 border rounded bg-light">
          <div className="row text-center">
            <div className="col-md-6">
              <h5 className="text-success">📈 Jährlicher Ertrag</h5>
              <h3>{jahresertrag} €</h3>
            </div>
            <div className="col-md-6">
              <h5 className="text-primary">💎 Ertragswert</h5>
              <h3>{ertragswert} €</h3>
            </div>
          </div>

<div className="alert alert-success mt-3">
  <strong>✅ Berechnet mit:</strong> {betriebsmodell.replace('_', ' ').toUpperCase()} 
  • EEG {eegPeriod}
  
  {betriebsmodell === 'eigenverbrauch' && (
    <div className="mt-3">
      <h6 className="mb-2">📊 EEG-Tarif basierend auf Anlagengröße:</h6>
      <div className="table-responsive">
        <table className="table table-sm table-striped">
          <thead>
            <tr>
              <th>Anlagengröße</th>
              <th>Typischer Eigenverbrauch</th>
              <th>EEG-Vergütungssatz</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>≤ 10 kWp</strong></td>
              <td>30-40%</td>
              <td><strong>7,78 ct/kWh</strong></td>
            </tr>
            <tr>
              <td><strong>10-40 kWp</strong></td>
              <td>25-35%</td>
              <td><strong>6,74 ct/kWh</strong></td>
            </tr>
            <tr>
              <td><strong>> 40 kWp</strong></td>
              <td>20-30%</td>
              <td><strong>5,50 ct/kWh</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )}

</div>

{betriebsmodell === 'eigenverbrauch_batterie' && (
  <div className="mt-3">
    <h6 className="mb-2">🔋 EEG-Tarif mit Batterie:</h6>
    <div className="table-responsive">
      <table className="table table-sm table-striped">
        <thead>
          <tr>
            <th>Anlagengröße</th>
            <th>Typischer Eigenverbrauch</th>
            <th>EEG-Vergütungssatz</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>≤ 10 kWp</strong></td>
            <td>50-70%</td>
            <td><strong>8,50 ct/kWh</strong></td>
          </tr>
          <tr>
            <td><strong>10-40 kWp</strong></td>
            <td>45-65%</td>
            <td><strong>7,00 ct/kWh</strong></td>
          </tr>
          <tr>
            <td><strong>> 40 kWp</strong></td>
            <td>40-60%</td>
            <td><strong>6,00 ct/kWh</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
)}

{betriebsmodell === 'mieterstrom' && (
  <div className="mt-3">
    <h6 className="mb-2">🏠 Mieterstrom Förderung:</h6>
    <div className="table-responsive">
      <table className="table table-sm table-striped">
        <thead>
          <tr>
            <th>Anlagengröße</th>
            <th>Mieterstromzuschlag</th>
            <th>Einspeisevergütung</th>
            <th><strong>TOTAL</strong></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>≤ 10 kWp</strong></td>
            <td>2,59 ct/kWh</td>
            <td>7,78 ct/kWh</td>
            <td><strong>19,50 ct/kWh</strong></td>
          </tr>
          <tr>
            <td><strong>10-40 kWp</strong></td>
            <td>2,41 ct/kWh</td>
            <td>6,74 ct/kWh</td>
            <td><strong>19,50 ct/kWh</strong></td>
          </tr>
          <tr>
            <td><strong>> 40 kWp</strong></td>
            <td>1,62 ct/kWh</td>
            <td>5,50 ct/kWh</td>
            <td><strong>19,50 ct/kWh</strong></td>
          </tr>
        </tbody>
      </table>
      <small className="text-info">
        <strong>✅ Vorteil:</strong> Vermieter bekommt 19,50ct • Mieter zahlt nur 11ct
      </small>
    </div>
  </div>
)}

{betriebsmodell === 'direktvermarktung' && (
  <div className="mt-3">
    <h6 className="mb-2">📈 Direktvermarktung Marktübersicht:</h6>
    <div className="table-responsive">
      <table className="table table-sm table-striped">
        <thead>
          <tr>
            <th>Marktpreis (EPEX)</th>
            <th>Marktprämie</th>
            <th><strong>TOTAL</strong></th>
            <th>vs EEG</th>
          </tr>
        </thead>
        <tbody>
          <tr className="table-success">
            <td>3-5 ct/kWh</td>
            <td>1-2 ct/kWh</td>
            <td><strong>5,00 ct/kWh</strong></td>
            <td>=</td>
          </tr>
          <tr className="table-warning">
            <td>6-8 ct/kWh</td>
            <td>1-2 ct/kWh</td>
            <td><strong>8,00 ct/kWh</strong></td>
            <td>✅ +</td>
          </tr>
          <tr className="table-danger">
            <td>1-3 ct/kWh</td>
            <td>1-2 ct/kWh</td>
            <td><strong>3,00 ct/kWh</strong></td>
            <td>❌ -</td>
          </tr>
        </tbody>
      </table>
      <small className="text-muted">
        <strong>💡 Tipp:</strong> Für Anlagen > 100 kWp **Pflicht** | Preise stundenweise variabel
      </small>
    </div>
  </div>
)}

          <div className="alert alert-warning small">
            <strong>⚠️ Abzüglich:</strong> Wartung, Versicherung, Reinigung (~1-2ct/kWh)
          </div>
        </div>
      )}
    </div>
  );
}

export default Ertragswert;


