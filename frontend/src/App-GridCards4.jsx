// App.jsx - PV Wertgutachten v6 FINAL PRO (GRID UI VERSION)
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

  const [activeSection, setActiveSection] = useState(null);

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
  // UPDATE FUNCTIONS (UNCHANGED)
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
      buchwert: { ...prev.buchwert, ...data },
      restwert: {
        ...prev.restwert,
        restlaufzeit: Number(data.restlaufzeit) || prev.restwert.restlaufzeit
      },
      ertragswert: {
        ...prev.ertragswert,
        restlaufzeit: Number(data.restlaufzeit) || prev.ertragswert.restlaufzeit
      }
    }));
  };

  const updateErtragswert = (data) => {
    setFormData((prev) => ({
      ...prev,
      ertragswert: {
        ...prev.ertragswert,
        ...data
      }
    }));
  };

  const updateRestwert = (data) => {
    setFormData((prev) => ({
      ...prev,
      restwert: {
        ...prev.restwert,
        ...data
      }
    }));
  };

  const updateFinanzielleBewertung = (data) => {
    setFormData((prev) => ({
      ...prev,
      finanzielleBewertung: {
        ...prev.finanzielleBewertung,
        ...data
      }
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  // -----------------------------
  // SECTION CONFIG (ONLY CHANGE HERE)
  // -----------------------------
  const sections = [
    {
      id: "anlagen",
      title: "1. Anlagendaten",
      component: (
        <AnlagenDaten
          onDataChange={updateAnlagenData}
          betriebsmodell={formData.betriebsmodell}
          anlagenData={formData.anlagen}
        />
      )
    },
    {
      id: "betriebsmodell",
      title: "2. Betriebsmodell",
      component: (
        <BetriebsmodellSelector
          value={formData.betriebsmodell}
          onChange={updateBetriebsmodell}
        />
      )
    },
    {
      id: "buchwert",
      title: "3. Buchwert",
      component: (
        <Buchwert
          BASE_URL={BASE_URL}
          anlagenData={formData.anlagen}
          onResult={updateBuchwert}
        />
      )
    },
    {
      id: "ertragswert",
      title: "4. Ertragswert",
      component: (
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
          onResult={updateErtragswert}
        />
      )
    },
    {
      id: "pvgis",
      title: "5. PVGIS Analyse",
      component: (
        <PVGISForm
          BASE_URL={BASE_URL}
          pvgisData={formData.pvgis}
          onChange={updatePVGIS}
        />
      )
    },

    // 🔥 ONLY MODIFIED SECTION
    {
      id: "finanzen",
      title: "6. Finanzielle Bewertung",
      component: (
        <>
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
        </>
      )
    },

    {
      id: "restwert",
      title: "7. Restwert",
      component: (
        <Restwert
          BASE_URL={BASE_URL}
          buchwertData={formData.buchwert}
          ertragswert={formData.ertragswert?.ertragswertKumuliert || ""}
          restlaufzeit={formData.ertragswert?.restlaufzeit}
          anlagenData={formData.anlagen}
          onResult={updateRestwert}
        />
      )
    },
    {
      id: "report",
      title: "8. PV-Bewertungsbericht",
      component: (
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
      )
    }
  ];

  // -----------------------------
  // RENDER (UNCHANGED)
  // -----------------------------
  return (
    <FinancialProvider>

      <div className="container mt-3 no-print">
        <button className="btn btn-primary" onClick={handlePrint}>
          📄 Ansicht als PDF speichern
        </button>
      </div>

      <div className="container mt-4">

        <h2 className="mb-4 text-primary">
          PV-Wirtschaftlichkeitsanalyse System
          <span className="badge bg-info ms-2">PRO</span>
        </h2>

        <p className="mb-4 text-muted fst-italic">
          Schnelle und automatisierte Bewertung von Photovoltaik-Investitionen
        </p>

        {!activeSection && (
          <div className="row g-4">
            {sections.map((s) => (
              <div className="col-md-6 col-lg-3" key={s.id}>
                <div
                  className="card shadow-sm h-100 text-center p-4 rounded-4 section-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => setActiveSection(s.id)}
                >
                  <h6 className="m-0">{s.title}</h6>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection && (
          <div className="mt-3">
            <button
              className="btn btn-secondary mb-3"
              onClick={() => setActiveSection(null)}
            >
              ← Zur Übersicht
            </button>

            {sections.find((s) => s.id === activeSection)?.component}
          </div>
        )}

      </div>
    </FinancialProvider>
  );
}

export default App;