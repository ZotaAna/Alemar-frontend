import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function ResetParola() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  const [etapa, setEtapa] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [parolaNoua, setParolaNoua] = useState("");
  const [parolaConfirm, setParolaConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const trimiteCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setToast({ mesaj: data.message, tip: "succes" });
      setEtapa(2);
    } catch {
      setToast({ mesaj: "Eroare de conexiune.", tip: "eroare" });
    }
    setLoading(false);
  };

  const reseteazaParola = async (e) => {
    e.preventDefault();
    if (parolaNoua !== parolaConfirm) {
      setToast({ mesaj: "Parolele nu coincid!", tip: "eroare" });
      return;
    }
    if (parolaNoua.length < 6) {
      setToast({ mesaj: "Parola trebuie să aibă minim 6 caractere.", tip: "eroare" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, parola_noua: parolaNoua }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ mesaj: data.message, tip: "eroare" });
      } else {
        setToast({ mesaj: "Parola a fost schimbată cu succes! 🎉", tip: "succes" });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch {
      setToast({ mesaj: "Eroare de conexiune.", tip: "eroare" });
    }
    setLoading(false);
  };

  return (
    <div className="signin-container">
      {toast && <Toast mesaj={toast.mesaj} tip={toast.tip} onClose={closeToast} />}
      <div className="signin-form">

        {etapa === 1 && (
          <>
            <h2>Resetare parolă</h2>
            <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
              Introdu adresa de email și îți trimitem un cod de resetare.
            </p>
            <input
              type="email"
              placeholder="Adresa de email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button onClick={trimiteCode} disabled={loading}>
              {loading ? "Se trimite..." : "Trimite codul"}
            </button>
            <p className="signin-login-link">
              <span style={{ cursor: "pointer", color: "#a16943" }} onClick={() => navigate("/login")}>
                ← Înapoi la login
              </span>
            </p>
          </>
        )}

        {etapa === 2 && (
          <>
            <h2>Introdu codul</h2>
            <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
              Am trimis un cod de 6 cifre pe <strong>{email}</strong>. Introdu-l mai jos împreună cu noua parolă.
            </p>
            <input
              type="text"
              placeholder="Cod de verificare"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px" }}
            />
            <input
              type="password"
              placeholder="Parolă nouă"
              value={parolaNoua}
              onChange={(e) => setParolaNoua(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirmă parola nouă"
              value={parolaConfirm}
              onChange={(e) => setParolaConfirm(e.target.value)}
            />
            <button onClick={reseteazaParola} disabled={loading}>
              {loading ? "Se procesează..." : "Schimbă parola"}
            </button>
            <p className="signin-login-link">
              <span style={{ cursor: "pointer", color: "#a16943" }} onClick={() => setEtapa(1)}>
                ← Înapoi
              </span>
            </p>
          </>
        )}

      </div>
    </div>
  );
}