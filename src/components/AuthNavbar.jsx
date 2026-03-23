import React from "react";
import "./authnavbar.css";

export default function AuthNavbar() {
  return (
    <nav className="auth-navbar">
      <div className="auth-logo-container">
        <img src="/logo.jpg" alt="Logo" className="auth-logo-img" />
        <h2 className="auth-title">Alemar Store</h2>
      </div>
    </nav>
  );
}
