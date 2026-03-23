import React from "react";
import { useNavigate } from "react-router-dom";

export default function ComandaConfirmata() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
      <h1 style={{ fontSize: "2.5rem", color: "#a16943" }}>✅ Plată confirmată!</h1>
      <p style={{ fontSize: "1.1rem", color: "#555", margin: "1rem 0 2rem" }}>
        Comanda ta a fost plasată cu succes. Îți mulțumim!
      </p>
      <button
        onClick={() => { localStorage.removeItem("cos"); navigate("/"); }}
        style={{
          background: "#a16943", color: "white", border: "none",
          borderRadius: "8px", padding: "12px 32px",
          fontSize: "1rem", fontWeight: "600", cursor: "pointer"
        }}
      >
        Înapoi la magazin
      </button>
    </div>
  );
}