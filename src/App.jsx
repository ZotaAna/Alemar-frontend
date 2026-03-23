import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import LoginSuccess from "./pages/LoginSuccess";
import Produse from "./pages/Produse";
import Cos from "./pages/Cos";
import Comanda from "./pages/Comanda";
import Cont from "./pages/Cont";
import ComandaConfirmata from "./pages/ComandaConfirmata";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/cos" element={<Cos />} />
        <Route path="/produse" element={<Produse />} />
      <Route path="/comanda" element={<Comanda />} />
      <Route path="/cont" element={<Cont />} />
      <Route path="/comanda-confirmata" element={<ComandaConfirmata />} />
      </Routes>
    </Router>
  );
}

export default App;
