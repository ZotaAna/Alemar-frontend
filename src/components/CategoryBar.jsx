import React, { useState } from "react";
import "./categorybar.css";
import PerfumeChat from "./PerfumeChat";

export default function CategoryBar() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const categories = [
   { id: "dama", label: "Parfumuri de Damă", icon: "🌸", href: "/produse/dama" },
{ id: "barbati", label: "Parfumuri de Bărbați", icon: "🌿", href: "/produse/barbati" },
{ id: "unisex", label: "Parfumuri Unisex", icon: "✨", href: "/produse/unisex" },
  ];

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat.id);
    setTimeout(() => { window.location.href = cat.href; }, 150);
  };

  return (
    <>
      <div className="category-bar">
        <div className="category-bar-inner">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`cat-btn ${activeCategory === cat.id ? "cat-btn--active" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.label}</span>
            </button>
          ))}
          <button className="cat-btn cat-btn--ai" onClick={() => setChatOpen(true)}>
            <span className="cat-icon">🤖</span>
            <span className="cat-label">Întreabă AI-ul</span>
          </button>
        </div>
      </div>
      <PerfumeChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}