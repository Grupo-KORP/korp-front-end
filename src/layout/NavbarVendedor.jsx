import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from '../hooks/useAuth'
import "./NavbarVendedor.css";
import logo from "../assets/logo-tnd.webp";
import lua from "../assets/lua.png";
import logout from "../assets/logout.png";
import sun from "../assets/sun.png";
import { useDarkMode } from "../hooks/useDarkMode";

export default function NavbarVendedor() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { darkMode, toggleDark } = useDarkMode();
  const [showModal, setShowModal] = useState(false);

  const menu = [
    { name: "HOME", path: "/vendedores/home" },
    { name: "CLIENTE", path: "/vendedores/cliente" },
    { name: "DISTRIBUIDOR", path: "/vendedores/distribuidor" },
    { name: "PRODUTOS", path: "/vendedores/produtos" },
    { name: "ADICIONAR PEDIDO", path: "/vendedores/pedido" },
  ];

  const { sair } = useAuth()
  function handleLogout() {
    setShowModal(true);
  }

  async function confirmLogout() {
    await sair() 
    navigate("/login");
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
          <button onClick={toggleDark}>
            <img src={darkMode ? sun : lua} alt="Modo Escuro" />
          </button>
          <button onClick={handleLogout}>
            <img src={logout} alt="Sair" />
          </button>
        </div>
      </nav>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 7V5.5C9 4.67 9.67 4 10.5 4H17.5C18.33 4 19 4.67 19 5.5V18.5C19 19.33 18.33 20 17.5 20H10.5C9.67 20 9 19.33 9 18.5V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 12H4M4 12L7 9M4 12L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Deseja sair?</h2>
            <p className="modal-subtitle">Você será desconectado da sua conta.</p>
            <div className="modal-buttons">
              <button className="modal-btn modal-btn-primary" onClick={confirmLogout}>Sair</button>
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
