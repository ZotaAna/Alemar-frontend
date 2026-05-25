import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import AuthNavbar from "../components/AuthNavbar";
import Toast from "../components/Toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();
  const closeToast = useCallback(() => setToast(null), []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ mesaj: data.message || "Date de conectare incorecte!", tip: "eroare" });
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setToast({ mesaj: "Te-ai conectat cu succes!", tip: "succes" });
      setTimeout(() => navigate("/home"), 1500);
    } catch (err) {
      console.error(err);
      setToast({ mesaj: "Nu pot conecta la server (backend).", tip: "eroare" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  return (
    <>
      {toast && <Toast mesaj={toast.mesaj} tip={toast.tip} onClose={closeToast} />}
      <AuthNavbar />

      <div className="login-container" style={{ marginTop: "100px" }}>
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Conectare</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Parolă"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Se conectează..." : "Conectare"}
          </button>

          <p style={{ textAlign: "right", margin: "-8px 0 8px 0" }}>
            <span
              style={{ color: "#a16943", cursor: "pointer", fontSize: "14px" }}
              onClick={() => navigate("/reset-parola")}
            >
              Ai uitat parola?
            </span>
          </p>

          <div style={{ textAlign: "center", margin: "15px 0" }}>
            sau
          </div>

          <button
            type="button"
            className="google-login-btn"
            onClick={handleGoogleLogin}
          >
            Continuă cu Google
          </button>

          <p className="no-account">
            Nu ai cont?{" "}
            <span className="register-link" onClick={() => navigate("/signin")}>
              Înregistrează-te
            </span>
          </p>
        </form>
      </div>
    </>
  );
}

export default Login;