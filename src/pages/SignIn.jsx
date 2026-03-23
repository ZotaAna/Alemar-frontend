import React, { useState } from "react";
import "../styles/signin.css";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Parolele nu coincid!");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Eroare la creare cont");
        return;
      }

      if (data.voucher) {
        alert(`Cont creat cu succes! 🎉\nCodul tău de reducere 10% pentru prima comandă este:\n\n${data.voucher}\n\nReține-l, îl poți folosi la finalizarea comenzii!`);
      } else {
        alert("Cont creat cu succes!");
      }
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Nu pot conecta la server (backend).");
    }
  };

  return (
    <div className="signin-container">
      <form className="signin-form" onSubmit={handleSubmit}>
        <h2>Creează un cont</h2>

        <input
          type="text"
          name="first_name"
          placeholder="Prenume"
          value={formData.first_name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="last_name"
          placeholder="Nume"
          value={formData.last_name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Adresă de email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Parolă"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmă parola"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <button type="submit">Creează cont</button>

        <p className="signin-login-link">
          Ai deja cont? <a href="/login">Autentifică-te</a>
        </p>
      </form>
    </div>
  );
}
