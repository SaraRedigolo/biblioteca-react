import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBookOpen, FaHome, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function NavbarCliente() {
  const navigate = useNavigate();
  const location = useLocation();

  function sair() {
    localStorage.removeItem("logado");
    localStorage.removeItem("tipo");
    localStorage.removeItem("usuario");
    localStorage.removeItem("cargo");
    localStorage.removeItem("clienteId");

    navigate("/login");
  }

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const usuario = localStorage.getItem("usuario") || "";
  const iniciais = usuario
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "?";

  const links = [
    { to: "/area-cliente", label: "Minha Área", icon: FaHome },
    { to: "/acervo-cliente", label: "Acervo", icon: FaBookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-violet-800 via-violet-700 to-violet-800 shadow-lg shadow-violet-950/20 backdrop-blur">
      {/*
        Wrapper explícito de centralização: max-width fixo em px (não depende
        só da classe utilitária) + margin auto, garantindo que o conteúdo
        nunca vá até a borda da tela em monitores muito largos.
      */}
      <div
        className="flex items-center justify-between mx-auto w-full px-6 md:px-8 py-3.5"
        style={{ maxWidth: "1800px" }}
      >
        {/* Logo */}
        <Link to="/area-cliente" className="flex items-center gap-2 group shrink-0">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 text-white group-hover:bg-white/20 transition-colors">
            <FaBookOpen className="text-lg" />
          </span>
          <span className="text-xl font-bold text-white tracking-tight">
            BookHub
          </span>
        </Link>

        {/* Links + ações */}
        <div className="flex items-center gap-1.5">
          {links.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? "bg-white/15 text-white"
                    : "text-violet-100 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon className="text-base" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}

          <div className="w-px h-6 bg-white/20 mx-2" />

          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-violet-100 hover:bg-white/10 hover:text-white transition-colors"
          >
            {darkMode ? <FaSun className="text-base" /> : <FaMoon className="text-base" />}
          </button>

          {/* Avatar com iniciais do usuário logado */}
          <div
            title={usuario}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-white/15 text-white text-xs font-semibold ml-1"
          >
            {iniciais}
          </div>

          <button
            onClick={sair}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-violet-100 hover:bg-red-500/20 hover:text-red-200 transition-colors"
          >
            <FaSignOutAlt className="text-base" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
}