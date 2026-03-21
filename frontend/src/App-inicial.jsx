// App.jsx - PV Wertgutachten v2 Ready

import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import Buchwert from "./components/Buchwert";
import Ertragswert from "./components/Ertragswert";
import Restwert from "./components/Restwert";
import ReportForm from "./components/ReportForm";
import BetriebsmodellSelector from "./components/BetriebsmodellSelector";

// Backend URL desde variables de entorno
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

function App() {

  // -------------------------
  // Betriebsmodell seleccionado
  // -------------------------
  const [betriebsmodell, setBetriebsmodell] = useState("volleinspeisung");

  // -------------------------
  // Resultados de cálculos
  // -------------------------
  const [buchwertData, setBuchwertData] = useState({
    abschreibung: "",
    buchwert: ""
  });

  const [ertragswertData, setErtragswertData] = useState({
    jahresertrag: "",
    ertragswert: ""
  });

  const [restwertData, setRestwertData] = useState({
    zukuenftige_gewinne: "",
    restwert: ""
  });

  return (
    <div className="container mt-4">

      <h2 className="mb-4">
        Wertgutachten einer Photovoltaikanlage
      </h2>

      {/* Selección del modelo de operación */}
      <BetriebsmodellSelector onModelChange={setBetriebsmodell} />

      {/* Componentes de cálculo */}
      <Buchwert
        BASE_URL={BASE_URL}
        onResult={(data) => setBuchwertData(data)}
      />

      <Ertragswert
        BASE_URL={BASE_URL}
        betriebsmodell={betriebsmodell}
        onResult={(data) => setErtragswertData(data)}
      />

      <Restwert
        BASE_URL={BASE_URL}
        onResult={(data) => setRestwertData(data)}
      />

      {/* Generación de reporte */}
      <ReportForm
        BASE_URL={BASE_URL}
        buchwertData={buchwertData}
        ertragswertData={ertragswertData}
        restwertData={restwertData}
      />

    </div>
  );
}

export default App;