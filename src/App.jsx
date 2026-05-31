import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import LoginSuccess from "./pages/LoginSuccess";
import Produse from "./pages/Produse";
import Cos from "./pages/Cos";
import Comanda from "./pages/Comanda";
import Cont from "./pages/Cont";
import ComandaConfirmata from "./pages/ComandaConfirmata";
import VerifyEmail from "./pages/VerifyEmail";
import ProdusPagina from "./pages/ProdusPagina";
import ResetParola from "./pages/ResetParola";
import ProduseDama from "./pages/ProduseDama";
import ProduseBarbati from "./pages/ProduseBarbati";
import ProduseUnisex from "./pages/ProduseUnisex";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/cos" element={<Cos />} />
        <Route path="/produse" element={<Produse />} />
        <Route path="/produs/:slug" element={<ProdusPagina />} />
        <Route path="/comanda" element={<Comanda />} />
        <Route path="/cont" element={<Cont />} />
        <Route path="/comanda-confirmata" element={<ComandaConfirmata />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-parola" element={<ResetParola />} />
        <Route path="/produse/dama" element={<ProduseDama />} />
        <Route path="/produse/barbati" element={<ProduseBarbati />} />
        <Route path="/produse/unisex" element={<ProduseUnisex />} />
      </Routes>
    </Router>
  );
}

export default App;