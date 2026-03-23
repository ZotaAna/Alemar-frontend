import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/cont.css";

export default function Cont() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sectiune, setSectiune] = useState("profil");
  const [profil, setProfil] = useState({ first_name: "", last_name: "", phone: "" });
  const [parole, setParole] = useState({ parola_veche: "", parola_noua: "", parola_confirmare: "" });
  const [comenzi, setComenzi] = useState([]);
  const [adrese, setAdrese] = useState([]);
  const [adresaNoua, setAdresaNoua] = useState({ tara: "", judet: "", oras: "", comuna: "", strada: "", bloc: "", apartament: "", is_default: false });
  const [mesaj, setMesaj] = useState("");
  const [eroare, setEroare] = useState("");
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const nume = user?.first_name || user?.firstName || null;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }
    fetchProfil();
    fetchComenzi();
    fetchAdrese();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchProfil = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user/profile`, { headers });
    const data = await res.json();
    setProfil({ first_name: data.first_name || "", last_name: data.last_name || "", phone: data.phone || "" });
  };

  const fetchComenzi = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user/orders`, { headers });
    const data = await res.json();
    setComenzi(data);
  };

  const fetchAdrese = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user/addresses`, { headers });
    const data = await res.json();
    setAdrese(data);
  };

  const salveazaProfil = async () => {
    setMesaj(""); setEroare("");
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
      method: "PUT", headers, body: JSON.stringify(profil)
    });
    if (res.ok) setMesaj("Profil actualizat cu succes!");
    else setEroare("Eroare la actualizare.");
  };

  const schimbaParola = async () => {
    setMesaj(""); setEroare("");
    if (parole.parola_noua !== parole.parola_confirmare) {
      setEroare("Parolele noi nu coincid.");
      return;
    }
    if (parole.parola_noua.length < 6) {
      setEroare("Parola nouă trebuie să aibă minim 6 caractere.");
      return;
    }
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user/password`, {
      method: "PUT", headers,
      body: JSON.stringify({ parola_veche: parole.parola_veche, parola_noua: parole.parola_noua })
    });
    const data = await res.json();
    if (res.ok) { setMesaj("Parola schimbată cu succes!"); setParole({ parola_veche: "", parola_noua: "", parola_confirmare: "" }); }
    else setEroare(data.message);
  };

  const adaugaAdresa = async () => {
    setMesaj(""); setEroare("");
    if (!adresaNoua.tara || !adresaNoua.judet || !adresaNoua.oras || !adresaNoua.strada) {
      setEroare("Completează câmpurile obligatorii.");
      return;
    }
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user/addresses`, {
      method: "POST", headers, body: JSON.stringify(adresaNoua)
    });
    if (res.ok) {
      setMesaj("Adresă adăugată!");
      setAdresaNoua({ tara: "", judet: "", oras: "", comuna: "", strada: "", bloc: "", apartament: "", is_default: false });
      fetchAdrese();
    }
  };

  const stergeAdresa = async (id) => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/user/addresses/${id}`, { method: "DELETE", headers });
    fetchAdrese();
  };

  const delogare = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const statusCuloare = (status) => {
    const map = { pending: "#f39c12", confirmed: "#3498db", shipped: "#9b59b6", delivered: "#27ae60", cancelled: "#e74c3c" };
    return map[status] || "#888";
  };

  const statusText = (status) => {
    const map = { pending: "În așteptare", confirmed: "Confirmată", shipped: "Expediată", delivered: "Livrată", cancelled: "Anulată" };
    return map[status] || status;
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
        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <a href="/">Acasă</a>
          <a href="/produse">Produse</a>
          <a href="/cos">Coșul meu</a>
          <a href="/cont" className="nav-link-activ">Contul meu</a>
          <a href="/login" className="nav-login-btn">Login</a>
        </div>
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </div>
      </nav>

      <div className="welcome-banner">
        {nume ? `Bine ai revenit, ${nume}! 👋` : "Bine ai venit! 👋"}
      </div>

      <main className="cont-container">
        <div className="cont-layout">

          {/* SIDEBAR */}
          <aside className="cont-sidebar">
            <div className="cont-avatar">
              <div className="avatar-cerc">{nume ? nume[0].toUpperCase() : "U"}</div>
              <p className="avatar-nume">{profil.first_name} {profil.last_name}</p>
            </div>
            <nav className="cont-nav">
              <button className={sectiune === "profil" ? "activ" : ""} onClick={() => { setSectiune("profil"); setMesaj(""); setEroare(""); }}>👤 Profilul meu</button>
              <button className={sectiune === "parola" ? "activ" : ""} onClick={() => { setSectiune("parola"); setMesaj(""); setEroare(""); }}>🔒 Schimbă parola</button>
              <button className={sectiune === "comenzi" ? "activ" : ""} onClick={() => { setSectiune("comenzi"); setMesaj(""); setEroare(""); }}>📦 Comenzile mele</button>
              <button className={sectiune === "adrese" ? "activ" : ""} onClick={() => { setSectiune("adrese"); setMesaj(""); setEroare(""); }}>📍 Adresele mele</button>
              <button className="delogare-btn" onClick={delogare}>🚪 Deconectare</button>
            </nav>
          </aside>

          {/* CONTINUT */}
          <div className="cont-continut">
            {mesaj && <div className="cont-mesaj succes">{mesaj}</div>}
            {eroare && <div className="cont-mesaj eroare">{eroare}</div>}

            {/* PROFIL */}
            {sectiune === "profil" && (
              <div className="cont-sectiune">
                <h2>Profilul meu</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nume</label>
                    <input value={profil.last_name} onChange={(e) => setProfil({ ...profil, last_name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Prenume</label>
                    <input value={profil.first_name} onChange={(e) => setProfil({ ...profil, first_name: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Număr de telefon</label>
                  <input value={profil.phone} onChange={(e) => setProfil({ ...profil, phone: e.target.value })} placeholder="ex. 0712345678" />
                </div>
                <button className="cont-btn" onClick={salveazaProfil}>Salvează modificările</button>
              </div>
            )}

            {/* PAROLA */}
            {sectiune === "parola" && (
              <div className="cont-sectiune">
                <h2>Schimbă parola</h2>
                <div className="form-group">
                  <label>Parola actuală</label>
                  <input type="password" value={parole.parola_veche} onChange={(e) => setParole({ ...parole, parola_veche: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Parola nouă</label>
                  <input type="password" value={parole.parola_noua} onChange={(e) => setParole({ ...parole, parola_noua: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Confirmă parola nouă</label>
                  <input type="password" value={parole.parola_confirmare} onChange={(e) => setParole({ ...parole, parola_confirmare: e.target.value })} />
                </div>
                <button className="cont-btn" onClick={schimbaParola}>Schimbă parola</button>
              </div>
            )}

            {/* COMENZI */}
            {sectiune === "comenzi" && (
              <div className="cont-sectiune">
                <h2>Comenzile mele</h2>
                {comenzi.length === 0 ? (
                  <p className="cont-gol">Nu ai nicio comandă încă.</p>
                ) : (
                  comenzi.map((comanda) => (
                    <div className="comanda-card" key={comanda.id}>
                      <div className="comanda-card-header">
                        <span className="comanda-nr">{comanda.order_number}</span>
                        <span className="comanda-status" style={{ backgroundColor: statusCuloare(comanda.status) }}>
                          {statusText(comanda.status)}
                        </span>
                      </div>
                      <p className="comanda-data">
                        {new Date(comanda.created_at).toLocaleDateString("ro-RO", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                      <div className="comanda-produse">
                        {comanda.produse.map((p, i) => (
                          <p key={i}>{p.product_name} × {p.quantity} — {(p.price_cents / 100 * p.quantity).toFixed(0)} RON</p>
                        ))}
                      </div>
                      <p className="comanda-total">Total: <strong>{(comanda.total_cents / 100).toFixed(0)} {comanda.currency}</strong></p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ADRESE */}
            {sectiune === "adrese" && (
              <div className="cont-sectiune">
                <h2>Adresele mele</h2>
                {adrese.map((adresa) => (
                  <div className="adresa-card" key={adresa.id}>
                    <div className="adresa-info">
                      <p>{adresa.strada}{adresa.bloc ? `, Bl. ${adresa.bloc}` : ""}{adresa.apartament ? `, Ap. ${adresa.apartament}` : ""}</p>
                      <p>{adresa.oras}{adresa.comuna ? `, ${adresa.comuna}` : ""}, {adresa.judet}, {adresa.tara}</p>
                      {adresa.is_default && <span className="adresa-default">Implicită</span>}
                    </div>
                    <button className="adresa-sterge" onClick={() => stergeAdresa(adresa.id)}>✕</button>
                  </div>
                ))}

                <h3 className="adresa-adauga-titlu">Adaugă adresă nouă</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Țară *</label>
                    <input value={adresaNoua.tara} onChange={(e) => setAdresaNoua({ ...adresaNoua, tara: e.target.value })} placeholder="ex. România" />
                  </div>
                  <div className="form-group">
                    <label>Județ *</label>
                    <input value={adresaNoua.judet} onChange={(e) => setAdresaNoua({ ...adresaNoua, judet: e.target.value })} placeholder="ex. Brașov" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Oraș *</label>
                    <input value={adresaNoua.oras} onChange={(e) => setAdresaNoua({ ...adresaNoua, oras: e.target.value })} placeholder="ex. Brașov" />
                  </div>
                  <div className="form-group">
                    <label>Comună <span className="optional">(opțional)</span></label>
                    <input value={adresaNoua.comuna} onChange={(e) => setAdresaNoua({ ...adresaNoua, comuna: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Stradă, număr *</label>
                  <input value={adresaNoua.strada} onChange={(e) => setAdresaNoua({ ...adresaNoua, strada: e.target.value })} placeholder="ex. Str. Florilor, nr. 5" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Bloc <span className="optional">(opțional)</span></label>
                    <input value={adresaNoua.bloc} onChange={(e) => setAdresaNoua({ ...adresaNoua, bloc: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Apartament <span className="optional">(opțional)</span></label>
                    <input value={adresaNoua.apartament} onChange={(e) => setAdresaNoua({ ...adresaNoua, apartament: e.target.value })} />
                  </div>
                </div>
                <label className="checkbox-label">
                  <input type="checkbox" checked={adresaNoua.is_default} onChange={(e) => setAdresaNoua({ ...adresaNoua, is_default: e.target.checked })} />
                  Setează ca adresă implicită
                </label>
                <button className="cont-btn" onClick={adaugaAdresa}>Adaugă adresa</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}