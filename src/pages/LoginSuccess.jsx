import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Toast from "../components/Toast";

export default function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      navigate("/login", { replace: true });
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/api/auth/exchange?code=${code}`)
      .then((res) => {
        if (!res.ok) throw new Error("Cod invalid sau expirat.");
        return res.json();
      })
      .then(({ token }) => {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const user = {
          id: payload.userId,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          role: payload.role,
        };
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        setTimeout(() => navigate("/home", { replace: true }), 1500);
      })
      .catch((err) => {
        console.error(err);
        setToast({ mesaj: "Eroare la autentificare!", tip: "eroare" });
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      });
  }, [searchParams, navigate]);

  return (
    <>
      {toast && <Toast mesaj={toast.mesaj} tip={toast.tip} onClose={closeToast} />}
      <div style={{ 
        textAlign: "center", 
        marginTop: "100px",
        fontSize: "20px" 
      }}>
        <h2>✅ Autentificare reușită!</h2>
        <p>Se redirecționează către pagina principală...</p>
      </div>
    </>
  );
}