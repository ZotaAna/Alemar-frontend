import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [eroare, setEroare] = useState("");
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  const userId = localStorage.getItem("pendingUserId");
  const voucher = localStorage.getItem("pendingVoucher");

  const handleVerify = async () => {
    if (code.length !== 6) {
      setEroare("Codul trebuie să aibă 6 cifre.");
      return;
    }

    setLoading(true);
    setEroare("");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEroare(data.message || "Cod incorect.");
        setLoading(false);
        return;
      }

      localStorage.removeItem("pendingUserId");
      localStorage.removeItem("pendingVoucher");

      if (voucher) {
        setToast({ mesaj: `Cont verificat! 🎉 Codul tău de reducere 10%: ${voucher}`, tip: "succes" });
      } else {
        setToast({ mesaj: "Cont verificat cu succes! 🎉", tip: "succes" });
      }

      setTimeout(() => navigate("/login"), 4000);
    } catch (err) {
      console.error(err);
      setEroare("Eroare de conexiune.");
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      {toast && <Toast mesaj={toast.mesaj} tip={toast.tip} onClose={closeToast} />}
      <div className="signin-form">
        <h2>Verifică-ți emailul</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
          Am trimis un cod de 6 cifre pe adresa ta de email. Introdu-l mai jos pentru a-ți activa contul.
        </p>

        <input
          type="text"
          placeholder="Cod de verificare"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px" }}
        />

        {eroare && (
          <p style={{ color: "red", textAlign: "center", marginTop: "8px" }}>{eroare}</p>
        )}

        <button onClick={handleVerify} disabled={loading}>
          {loading ? "Se verifică..." : "Verifică codul"}
        </button>
      </div>
    </div>
  );
}