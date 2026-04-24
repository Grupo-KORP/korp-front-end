import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo-tnd.webp";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const menu = [
    { name: "HOME", path: "/" },
    { name: "VENDEDORES", path: "/vendedores" },
    { name: "COMISSÕES", path: "/comissoes" },
  ];

  function toggleDark() {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark");
  }

  return (
    <>
      <nav className="flex items-center justify-between px-8 py-4 rounded-2xl mx-6 mt-4 shadow-lg"
        style={{ background: "linear-gradient(135deg, #0f2557 0%, #1a3a7a 60%, #1e4d9b 100%)" }}>

        <div className="flex items-center">
          <img src={logo} alt="TND Brasil" className="h-10 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-8">
          {menu.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`text-sm font-semibold tracking-widest transition-colors duration-200 pb-1 ${
                pathname === item.path
                  ? "text-white border-b-2 border-white"
                  : "text-blue-200 hover:text-white border-b-2 border-transparent"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            className="w-9 h-9 flex items-center justify-center rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label="Alternar tema"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-blue-200 hover:text-white hover:bg-white/20 transition-all duration-200"
            aria-label="Sair"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </nav>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-80 flex flex-col items-center gap-6">
            <p className="text-gray-800 font-semibold text-lg text-center">Deseja sair da plataforma?</p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => navigate("/login")}
                className="flex-1 py-2.5 rounded-xl bg-brand-blue text-white font-semibold hover:bg-brand-blue-dark transition-colors"
              >
                Sim
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}