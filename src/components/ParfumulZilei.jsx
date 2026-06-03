import React, { useState, useEffect } from "react";
import "./parfumulzilei.css";

export default function ParfumulZilei({ noteTop }) {
  const [parfum, setParfum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    const cacheKey = "parfumul_zilei_cache";
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
    const acum = new Date().getTime();

    if (cached && acum - cached.timestamp < 24 * 60 * 60 * 1000) {
      setParfum(cached.data);
      setLoading(false);
      return;
    }

    const luna = new Date().getMonth() + 1;
    const temperaturi = { 1:2, 2:4, 3:10, 4:16, 5:20, 6:25, 7:28, 8:27, 9:22, 10:15, 11:8, 12:3 };
    const temperatura = temperaturi[luna] || 15;
    const vremi = { 1:"rece și înnorat", 2:"rece", 3:"răcoros", 4:"plăcut", 5:"cald și însorit", 6:"cald", 7:"foarte cald", 8:"cald și însorit", 9:"plăcut", 10:"răcoros", 11:"rece și înnorat", 12:"rece și înnorat" };
    const vreme = vremi[luna];

    fetch(`${process.env.REACT_APP_API_URL}/api/ai/parfumul-zilei`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ vreme, temperatura, noteTop: noteTop || [] }),
    })
      .then(r => r.json())
      .then(data => {
        setParfum(data);
        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: acum }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [noteTop]);

  if (loading) return (
    <div className="pz-loading">
      <div className="pz-spinner"></div>
      <p>Se pregătește parfumul tău pentru azi...</p>
    </div>
  );

  if (!parfum || !parfum.produs) return null;

  const { produs, motiv, sezon } = parfum;
  const sezonEmoji = { primăvară:"🌸", vară:"☀️", toamnă:"🍂", iarnă:"❄️" };

  return (
    <div className="pz-container">
      <div className="pz-badge">{sezonEmoji[sezon] || "✨"} Parfumul tău de azi</div>
      <div className="pz-card">
        <div className="pz-imagine-wrap">
          <img src={produs.image_url} alt={produs.name} className="pz-imagine" />
          <div className="pz-overlay"></div>
        </div>
        <div className="pz-info">
          <p className="pz-sezon">{sezon?.toUpperCase()} · {new Date().toLocaleDateString("ro-RO", { weekday:"long", day:"numeric", month:"long" })}</p>
          <h3 className="pz-nume">{produs.name}</h3>
          <p className="pz-motiv">"{motiv}"</p>
          <p className="pz-pret">{(produs.price_cents / 100).toFixed(0)} {produs.currency}</p>
          <a href={`/produs/${produs.slug}`} className="pz-btn">Descoperă parfumul →</a>
        </div>
      </div>
    </div>
  );
}