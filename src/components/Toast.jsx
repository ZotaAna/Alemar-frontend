import React, { useEffect } from "react";

export default function Toast({ mesaj, tip = "succes", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const stiluri = {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 22px",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(161, 105, 67, 0.25)",
    background: tip === "succes" ? "#fff" : "#fff0f0",
    borderLeft: `5px solid ${tip === "succes" ? "#a16943" : "#e53935"}`,
    minWidth: "260px",
    maxWidth: "360px",
    animation: "slideIn 0.3s ease",
  };

  const iconita = tip === "succes" ? "✅" : "❌";

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .toast-mesaj {
          font-family: 'Georgia', serif;
          font-size: 14px;
          color: #3a2a1a;
          flex: 1;
        }
        .toast-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #a16943;
          font-size: 18px;
          line-height: 1;
          padding: 0;
        }
        .toast-close:hover {
          color: #7a4f30;
        }
      `}</style>
      <div style={stiluri}>
        <span style={{ fontSize: "20px" }}>{iconita}</span>
        <span className="toast-mesaj">{mesaj}</span>
        <button className="toast-close" onClick={onClose}>×</button>
      </div>
    </>
  );
}