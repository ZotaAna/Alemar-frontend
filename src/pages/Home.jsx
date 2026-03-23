import React, { useState, useEffect, useRef } from "react";
import "../styles/home.css";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [produse, setProduse] = useState([]);
  const carouselRef = useRef(null);

const storedUser = localStorage.getItem("user");
const token = localStorage.getItem("token");
const user = (storedUser && token) ? JSON.parse(storedUser) : null;
const nume = user?.first_name || user?.firstName || null;

  useEffect(() => {
    fetch("http://localhost:3001/api/products")
      .then((res) => res.json())
      .then((data) => setProduse(data))
      .catch((err) => console.error("Eroare la fetch produse:", err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Caut produs:", searchTerm);
  };

  const scrollLeft = () => {
    carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

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
          <a href="#acasa" className="nav-link-activ">Acasă</a>
          <a href="/produse">Produse</a>
         <a href="/cos">Coșul meu</a>
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

      <main className="home-container">

        {/* CARUSEL */}
        <section className="carousel-section">
          <h2 className="carousel-title">Recomandările noastre</h2>
          <div className="carousel-wrapper">
            <button className="carousel-btn stanga" onClick={scrollLeft}>‹</button>
            <div className="carousel-track" ref={carouselRef}>
              {produse.map((produs) => (
                <div className="produs-card" key={produs.id}>
                  <img
                    src={produs.image_url}
                    alt={produs.name}
                    className="produs-img"
                  />
                  <div className="produs-info">
                    <p className="produs-nume">{produs.name}</p>
                    <div className="produs-stele">{renderStele(produs.rating)}</div>
                    <p className="produs-pret">
                      {(produs.price_cents / 100).toFixed(0)} {produs.currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="carousel-btn dreapta" onClick={scrollRight}>›</button>
          </div>
        </section>

      </main>
    </div>
  );
}