import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/cos.css";

export default function Cos() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cos, setCos] = useState([]);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const nume = user?.first_name || user?.firstName || null;
  const userId = user?.id || "guest";
  const cosKey = `cos_${userId}`;

  useEffect(() => {
    const cosExistent = JSON.parse(localStorage.getItem(cosKey)) || [];
    setCos(cosExistent);
  }, [cosKey]);

  const salveazaCos = (cosNou) => {
    setCos(cosNou);
    localStorage.setItem(cosKey, JSON.stringify(cosNou));
  };

  const crестеCantitate = (id) => {
    const cosNou = cos.map((p) =>
      p.id === id ? { ...p, cantitate: p.cantitate + 1 } : p
    );
    salveazaCos(cosNou);
  };

  const scadeCantitate = (id) => {
    const cosNou = cos
      .map((p) => p.id === id ? { ...p, cantitate: p.cantitate - 1 } : p)
      .filter((p) => p.cantitate > 0);
    salveazaCos(cosNou);
  };

  const stergeProdus = (id) => {
    const cosNou = cos.filter((p) => p.id !== id);
    salveazaCos(cosNou);
  };

  const total = cos.reduce(
    (sum, p) => sum + (p.price_cents / 100) * p.cantitate, 0
  );

  return (
    <div>
      <div className="promo-banner">
        <span className="promo-item">🎁 Creează-ți un cont și primești un cod de reducere la prima comandă!</span>
        <span className="promo-separator">|</span>
        <span className="promo-item">🚚 Transport gratuit la comenzile de peste 300 de lei!</span>
        <span className="promo-separator">|</span>
        <span className="promo-item">👥 Invită-ți prietenii să-și facă cont și primești un cod de reducere!</span>
      </div>

      <nav className="navbar">
        <div className="logo-container">
          <img src="/logo.jpg" alt="Logo" className="logo-img" />
          <h2>Alemar Store</h2>
        </div>
        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <a href="/">Acasă</a>
          <a href="/produse">Produse</a>
          <a href="/cos" className="nav-link-activ">Coșul meu</a>
          <a href="/cont">Contul meu</a>
          <a href="/login" className="nav-login-btn">Login</a>
        </div>
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      <div className="welcome-banner">
        {nume ? `Bine ai revenit, ${nume}! 👋` : "Bine ai venit! 👋"}
      </div>

      <main className="cos-container">
        <h1 className="cos-titlu">Coșul meu</h1>

        {cos.length === 0 ? (
          <div className="cos-gol">
            <p>Coșul tău este gol.</p>
            <a href="/produse" className="cos-btn-inapoi">Vezi produsele</a>
          </div>
        ) : (
          <>
            <div className="cos-lista">
              {cos.map((produs) => (
                <div className="cos-item" key={produs.id}>
                  <img src={produs.image_url} alt={produs.name} className="cos-img" />
                  <div className="cos-info">
                    <p className="cos-nume">{produs.name}</p>
                    <p className="cos-pret-unitar">
                      {(produs.price_cents / 100).toFixed(0)} {produs.currency} / buc
                    </p>
                  </div>
                  <div className="cos-cantitate">
                    <button onClick={() => scadeCantitate(produs.id)}>−</button>
                    <span>{produs.cantitate}</span>
                    <button onClick={() => crестеCantitate(produs.id)}>+</button>
                  </div>
                  <p className="cos-pret-total">
                    {((produs.price_cents / 100) * produs.cantitate).toFixed(0)} {produs.currency}
                  </p>
                  <button className="cos-sterge" onClick={() => stergeProdus(produs.id)}>✕</button>
                </div>
              ))}
            </div>

            <div className="cos-sumar">
              <p className="cos-total">Total: <span>{total.toFixed(0)} RON</span></p>
              <button className="cos-btn-comanda" onClick={() => navigate("/comanda")}>
                Plasează comanda
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}