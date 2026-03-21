import React, { useState } from "react";

function ReportForm({ buchwertData, ertragswertData, restwertData }) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState(null);

  return (
    <>
      {/* 🚀 Upcoming Feature Notice */}
      <div className="alert alert-info mt-4">
        🚀 <strong>Geplantes Feature:</strong><br />
        Automatisierte Generierung eines vollständigen PDF-Wertgutachtens.
      </div>

      <div className="card mb-4 p-3">
        <h4>PDF-Report erstellen (Demo-Version)</h4>

        <form>
          <div className="mb-2">
            <label>Name des Unternehmens / der Person:</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled
            />
          </div>

          <div className="mb-2">
            <label>Logo hochladen (JPG, PNG, JPEG):</label>
            <input
              type="file"
              className="form-control"
              accept=".jpg,.jpeg,.png"
              disabled
            />
          </div>

          <button
            type="button"
            className="btn btn-success mt-2"
            disabled
          >
            PDF-Download (Coming Soon)
          </button>
        </form>

        <p className="mt-3 text-muted">
          Diese Demo-Version konzentriert sich auf die Kernberechnungen
          (Buchwert, Ertragswert, Restwert).  
          Die PDF-Report-Funktion wird in der Vollversion verfügbar sein.
        </p>
      </div>

      {/* ✅ FOOTER SIN LÍNEA DE SEPARACIÓN */}
      <footer style={{ 
        marginTop: '40px', 
        padding: '20px 0', 
        textAlign: 'center',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <img 
          src="/logo.png"  // ← Prueba primero esta ruta
          // src="/frontend/logo.png"  // ← Usa esta si no funciona
          alt="Apps4Green" 
          style={{ 
            height: '30px', 
            width: 'auto' 
          }} 
        />
        <span style={{ 
          fontSize: '14px', 
          color: '#6c757d',
          fontWeight: '500'
        }}>
          © 2026 Apps4Green
        </span>
      </footer>
    </>
  );
}

export default ReportForm;


