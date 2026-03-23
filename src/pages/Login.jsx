import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import AuthNavbar from "../components/AuthNavbar";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // 🔹 LOGIN CLASIC (email + parola)
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
        alert(data.message || "Date de conectare incorecte!");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      alert("Te-ai conectat cu succes!");
      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("Nu pot conecta la server (backend).");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 LOGIN CU GOOGLE (doar redirect)
  const handleGoogleLogin = () => {
    window.location.href = "${process.env.REACT_APP_API_URL}/api/auth/google";
  };

  return (
    <>
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

          {/* LOGIN NORMAL */}
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Se conectează..." : "Conectare"}
          </button>

          {/* SEPARATOR */}
          <div style={{ textAlign: "center", margin: "15px 0" }}>
            sau
          </div>

          {/* LOGIN GOOGLE */}
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
