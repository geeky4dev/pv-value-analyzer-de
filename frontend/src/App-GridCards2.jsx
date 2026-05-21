// App.jsx - PV Wertgutachten v6 FINAL PRO (FIXED DATA MODEL + GRID UI)
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min';
import "leaflet/dist/leaflet.css";

import AnlagenDaten from "./components/AnlagenDaten.jsx";
import Buchwert from "./components/Buchwert.jsx";
import Ertragswert from "./components/Ertragswert.jsx";
import Restwert from "./components/Restwert.jsx";
import ReportForm from "./components/ReportForm.jsx";
import BetriebsmodellSelector from "./components/BetriebsmodellSelector.jsx";
import PVGISForm from "./components/PVGISForm.jsx";
import FinanzielleBewertung from "./components/FinanzielleBewertung.jsx";
import Dashboard from "./components/Dashboard.jsx";

import { FinancialProvider } from "./components/FinancialContext.jsx";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5001";

function App() {
  const [formData, setFormData] = useState({
    anlagen: {
      adresse: "", plz: "", ort: "", bundesland: "",
      name: "", email: "", telefon: "",
      leistung: "", inbetriebnahme: "",
      modultyp: "", modulhersteller: "", modulmodell: "",
      wechselrichtertyp: "", wechselrichterhersteller: "", wechselrichtermodell: "",
      wechselrichterjahr: "", wechselrichteraustausch: false,
      installationsart: "", dachneigung: "", azimut: "",
      pr: "", degradation: "", latitude: "", longitude: "",
      zustand: "", letzteWartung: "", wartungsvertrag: false, bekannteProbleme: ""
    },

    betriebsmodell: "volleinspeisung",

    pvgis: {
      latitude: "",
      longitude: "",
      anlagengroesse: "",
      production: null,
      spezifischerErtrag: null,
      pr: null
    },

    buchwert: {
      abschreibung: "",
      buchwert: ""
    },

    ertragswert: {
      anlagengroesse: "",
      spezifischerertrag: "",
      performance_ratio: "",
      degradation: "",
      strompreis: "", 
      opex: "",
      jahresertrag: "",
      ertragswert: "",
      ertragswertKumuliert: ""
    },

    restwert: {
      zukuenftige_gewinne: 0,
      restwert: 0,
      kostenabschlag: 10,
      verkaufsabschlag: 50,
      wartung: false,
      zustand: "gut",
      pr: 80,
      restlaufzeit: 15,
      marktfaktor: 100
    },

    finanzielleBewertung: {
      npv: "",
      discount_rate: "",
      horizon: "",
      opex: "",
      irr: "",
      interpretation: "",
      cashflows: []
    }
  });

  // -----------------------------
  // UPDATE FUNCTIONS
  // -----------------------------
  const updateAnlagenData = (data) => {
    setFormData((prev) => ({
      ...prev,
      anlagen: { ...prev.anlagen, ...data },
      pvgis: {
        ...prev.pvgis,
        anlagengroesse: data.leistung || prev.pvgis.anlagengroesse
      }
    }));
  };

  const updateBetriebsmodell = (model) => {
    setFormData((prev) => ({
      ...prev,
      betriebsmodell: model || "volleinspeisung"
    }));
  };

  const updatePVGIS = (data) => {
    setFormData((prev) => {
      const newSpezErtrag = data.spezifischer_ertrag || data.spezifischerErtrag || prev.ertragswert.spezifischerertrag;
      const newProduction = data.production || data.annual_production || prev.ertragswert.jahresertrag;
      const currentPR = data.pr ?? prev.ertragswert.performance_ratio ?? 80;

      return {
        ...prev,
        pvgis: { 
          ...prev.pvgis, 
          ...data,
          spezifischerErtrag: newSpezErtrag,
          production: newProduction
        },
        anlagen: {
          ...prev.anlagen,
          latitude: data.latitude || prev.anlagen.latitude,
          longitude: data.longitude || prev.anlagen.longitude
        },
        ertragswert: {
          ...prev.ertragswert,
          anlagengroesse: data.anlagengroesse || prev.ertragswert.anlagengroesse,
          spezifischerertrag: newSpezErtrag,
          performance_ratio: currentPR,
          production: newProduction,
          jahresertrag: newProduction
        }
      };
    });
  };

  const updateBuchwert = (data) => {
    setFormData((prev) => ({
      ...prev,
      buchwert: {
        ...prev.buchwert,
        ...data
      },
      restwert: {
        ...prev.restwert,
        restlaufzeit:
          Number(data.restlaufzeit) ||
          prev.restwert.restlaufzeit
      },
      ertragswert: {
        ...prev.ertragswert,
        restlaufzeit:
          Number(data.restlaufzeit) ||
          prev.ertragswert.restlaufzeit
      }
    }));
  };

  const updateErtragswert = (data) => {
    setFormData((prev) => ({
      ...prev,
      ertragswert: {
        ...prev.ertragswert,
        ...data,
        anlagengroesse: data.anlagengroesse || prev.ertragswert.anlagengroesse,
        spezifischerertrag: data.spezifischer_ertrag ?? data.spezifischerertrag ?? prev.ertragswert.spezifischerertrag,
        performance_ratio: data.performance_ratio || prev.ertragswert.performance_ratio,
        degradation: data.degradation_anual ?? data.degradation ?? prev.ertragswert.degradation,
        opex: data.opex || prev.ertragswert.opex,
        strompreis:
          data.strompreis !== undefined
            ? parseFloat(data.strompreis)
            : prev.ertragswert.strompreis,
      }
    }));
  };

  const updateRestwert = (data) => {
    setFormData((prev) => ({
      ...prev,
      restwert: {
        ...prev.restwert,
        zukuenftige_gewinne: Number(data.zukuenftige_gewinne) || 0,
        restwert: Number(data.restwert) || 0,
        kostenabschlag: Number(data.kostenabschlag) ?? prev.restwert.kostenabschlag,
        verkaufsabschlag: Number(data.verkaufsabschlag) ?? prev.restwert.verkaufsabschlag,
        wartung: data.wartung ?? prev.restwert.wartung,
        zustand: data.zustand ?? prev.restwert.zustand,
        pr: Number(data.pr) || prev.restwert.pr,
        restlaufzeit: Number(data.restlaufzeit) || prev.restwert.restlaufzeit,
        marktfaktor: Number(data.marktfaktor) || prev.restwert.marktfaktor
      }
    }));
  };

  const updateFinanzielleBewertung = (data) => {
    setFormData((prev) => ({
      ...prev,
      finanzielleBewertung: { ...prev.finanzielleBewertung, ...data }
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const [ertragsResult, setErtragsResult] = useState(null);

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <FinancialProvider>
      <div className="container mt-3 no-print">
        <button className="btn btn-primary" onClick={handlePrint}>
          📄 Ansicht als PDF speichern
        </button>
      </div>

      <div id="pv-report" className="container mt-4">

        <h2 className="mb-4 text-primary">
          PV-Wirtschaftlichkeitsanalyse System
          <span className="badge bg-info ms-2">PRO</span>
        </h2>

        <p className="mb-4 text-muted fst-italic">
          Schnelle und automatisierte Bewertung von Photovoltaik-Investitionen mit professionellem PDF-Bericht
        </p>

        <div className="row g-3">

          {/* 1 Anlagendaten */}
          <div className="col-lg-6">
            <div className="card rounded-4 shadow-sm bg-white border-light h-100">
              <div className="card-body">
                <h5 className="card-title text-primary">1. Anlagendaten</h5>
                <AnlagenDaten
                  onDataChange={updateAnlagenData}
                  betriebsmodell={formData.betriebsmodell}
                  anlagenData={formData.anlagen}
                />
              </div>
            </div>
          </div>

          {/* 2 Betriebsmodell */}
          <div className="col-lg-6">
            <div className="card rounded-4 shadow-sm bg-white border-light h-100">
              <div className="card-body">
                <h5 className="card-title text-primary">2. Betriebsmodell der PV-Anlage</h5>
                <BetriebsmodellSelector
                  value={formData.betriebsmodell}
                  onChange={updateBetriebsmodell}
                />
              </div>
            </div>
          </div>

          {/* 3 Buchwert */}
          <div className="col-lg-6">
            <div className="card rounded-4 shadow-sm bg-white border-light h-100">
              <div className="card-body">
                <h5 className="card-title text-primary">3. Buchwert berechnen</h5>
                <Buchwert
                  BASE_URL={BASE_URL}
                  anlagenData={formData.anlagen}
                  onResult={updateBuchwert}
                />
              </div>
            </div>
          </div>

          {/* 4 Ertragswert */}
          <div className="col-lg-6">
            <div className="card rounded-4 shadow-sm bg-white border-light h-100">
              <div className="card-body">
                <h5 className="card-title text-primary">4. Ertragswert berechnen</h5>
                <Ertragswert
                  BASE_URL={BASE_URL}
                  betriebsmodell={formData.betriebsmodell}
                  pvgisProduction={formData.pvgis}
                  anlagengroesse={
                    formData.pvgis?.anlagengroesse ||
                    formData.anlagen?.leistung ||
                    ""
                  }
                  restlaufzeit={formData.ertragswert.restlaufzeit}
                  ertragswertData={formData.ertragswert}
                  onResult={(data) => {
                    updateErtragswert(data);
                    setErtragsResult(data);
                  }}
                />
              </div>
            </div>
          </div>

          {/* 5 PVGIS */}
          <div className="col-lg-6">
            <div className="card rounded-4 shadow-sm bg-white border-light h-100">
              <div className="card-body">
                <h5 className="card-title text-primary">5. PVGIS-Standortanalyse</h5>
                <PVGISForm
                  BASE_URL={BASE_URL}
                  pvgisData={formData.pvgis}
                  onChange={updatePVGIS}
                />
              </div>
            </div>
          </div>

          {/* 6 Finanz + Dashboard */}
          <div className="col-lg-12">
            <div className="card rounded-4 shadow-sm bg-white border-light">
              <div className="card-body">
                <h5 className="card-title text-primary">
                  6. Finanzielle Bewertung & Übersicht
                </h5>

                <FinanzielleBewertung
                  ertragswertData={formData.ertragswert}
                  buchwertData={formData.buchwert}
                  onResult={updateFinanzielleBewertung}
                />

                {formData.finanzielleBewertung?.npv && (
                  <div className="mt-4">
                    <Dashboard data={formData.finanzielleBewertung} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 7 Restwert */}
          <div className="col-lg-6">
            <div className="card rounded-4 shadow-sm bg-white border-light h-100">
              <div className="card-body">
                <h5 className="card-title text-primary">7. Restwert berechnen</h5>
                <Restwert
                  BASE_URL={BASE_URL}
                  buchwertData={formData.buchwert}
                  ertragswert={ertragsResult?.ertragswertKumuliert}
                  performanceRatio={ertragsResult?.performance_ratio}
                  restlaufzeit={formData.ertragswert?.restlaufzeit}
                  anlagenData={formData.anlagen}
                  onResult={updateRestwert}
                />
              </div>
            </div>
          </div>

          {/* 8 Report */}
          <div className="col-lg-6">
            <div className="card rounded-4 shadow-sm bg-white border-light h-100">
              <div className="card-body">
                <h5 className="card-title text-primary">8. PV-Bewertungsbericht</h5>
                <ReportForm
                  BASE_URL={BASE_URL}
                  buchwertData={formData.buchwert}
                  ertragswertData={{
                    ...formData.ertragswert,
                    betriebsmodell: formData.betriebsmodell,
                    payback: formData.finanzielleBewertung?.payback
                  }}
                  restwertData={formData.restwert}
                  anlagenData={formData.anlagen}
                  pvgisData={formData.pvgis}
                  finanzData={formData.finanzielleBewertung}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </FinancialProvider>
  );
}

export default App;