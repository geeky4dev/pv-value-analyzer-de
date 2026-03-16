import React, { useState, useEffect } from "react";

function PVSystemForm({ betriebsmodell, onCalculate }) {
  const [formData, setFormData] = useState({
    anlagengroesse: 50,        // kWp
    spezifischer_ertrag: 1000, // kWh/kWp
    einspeiseverguetung: 8.5,  // ct/kWh
    restlaufzeit: 15,          // Jahre
    eigenverbrauch_anteil: 30, // % solo eigenverbrauch
    batterie_kwp: 0            // kWh solo batterie
  });

  // 👉 Campos DINÁMICOS por Betriebsmodell
  const getDynamicFields = () => {
    switch (betriebsmodell) {
      case "eigenverbrauch":
        return (
          <div className="mb-3">
            <label>Eigenverbrauch-Anteil (%):</label>
            <input 
              type="number" 
              className="form-control"
              value={formData.eigenverbrauch_anteil}
              onChange={(e) => setFormData({...formData, eigenverbrauch_anteil: e.target.value})}
            />
          </div>
        );
      case "eigenverbrauch_batterie":
        return (
          <div className="mb-3">
            <label>Batterie Kapazität (kWh):</label>
            <input 
              type="number" 
              className="form-control"
              value={formData.batterie_kwp}
              onChange={(e) => setFormData({...formData, batterie_kwp: e.target.value})}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate(formData);
  };

  return (
    <div className="card mb-4 p-3">
      <h4>PV-Anlage Daten</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Anlagengröße (kWp):</label>
          <input type="number" className="form-control" value={formData.anlagengroesse} 
                 onChange={(e) => setFormData({...formData, anlagengroesse: e.target.value})} />
        </div>
        
        {/* 👉 CAMPOS DINÁMICOS */}
        {getDynamicFields()}
        
        <button type="submit" className="btn btn-primary">Berechnen</button>
      </form>
    </div>
  );
}

export default PVSystemForm;
