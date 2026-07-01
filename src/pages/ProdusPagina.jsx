import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Toast from "../components/Toast";
import CategoryBar from "../components/CategoryBar";
import "../styles/produsPagina.css";

export default function ProdusPagina() {
  const { slug } = useParams();
  const [produs, setProdus] = useState(null);
  const [recenzii, setRecenzii] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [ratingNou, setRatingNou] = useState(0);
  const [comentariuNou, setComentariuNou] = useState("");
  const [loadingRecenzie, setLoadingRecenzie] = useState(false);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = localStorage.getItem("token");
  const nume = user?.first_name || user?.firstName || null;
  const userId = user?.id || "guest";
  const cosKey = `cos_${userId}`;

  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setProdus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`${process.env.REACT_APP_API_URL}/api/products/${slug}/reviews`)
      .then((res) => res.json())
      .then((data) => setRecenzii(Array.isArray(data) ? data : []))
      .catch(() => setRecenzii([]));
  }, [slug]);

  const adaugaInCos = () => {
    if (!produs) return;
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

  const trimiteRecenzie = async () => {
    if (!token) {
      setToast({ mesaj: "Trebuie să fii conectat pentru a lăsa o recenzie.", tip: "eroare" });
      return;
    }
    if (ratingNou === 0) {
      setToast({ mesaj: "Selectează un rating între 1 și 5 stele.", tip: "eroare" });
      return;
    }
    setLoadingRecenzie(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/products/${slug}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating: ratingNou, comment: comentariuNou }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setToast({ mesaj: data.message || "Eroare la trimiterea recenziei.", tip: "eroare" });
      } else {
        setToast({ mesaj: "Recenzie trimisă cu succes! 🎉", tip: "succes" });
        setRatingNou(0);
        setComentariuNou("");
        const recenziiNoi = await fetch(
          `${process.env.REACT_APP_API_URL}/api/products/${slug}/reviews`
        ).then((r) => r.json());
        setRecenzii(Array.isArray(recenziiNoi) ? recenziiNoi : []);
      }
    } catch {
      setToast({ mesaj: "Eroare de conexiune.", tip: "eroare" });
    }
    setLoadingRecenzie(false);
  };

  const renderStele = (rating, interactiv = false) => {
    return [1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        className={i <= (interactiv ? ratingNou : Math.round(rating)) ? "stea plina" : "stea goala"}
        style={interactiv ? { cursor: "pointer", fontSize: "28px" } : {}}
        onClick={interactiv ? () => setRatingNou(i) : undefined}
      >
        ★
      </span>
    ));
  };

  if (loading) return <div className="pp-loading">Se încarcă...</div>;
  if (!produs) return <div className="pp-loading">Produsul nu a fost găsit.</div>;

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
        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <a href="/">Acasă</a>
          <a href="/produse">Produse</a>
          <a href="/cos">Coșul meu</a>
          <a href="/cont">Contul meu</a>
          {!user && <a href="/login" className="nav-login-btn">Login</a>}
        </div>
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </div>
      </nav>

      <CategoryBar />

      <div className="welcome-banner">
        {nume ? `Bine ai revenit, ${nume}! 👋` : "Bine ai venit! 👋"}
      </div>

      <main className="pp-container">

        {/* SECTIUNEA PRODUS */}
        <div className="pp-produs">
          <div className="pp-img-wrapper">
            <img src={produs.image_url} alt={produs.name} className="pp-img" />
          </div>
          <div className="pp-detalii">
            <p className="pp-brand">{produs.brand_name}</p>
            <h1 className="pp-nume">{produs.name}</h1>
            <div className="pp-stele">{renderStele(produs.rating)}</div>
            <p className="pp-pret">
              {(produs.price_cents / 100).toFixed(0)} {produs.currency}
            </p>

            {produs.gender && (
              <p className="pp-info"><span>Gen:</span> {produs.gender}</p>
            )}
            {produs.concentration && (
              <p className="pp-info"><span>Concentrație:</span> {produs.concentration}</p>
            )}
            {produs.volume_ml && (
              <p className="pp-info"><span>Volum:</span> {produs.volume_ml} ml</p>
            )}
            {produs.fragrance_notes && produs.fragrance_notes.length > 0 && (
              <p className="pp-info">
                <span>Note olfactive:</span> {produs.fragrance_notes.join(", ")}
              </p>
            )}

            {produs.description && (
              <p className="pp-descriere">{produs.description}</p>
            )}

            <button className="pp-btn-cos" onClick={adaugaInCos}>
              🛒 Adaugă în coș
            </button>
          </div>
        </div>

        {/* SECTIUNEA RECENZII */}
        <div className="pp-recenzii">
          <h2 className="pp-recenzii-titlu">Recenzii ({recenzii.length})</h2>

          {recenzii.length === 0 ? (
            <p className="pp-no-recenzii">Nicio recenzie încă. Fii primul care lasă una!</p>
          ) : (
            <div className="pp-recenzii-lista">
              {recenzii.map((r) => (
                <div className="pp-recenzie-card" key={r.id}>
                  <div className="pp-recenzie-header">
                    <span className="pp-recenzie-autor">
                      {r.first_name} {r.last_name}
                    </span>
                    <span className="pp-recenzie-data">
                      {new Date(r.created_at).toLocaleDateString("ro-RO")}
                    </span>
                  </div>
                  <div className="pp-recenzie-stele">{renderStele(r.rating)}</div>
                  {r.comment && <p className="pp-recenzie-comentariu">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}

          {/* FORMULAR RECENZIE */}
          <div className="pp-recenzie-form">
            <h3>Lasă o recenzie</h3>
            {!user ? (
              <p className="pp-login-msg">
                <a href="/login">Conectează-te</a> pentru a lăsa o recenzie.
              </p>
            ) : (
              <>
                <div className="pp-rating-selectie">
                  <p>Rating:</p>
                  {renderStele(ratingNou, true)}
                </div>
                <textarea
                  className="pp-textarea"
                  placeholder="Scrie comentariul tău aici... (opțional)"
                  value={comentariuNou}
                  onChange={(e) => setComentariuNou(e.target.value)}
                  rows={4}
                />
                <button
                  className="pp-btn-recenzie"
                  onClick={trimiteRecenzie}
                  disabled={loadingRecenzie}
                >
                  {loadingRecenzie ? "Se trimite..." : "Trimite recenzia"}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}