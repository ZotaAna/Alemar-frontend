import React, { useState, useEffect, useRef } from "react";
import "./caruselpersonalizat.css";

export default function CaruselPersonalizat({ onProfilIncarcat }) {
  const [recomandari, setRecomandari] = useState([]);
  const [explicatii, setExplicatii] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare] = useState(false);
  const carouselRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    fetch(`${process.env.REACT_APP_API_URL}/api/ai/profil-olfactiv`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(async (data) => {
        if (!data.areProfil) { setLoading(false); return; }

        if (onProfilIncarcat) onProfilIncarcat(data.noteTop, data.scoruriRadar);

        setRecomandari(data.recomandari);

        const res2 = await fetch(`${process.env.REACT_APP_API_URL}/api/ai/recomandari`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            recomandari: data.recomandari,
            produseAnalizate: data.produseAnalizate,
          }),
        });
        const data2 = await res2.json();
        setExplicatii(data2.explicatii || []);
        setLoading(false);
      })
      .catch(() => { setEroare(true); setLoading(false); });
  }, []);

  const scrollLeft = () => carouselRef.current?.scrollBy({ left: -260, behavior: "smooth" });
  const scrollRight = () => carouselRef.current?.scrollBy({ left: 260, behavior: "smooth" });

  const renderStele = (rating) =>
    [1, 2, 3, 4, 5].map(i => (
      <span key={i} className={i <= Math.round(rating) ? "stea plina" : "stea goala"}>★</span>
    ));

  if (loading) return (
    <div className="cp-loading">
      <div className="cp-spinner"></div>
      <p>AI-ul analizează profilul tău olfactiv...</p>
    </div>
  );

  if (eroare || recomandari.length === 0) return null;

  return (
    <section className="cp-sectiune">
      <div className="cp-header">
        <div>
          <span className="cp-badge">🤖 Personalizat pentru tine</span>
          <h2 className="cp-titlu">Selecția ta olfactivă</h2>
          <p className="cp-subtitlu">Recomandate de AI pe baza profilului tău</p>
        </div>
      </div>

      <div className="cp-wrapper">
        <button className="cp-btn stanga" onClick={scrollLeft}>‹</button>
        <div className="cp-track" ref={carouselRef}>
          {recomandari.map((produs, idx) => (
            <a href={`/produs/${produs.slug}`} className="cp-card" key={produs.id}>
              <div className="cp-img-wrap">
                <img src={produs.image_url} alt={produs.name} className="cp-img" />
                <div className="cp-ai-tag">AI Pick #{idx + 1}</div>
              </div>
              <div className="cp-info">
                <p className="cp-nume">{produs.name}</p>
                <div className="cp-stele">{renderStele(produs.rating)}</div>
                {explicatii[idx] && (
                  <p className="cp-explicatie">✨ {explicatii[idx]}</p>
                )}
                <p className="cp-pret">
                  {(produs.price_cents / 100).toFixed(0)} {produs.currency}
                </p>
              </div>
            </a>
          ))}
        </div>
        <button className="cp-btn dreapta" onClick={scrollRight}>›</button>
      </div>
    </section>
  );
}