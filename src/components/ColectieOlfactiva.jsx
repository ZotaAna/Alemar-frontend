import React, { useState, useEffect } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from "recharts";
import "./colectieolfactiva.css";

export default function ColectieOlfactiva() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    fetch(`${process.env.REACT_APP_API_URL}/api/ai/profil-olfactiv`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setProfil(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="co-loading">
      <div className="co-spinner"></div>
      <p>AI-ul îți construiește profilul olfactiv...</p>
    </div>
  );

  if (!profil || !profil.areProfil) return (
    <div className="co-gol">
      <div className="co-gol-icon">🌸</div>
      <h3>Colecția ta olfactivă este goală</h3>
      <p>Plasează prima comandă și AI-ul va construi profilul tău olfactiv unic!</p>
      <a href="/produse" className="co-btn">Explorează parfumurile</a>
    </div>
  );

  const { scoruriRadar, noteTop, produseAnalizate } = profil;

  const dataRadar = Object.entries(scoruriRadar).map(([categorie, valoare]) => ({
    categorie,
    valoare,
    fullMark: 100,
  }));

  const categorieEmoji = {
    Floral: "🌸", Oriental: "🕯️", Fresh: "🌿",
    Woody: "🪵", Gourmand: "🍯", Citric: "🍋"
  };

  const dominanta = Object.entries(scoruriRadar).sort((a, b) => b[1] - a[1])[0];

  const descrieri = {
    Floral: "Ești atrasă de parfumuri romantice și feminime, cu suflet de grădină înflorită.",
    Oriental: "Preferi parfumuri calde și senzuale, misterioase ca o noapte de vară.",
    Fresh: "Alegi prospețimea și naturalețea — parfumuri curate, pline de energie.",
    Woody: "Te atrag parfumurile terestre și profunde, cu caracter puternic și elegant.",
    Gourmand: "Iubești parfumurile dulci și îmbietoare, calde ca o îmbrățișare.",
    Citric: "Preferi vivacitatea și energia — parfumuri luminoase și revigorante.",
  };

  return (
    <div className="co-container">
      <div className="co-header">
        <span className="co-badge">🧬 Profilul tău olfactiv</span>
        <h2 className="co-titlu">Colecția ta olfactivă</h2>
        <p className="co-subtitlu">
          Construit automat de AI din {produseAnalizate.length} {produseAnalizate.length === 1 ? "parfum cumpărat" : "parfumuri cumpărate"}
        </p>
      </div>

      <div className="co-layout">

        {/* GRAFIC RADAR */}
        <div className="co-grafic-wrap">
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={dataRadar} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="#f0e6dd" />
              <PolarAngleAxis
                dataKey="categorie"
                tick={{ fill: "#555", fontSize: 13, fontWeight: 600 }}
                tickFormatter={(val) => `${categorieEmoji[val] || ""} ${val}`}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Profil"
                dataKey="valoare"
                stroke="#a16943"
                fill="#a16943"
                fillOpacity={0.35}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Intensitate"]}
                contentStyle={{ borderRadius: "8px", border: "1px solid #f0e6dd" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* INFO DREAPTA */}
        <div className="co-info">

          {/* Categoria dominanta */}
          {dominanta && (
            <div className="co-dominanta">
              <span className="co-dominanta-emoji">{categorieEmoji[dominanta[0]]}</span>
              <div>
                <p className="co-dominanta-label">Familia ta dominantă</p>
                <p className="co-dominanta-nume">{dominanta[0]}</p>
                <p className="co-dominanta-desc">{descrieri[dominanta[0]]}</p>
              </div>
            </div>
          )}

          {/* Note top */}
          {noteTop && noteTop.length > 0 && (
            <div className="co-note">
              <p className="co-note-label">Notele tale preferate</p>
              <div className="co-note-list">
                {noteTop.map((nota, i) => (
                  <span key={i} className="co-nota-tag">{nota}</span>
                ))}
              </div>
            </div>
          )}

          {/* Produse analizate */}
          <div className="co-produse">
            <p className="co-note-label">Bazat pe</p>
            {produseAnalizate.map((nume, i) => (
              <p key={i} className="co-produs-item">✓ {nume}</p>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}