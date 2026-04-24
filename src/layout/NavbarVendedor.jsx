import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./NavbarVendedor.css";
import logo from "../assets/logo-tnd.webp";
import lua from "../assets/lua.png";
import logout from "../assets/logout.png";
import sun from "../assets/sun.png";

export default function NavbarVendedor() {
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
    const newDark = !darkMode;
  setDarkMode(newDark);

  if (newDark) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
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