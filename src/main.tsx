import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

// Disable right-click in production
if (import.meta.env.PROD || true ) { // Force for now as requested
  window.addEventListener('contextmenu', (e) => e.preventDefault());
}

const root = document.getElementById("root") as HTMLElement;
// Ensure no background leakage
root.style.background = 'transparent';

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
