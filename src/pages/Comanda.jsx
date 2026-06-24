import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import "../styles/comanda.css";
import Toast from "../components/Toast";
import CategoryBar from "../components/CategoryBar";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function StripeForm({ clientSecret, onSuccess, onBack }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [eroare, setEroare] = useState("");

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setEroare("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/comanda-confirmata`,
      },
    });

    if (error) {
      setEroare(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="stripe-form-wrapper">
      <PaymentElement options={{ layout: "tabs" }} />
      {eroare && <p className="eroare stripe-eroare">{eroare}</p>}
      <div className="stripe-butoane">
        <button className="comanda-btn-secundar" onClick={onBack} disabled={loading}>
          ← Înapoi
        </button>
        <button className="comanda-btn" onClick={handlePay} disabled={loading}>
          {loading ? "Se procesează..." : "Plătește acum"}
        </button>
      </div>
    </div>
  );
}

export default function Comanda() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cos, setCos] = useState([]);
  const [livrare, setLivrare] = useState("cargus");
  const [plata, setPlata] = useState("ramburs");
  const [erori, setErori] = useState({});
  const [clientSecret, setClientSecret] = useState(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [toast, setToast] = useState(null);

  const [voucher, setVoucher] = useState("");
  const [voucherAplicat, setVoucherAplicat] = useState(null);
  const [voucherEroare, setVoucherEroare] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);

  const navigate = useNavigate();
  const closeToast = useCallback(() => setToast(null), []);

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const nume = user?.first_name || user?.firstName || null;
  const userId = user?.id || "guest";
  const cosKey = `cos_${userId}`;

  const [form, setForm] = useState({
    nume: "",
    prenume: "",
    email: "",
    telefon: "",
    tara: "",
    judet: "",
    oras: "",
    comuna: "",
    strada: "",
    bloc: "",
    apartament: "",
  });

  useEffect(() => {
    const cosExistent = JSON.parse(localStorage.getItem(cosKey)) || [];
    setCos(cosExistent);
  }, [cosKey]);

  const total = cos.reduce(
    (sum, p) => sum + (p.price_cents / 100) * p.cantitate,
    0
  );
  const costLivrare = total >= 300 ? 0 : livrare === "cargus" ? 20 : 25;
  const discountSuma = voucherAplicat
    ? (total + costLivrare) * (voucherAplicat.discount_percent / 100)
    : 0;
  const totalFinal = total + costLivrare - discountSuma;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErori({ ...erori, [e.target.name]: "" });
  };

  const valideaza = () => {
    const campuriObligatorii = [
      "nume", "prenume", "email", "telefon",
      "tara", "judet", "oras", "strada",
    ];
    const eroriNoi = {};
    campuriObligatorii.forEach((camp) => {
      if (!form[camp].trim()) eroriNoi[camp] = "Câmp obligatoriu";
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      eroriNoi.email = "Email invalid";
    if (form.telefon && !/^[0-9]{10}$/.test(form.telefon))
      eroriNoi.telefon = "Număr de telefon invalid (10 cifre)";
    return eroriNoi;
  };

  const aplicaVoucher = async () => {
    if (!voucher.trim()) return;
    setVoucherLoading(true);
    setVoucherEroare("");
    setVoucherAplicat(null);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/vouchers/valideaza`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code: voucher }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setVoucherAplicat(data);
      } else {
        setVoucherEroare(data.message);
      }
    } catch {
      setVoucherEroare("Eroare de rețea.");
    }
    setVoucherLoading(false);
  };

  const folosteVoucher = async () => {
    if (!voucherAplicat) return;
    await fetch(`${process.env.REACT_APP_API_URL}/api/vouchers/foloseste`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code: voucher }),
    });
  };

  const handleSubmitRamburs = async () => {
  const eroriNoi = valideaza();
  if (Object.keys(eroriNoi).length > 0) {
    setErori(eroriNoi);
    return;
  }

  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        produse: cos,
        total_cents: totalFinal * 100,
        cost_livrare: costLivrare,
        livrare,
        plata: "ramburs",
        form,
        voucher_code: voucherAplicat ? voucher : null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setToast({ mesaj: data.message || "Eroare la plasarea comenzii.", tip: "eroare" });
      return;
    }

    await folosteVoucher();
    setToast({ mesaj: `Comanda ${data.order_number} a fost plasată cu succes! 🎉`, tip: "succes" });
    localStorage.removeItem(cosKey);
    setTimeout(() => navigate("/"), 2000);

  } catch (err) {
    setToast({ mesaj: "Eroare de rețea. Încearcă din nou.", tip: "eroare" });
  }
};

  const handleSubmitCard = async () => {
    const eroriNoi = valideaza();
    if (Object.keys(eroriNoi).length > 0) {
      setErori(eroriNoi);
      return;
    }
    setLoadingIntent(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/create-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            produse: cos.map((p) => ({ id: p.id, cantitate: p.cantitate })),
            livrare,
            voucher_code: voucherAplicat ? voucher : null,
            currency: "ron",
          }),
        }
      );
      const data = await res.json();
      if (data.clientSecret) {
        await folosteVoucher();
        setClientSecret(data.clientSecret);
      } else {
        setToast({ mesaj: "Eroare la inițializarea plății. Încearcă din nou.", tip: "eroare" });
      }
    } catch (err) {
      setToast({ mesaj: "Eroare de rețea. Încearcă din nou.", tip: "eroare" });
    }
    setLoadingIntent(false);
  };

  const handleSubmit = () => {
    if (plata === "ramburs") handleSubmitRamburs();
    else handleSubmitCard();
  };

  if (clientSecret) {
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
            <a href="/login" className="nav-login-btn">Login</a>
          </div>
          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </div>
        </nav>

        <div className="welcome-banner">
          {nume ? `Bine ai revenit, ${nume}! 👋` : "Bine ai venit! 👋"}
        </div>

        <CategoryBar />

        <main className="comanda-container">
          <h1 className="comanda-titlu">Plată online</h1>
          <div className="stripe-container">
            <div className="stripe-sumar-mic">
              <span>Total de plată:</span>
              <strong>{totalFinal.toFixed(0)} RON</strong>
            </div>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#a16943",
                    borderRadius: "8px",
                    fontFamily: "Lato, sans-serif",
                  },
                },
              }}
            >
              <StripeForm
                clientSecret={clientSecret}
                onSuccess={() => {
                  localStorage.removeItem(cosKey);
                  navigate("/");
                }}
                onBack={() => setClientSecret(null)}
              />
            </Elements>
          </div>
        </main>
      </div>
    );
  }

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
          <a href="/login" className="nav-login-btn">Login</a>
        </div>
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </div>
      </nav>

      <div className="welcome-banner">
        {nume ? `Bine ai revenit, ${nume}! 👋` : "Bine ai venit! 👋"}
      </div>

      <CategoryBar />

      <main className="comanda-container">
        <h1 className="comanda-titlu">Plasează comanda</h1>

        <div className="comanda-layout">
          <div className="comanda-formular">

            <div className="comanda-sectiune">
              <h2 className="sectiune-titlu">Detalii personale</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Nume *</label>
                  <input name="nume" value={form.nume} onChange={handleChange} placeholder="ex. Popescu" />
                  {erori.nume && <span className="eroare">{erori.nume}</span>}
                </div>
                <div className="form-group">
                  <label>Prenume *</label>
                  <input name="prenume" value={form.prenume} onChange={handleChange} placeholder="ex. Ion" />
                  {erori.prenume && <span className="eroare">{erori.prenume}</span>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="ex. ion@email.com" />
                  {erori.email && <span className="eroare">{erori.email}</span>}
                </div>
                <div className="form-group">
                  <label>Număr de telefon *</label>
                  <input name="telefon" value={form.telefon} onChange={handleChange} placeholder="ex. 0712345678" />
                  {erori.telefon && <span className="eroare">{erori.telefon}</span>}
                </div>
              </div>
            </div>

            <div className="comanda-sectiune">
              <h2 className="sectiune-titlu">Adresa de livrare</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Țară *</label>
                  <input name="tara" value={form.tara} onChange={handleChange} placeholder="ex. România" />
                  {erori.tara && <span className="eroare">{erori.tara}</span>}
                </div>
                <div className="form-group">
                  <label>Județ *</label>
                  <input name="judet" value={form.judet} onChange={handleChange} placeholder="ex. Brașov" />
                  {erori.judet && <span className="eroare">{erori.judet}</span>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Oraș *</label>
                  <input name="oras" value={form.oras} onChange={handleChange} placeholder="ex. Brașov" />
                  {erori.oras && <span className="eroare">{erori.oras}</span>}
                </div>
                <div className="form-group">
                  <label>Comună <span className="optional">(opțional)</span></label>
                  <input name="comuna" value={form.comuna} onChange={handleChange} placeholder="ex. Ghimbav" />
                </div>
              </div>
              <div className="form-group">
                <label>Stradă, număr *</label>
                <input name="strada" value={form.strada} onChange={handleChange} placeholder="ex. Str. Florilor, nr. 5" />
                {erori.strada && <span className="eroare">{erori.strada}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Bloc <span className="optional">(opțional)</span></label>
                  <input name="bloc" value={form.bloc} onChange={handleChange} placeholder="ex. B12" />
                </div>
                <div className="form-group">
                  <label>Apartament <span className="optional">(opțional)</span></label>
                  <input name="apartament" value={form.apartament} onChange={handleChange} placeholder="ex. 24" />
                </div>
              </div>
            </div>

            <div className="comanda-sectiune">
              <h2 className="sectiune-titlu">Curierat</h2>
              <div className="optiuni-livrare">
                <label className={`optiune-card ${livrare === "cargus" ? "activ" : ""}`}>
                  <input type="radio" name="livrare" value="cargus" checked={livrare === "cargus"} onChange={() => setLivrare("cargus")} />
                  <div>
                    <p className="optiune-nume">Cargus</p>
                    <p className="optiune-pret">20 RON</p>
                  </div>
                </label>
                <label className={`optiune-card ${livrare === "fancurier" ? "activ" : ""}`}>
                  <input type="radio" name="livrare" value="fancurier" checked={livrare === "fancurier"} onChange={() => setLivrare("fancurier")} />
                  <div>
                    <p className="optiune-nume">FanCurier</p>
                    <p className="optiune-pret">25 RON</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="comanda-sectiune">
              <h2 className="sectiune-titlu">Metodă de plată</h2>
              <div className="optiuni-livrare">
                <label className={`optiune-card ${plata === "ramburs" ? "activ" : ""}`}>
                  <input type="radio" name="plata" value="ramburs" checked={plata === "ramburs"} onChange={() => setPlata("ramburs")} />
                  <div>
                    <p className="optiune-nume">💵 Ramburs</p>
                    <p className="optiune-desc">Plătești la livrare</p>
                  </div>
                </label>
                <label className={`optiune-card ${plata === "card" ? "activ" : ""}`}>
                  <input type="radio" name="plata" value="card" checked={plata === "card"} onChange={() => setPlata("card")} />
                  <div>
                    <p className="optiune-nume">💳 Card / Apple Pay / Google Pay</p>
                    <p className="optiune-desc">Plătești online securizat</p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          <div className="comanda-sumar">
            <h2 className="sectiune-titlu">Sumar comandă</h2>
            <div className="sumar-produse">
              {cos.map((p) => (
                <div className="sumar-item" key={p.id}>
                  <span className="sumar-nume">{p.name} × {p.cantitate}</span>
                  <span className="sumar-pret">{((p.price_cents / 100) * p.cantitate).toFixed(0)} {p.currency}</span>
                </div>
              ))}
            </div>
            <div className="sumar-linie">
              <span>Subtotal</span>
              <span>{total.toFixed(0)} RON</span>
            </div>
            <div className="sumar-linie">
              <span>Livrare ({livrare === "cargus" ? "Cargus" : "FanCurier"})</span>
              <span style={{ color: total >= 300 ? "#2e7d32" : "inherit", fontWeight: total >= 300 ? "700" : "400" }}>
                {total >= 300 ? "GRATUIT 🎉" : `${costLivrare} RON`}
              </span>
            </div>

            <div className="voucher-section">
              <p className="voucher-label">Ai un cod de reducere?</p>
              <div className="voucher-row">
                <input
                  className="voucher-input"
                  placeholder="ex. ALEMAR-A1B2C3D4"
                  value={voucher}
                  onChange={(e) => {
                    setVoucher(e.target.value.toUpperCase());
                    setVoucherEroare("");
                    setVoucherAplicat(null);
                  }}
                  disabled={!!voucherAplicat}
                />
                <button
                  className="voucher-btn"
                  onClick={aplicaVoucher}
                  disabled={voucherLoading || !!voucherAplicat}
                >
                  {voucherLoading ? "..." : voucherAplicat ? "✓" : "Aplică"}
                </button>
              </div>
              {voucherEroare && <p className="eroare">{voucherEroare}</p>}
              {voucherAplicat && (
                <p className="voucher-succes">
                  ✅ Reducere de {voucherAplicat.discount_percent}% aplicată!
                </p>
              )}
            </div>

            {voucherAplicat && (
              <div className="sumar-linie" style={{ color: "#2e7d32" }}>
                <span>Reducere ({voucherAplicat.discount_percent}%)</span>
                <span>-{discountSuma.toFixed(0)} RON</span>
              </div>
            )}

            <div className="sumar-linie total">
              <span>Total</span>
              <span>{totalFinal.toFixed(0)} RON</span>
            </div>
            <button className="comanda-btn" onClick={handleSubmit} disabled={loadingIntent}>
              {loadingIntent
                ? "Se pregătește plata..."
                : plata === "card"
                ? "Continuă spre plată →"
                : "Plasează comanda"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}