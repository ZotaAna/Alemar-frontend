import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "../styles/produse.css";
import Toast from "../components/Toast";
import CategoryBar from "../components/CategoryBar";

export default function Produse() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [produse, setProduse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const params = new URLSearchParams(window.location.search);
const categorie = params.get("categorie");

const categorie = params.get("categorie");
console.log("categorie din URL:", categorie);
console.log("produse incarcate:", produse.length, produse[0]?.gender);

  const genderMap = {
    dama: "women",
    barbati: "men",
    unisex: "unisex",
  };

  const titluMap = {
    dama: "Parfumuri de Damă",
    barbati: "Parfumuri de Bărbați",
    unisex: "Parfumuri Unisex",
  };

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const nume = user?.first_name || user?.firstName || null;
  const userId = user?.id || "guest";
  const cosKey = `cos_${userId}`;

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setProduse(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Eroare la fetch produse:", err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const produseAfisate = produse
    .filter((p) => {
      if (categorie && genderMap[categorie]) {
        return p.gender === genderMap[categorie];
      }
      return true;
    })
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderStele = (rating) => {
    const stele = [];
    for (let i = 1; i <= 5; i++) {
      stele.push(
        <span key={i} className={i <= Math.round(rating) ? "stea plina" : "stea goala"}>
          ★
        </span>
      );
    }
    return stele;
  };

  const closeToast = useCallback(() => setToast(null), []);

  const adaugaInCos = (e, produs) => {
    e.stopPropagation();
    const cosExistent = JSON.parse(localStorage.getItem(cosKey)) || [];
    const indexExistent = cosExistent.findIndex((p) => p.id === produs.id);

    if (indexExistent >= 0) {
      cosExistent[indexExistent].cantitate += 1;
    } else {
      cosExistent.push({ ...produs, cantitate: 1 });
    }

    localStorage.setItem(cosKey, JSON.stringify(cosExistent));
    setToast({ mesaj: `„${produs.name}" a fost adăugat în coș!`, tip: "succes" });
  };

  return (
    <div>
      {toast && <Toast mesaj={toast.mesaj} tip={toast.tip} onClose={closeToast} />}

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

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Caută produse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>

        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <a href="/">Acasă</a>
          <a href="/produse" className="nav-link-activ">Produse</a>
          <a href="/cos">Coșul meu</a>
          <a href="/cont">Contul meu</a>
          {!user && <a href="/login" className="nav-login-btn">Login</a>}
        </div>

        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      <CategoryBar />

      <div className="welcome-banner">
        {nume ? `Bine ai revenit, ${nume}! 👋` : "Bine ai venit! 👋"}
      </div>

      <main className="produse-container">
        <div className="produse-header">
          <h1 className="produse-titlu">
            {categorie && titluMap[categorie] ? titluMap[categorie] : "Toate produsele"}
          </h1>
          <p className="produse-subtitlu">
            {produseAfisate.length} {produseAfisate.length === 1 ? "produs găsit" : "produse găsite"}
          </p>
        </div>

        {loading ? (
          <div className="produse-loading">Se încarcă produsele...</div>
        ) : produseAfisate.length === 0 ? (
          <div className="produse-empty">
            <p>Nu am găsit niciun produs{searchTerm ? ` pentru „${searchTerm}"` : " în această categorie"}.</p>
          </div>
        ) : (
          <div className="produse-grid">
            {produseAfisate.map((produs) => (
              <div
                className="produs-card"
                key={produs.id}
                onClick={() => window.location.href = `/produs/${produs.slug}`}
                style={{ cursor: "pointer" }}
              >
                <div className="produs-img-wrapper">
                  <img src={produs.image_url} alt={produs.name} className="produs-img" />
                </div>
                <div className="produs-info">
                  <p className="produs-nume">{produs.name}</p>
                  <div className="produs-stele">{renderStele(produs.rating)}</div>
                  <p className="produs-pret">
                    {(produs.price_cents / 100).toFixed(0)} {produs.currency}
                  </p>
                  <button className="produs-btn" onClick={(e) => adaugaInCos(e, produs)}>
                    Adaugă în coș
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}