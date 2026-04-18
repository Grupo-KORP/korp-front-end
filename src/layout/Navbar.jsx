import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";
import logo from "../assets/logo-tnd.webp";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const menu = [
    { name: "HOME", path: "/" },
    { name: "CLIENTE", path: "/cliente" },
    { name: "DISTRIBUIDOR", path: "/distribuidor" },
    { name: "PRODUTOS", path: "/produtos" },
    { name: "ADICIONAR PEDIDO", path: "/pedido" },
  ];

  function handleLogout() {
    setShowModal(true);
  }

  function confirmLogout() {
    navigate("/login");
  }

  function toggleDark() {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark");
  }

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>

        <div className="menu">
          {menu.map((item) => (
            <span
              key={item.path}
              onClick={() => navigate(item.path)}
              className={pathname === item.path ? "active" : ""}
            >
              {item.name}
            </span>
          ))}
        </div>

        <div className="actions">
          <button onClick={toggleDark}>🌙</button>
          <button onClick={handleLogout}>🚪</button>
        </div>
      </nav>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Deseja sair?</p>
            <div className="modal-buttons">
              <button onClick={confirmLogout}>Sim</button>
              <button onClick={() => setShowModal(false)}>Não</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}