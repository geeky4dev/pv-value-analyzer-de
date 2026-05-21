import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap para toda la app

// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

// Bootstrap JS
import "bootstrap/dist/js/bootstrap.bundle.min";

// Bootstrap Icons
import "bootstrap-icons/font/bootstrap-icons.css";

// Crear raíz y renderizar App
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

