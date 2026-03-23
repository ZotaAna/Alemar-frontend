import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔵 LoginSuccess - Component mounted");
    
    const token = searchParams.get("token");
    console.log("🔵 Token primit:", token);
    
    if (!token) {
      console.log("❌ Nu am token, redirect la /login");
      navigate("/login", { replace: true });
      return;
    }

    try {
      // Decodifică JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("🔵 Payload decodat:", payload);
      
      const user = {
        id: payload.userId,
        email: payload.email,
        firstName: payload.firstName,  // 👈 adaugă
        lastName: payload.lastName,
        role: payload.role
      };
      
      // Salvează în localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("authToken", token);
      
      console.log("✅ User salvat în localStorage:", user);
      console.log("🔵 Navighez spre /home...");
      
      // Redirect cu replace pentru a preveni loop-ul
      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 1000);
      
    } catch (err) {
      console.error("❌ Eroare la procesare token:", err);
      alert("Eroare la autentificare!");
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      textAlign: "center", 
      marginTop: "100px",
      fontSize: "20px" 
    }}>
      <h2>✅ Autentificare reușită!</h2>
      <p>Se redirecționează către pagina principală...</p>
    </div>
  );
}