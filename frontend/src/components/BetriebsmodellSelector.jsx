import React, { useState } from "react";

function BetriebsmodellSelector({ onModelChange }) {
  const [model, setModel] = useState("volleinspeisung");

  const handleChange = (e) => {
    const selectedModel = e.target.value;
    setModel(selectedModel);

    if (onModelChange) {
      onModelChange(selectedModel);
    }
  };

  return (
    <div className="card mb-4 p-3">
      <h4>Betriebsmodell der PV-Anlage</h4>

      <div className="mb-2">
        <label className="label-with-arrow">
        Bitte Betriebsmodell auswählen:<span style={{ 
      marginLeft: '5px', 
      color: '#007bff',  // Azul Bootstrap primario (exacto del anexo)
      fontSize: '20px',
      fontWeight: 'bold'
    }}>▼</span></label>

        <select
          className="form-control"
          value={model}
          onChange={handleChange}
        >
          <option value="volleinspeisung">
            Volleinspeisung (100 % Einspeisung ins Netz)
          </option>

          <option value="eigenverbrauch">
            Eigenverbrauch + Teileinspeisung
          </option>

          <option value="eigenverbrauch_batterie">
            Eigenverbrauch mit Batterie
          </option>

          <option value="mieterstrom">
            Mieterstrom-Modell (1-1000 kWp, 19,50 ct/kWh)
          </option>

          <option value="direktvermarktung">
            Direktvermarktung / Marktprämie (>100 kWp ==> pflicht)
          </option>
        </select>
      </div>

      <div className="alert alert-light mt-3">
        {model === "volleinspeisung" && (
          <p>
            Die gesamte erzeugte Energie wird ins Netz eingespeist und gemäß EEG vergütet.
          </p>
        )}

        {model === "eigenverbrauch" && (
          <p>
            Ein Teil des Solarstroms wird selbst verbraucht, der Rest ins Netz eingespeist.
          </p>
        )}

        {model === "eigenverbrauch_batterie" && (
          <p>
            Durch Batteriespeicher kann der Eigenverbrauchsanteil deutlich erhöht werden.
          </p>
        )}

        {model === "mieterstrom" && (
          <p>
            Der erzeugte Strom wird direkt an Mieter im Gebäude verkauft.
          </p>
        )}

        {model === "direktvermarktung" && (
          <p>
            Der Strom wird direkt am Strommarkt verkauft (typisch für größere Anlagen).
          </p>
        )}
      </div>
    </div>
  );
}

export default BetriebsmodellSelector;
