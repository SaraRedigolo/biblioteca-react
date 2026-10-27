import { NavLink, Link, useLocation } from "react-router-dom";
import {
  FaBook, FaUsers, FaBoxes, FaExchangeAlt, FaChartPie,
  FaBookOpen, FaBars, FaTimes, FaChevronDown, FaHome,
  FaCoins, FaCog,
} from "react-icons/fa";
import { useState } from "react";
import { FaFileAlt } from "react-icons/fa";

const ITEM_BASE =
  "flex items-center gap-3 py-3 rounded-xl transition-all duration-200 w-full";
const ITEM_ACTIVE = "bg-violet-600 text-white shadow-sm";
const ITEM_INACTIVE =
  "text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-400";

function itemClasses(active, open) {
  return [
    ITEM_BASE,
    open ? "px-4" : "justify-center px-0",
    active ? ITEM_ACTIVE : ITEM_INACTIVE,
  ].join(" ");
}

// Item simples (rota direta), usado para Home, Dashboard, Estoque, etc.
function MenuLink({ to, end, icon: Icon, label, open }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={label}
      className={({ isActive }) => itemClasses(isActive, open)}
    >
      <Icon className="flex-shrink-0 text-lg" />
      {open && <span>{label}</span>}
    </NavLink>
  );
}

// Item com submenu (Livros, Usuários, Empréstimos)
function MenuGroup({ icon: Icon, label, active, expanded, onToggle, open, children }) {
  return (
    <div>
      <button
        onClick={onToggle}
        title={label}
        className={itemClasses(active, open)}
      >
        <Icon className="flex-shrink-0 text-lg" />
        {open && (
          <>
            <span className="flex-1 text-left">{label}</span>
            <FaChevronDown
              className={`text-xs transition-transform duration-200 ${expanded ? "rotate-180" : ""
                }`}
            />
          </>
        )}
      </button>

      {expanded && open && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-violet-100 dark:border-violet-900 pl-3">
          {children}
        </div>
      )}
    </div>
  );
}

// Sublink dentro de um MenuGroup
function SubLink({ to, label, icon = null, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${active
          ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-medium"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

// Botão de toggle do header (☰ / X) — mesmo visual do item ativo
function ToggleButton({ onClick, icon: Icon, size = "w-10 h-10" }) {
  return (
    <button
      onClick={onClick}
      className={`${size} flex items-center justify-center rounded-xl bg-violet-600 text-white shadow-md hover:bg-violet-700 transition`}
    >
      <Icon />
    </button>
  );
}

function Sidebar({ open, setOpen }) {
  const location = useLocation();
  const [abrirLivros, setAbrirLivros] = useState(false);
  const [abrirUsuarios, setAbrirUsuarios] = useState(false);
  const [abrirEmprestimos, setAbrirEmprestimos] = useState(false);

  const caminhoAtual = location.pathname + location.search;

  const livrosAtivo = location.pathname === "/livros" || location.pathname === "/acervo";
  const usuariosAtivo = location.pathname === "/usuarios" || location.pathname === "/lista-usuarios";
  const emprestimosAtivo =
    location.pathname === "/emprestimos" ||
    location.search.includes("status") ||
    location.search.includes("multa");

  const cargo = localStorage.getItem("cargo");

  const abrirGrupo = (setter, valorAtual) => {
    if (!open) {
      setOpen(true);
      setter(true);
    } else {
      setter(!valorAtual);
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-md transition-all duration-300 z-50 flex flex-col
      ${open ? "w-64" : "w-16"}`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 h-16">
        {open ? (
          <>
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-600 text-white flex items-center justify-center rounded-xl shadow-md">
                <FaBookOpen />
              </div>
              <div>
                <h1 className="font-bold text-gray-800 dark:text-gray-100">BookHub</h1>
                <p className="text-xs text-gray-400 dark:text-gray-500">Library</p>
              </div>
            </Link>

            <ToggleButton onClick={() => setOpen(false)} icon={FaTimes} size="w-9 h-9" />
          </>
        ) : (
          <ToggleButton onClick={() => setOpen(true)} icon={FaBars} />
        )}
      </div>

      {/* MENU */}
      <nav className="px-2 mt-4 space-y-1 flex-1 overflow-y-auto">
        <MenuLink to="/" end icon={FaHome} label="Home" open={open} />
        <MenuLink to="/dashboard" icon={FaChartPie} label="Dashboard" open={open} />

        <MenuGroup
          icon={FaBook}
          label="Livros"
          active={livrosAtivo}
          expanded={abrirLivros}
          onToggle={() => abrirGrupo(setAbrirLivros, abrirLivros)}
          open={open}
        >
          <SubLink to="/livros" label="Cadastrar / Gerenciar" active={caminhoAtual === "/livros"} />
          <SubLink to="/acervo" label="Acervo" active={caminhoAtual === "/acervo"} />
        </MenuGroup>

        <MenuGroup
          icon={FaUsers}
          label="Usuários"
          active={usuariosAtivo}
          expanded={abrirUsuarios}
          onToggle={() => abrirGrupo(setAbrirUsuarios, abrirUsuarios)}
          open={open}
        >
          <SubLink to="/usuarios" label="Gerenciar" active={caminhoAtual === "/usuarios"} />
          <SubLink to="/lista-usuarios" label="Lista de Usuários" active={caminhoAtual === "/lista-usuarios"} />
        </MenuGroup>

        {cargo === "admin" && (
          <MenuLink to="/funcionarios" icon={FaUsers} label="Funcionários" open={open} />
        )}

        <MenuLink to="/estoque" icon={FaBoxes} label="Estoque" open={open} />

        <MenuGroup
          icon={FaExchangeAlt}
          label="Empréstimos"
          active={emprestimosAtivo}
          expanded={abrirEmprestimos}
          onToggle={() => abrirGrupo(setAbrirEmprestimos, abrirEmprestimos)}
          open={open}
        >
          <SubLink to="/emprestimos" label="Todos" active={caminhoAtual === "/emprestimos"} />
          <SubLink
            to="/emprestimos?status=Emprestado"
            label="Emprestados"
            active={caminhoAtual === "/emprestimos?status=Emprestado"}
          />
          <SubLink
            to="/emprestimos?status=Devolvido"
            label="Devolvidos"
            active={caminhoAtual === "/emprestimos?status=Devolvido"}
          />
          <div className="my-1 border-t border-violet-100 dark:border-violet-900" />
          <SubLink
            to="/emprestimos?multa=pendente"
            label="Multas pendentes"
            icon={<FaCoins className="text-xs flex-shrink-0" />}
            active={caminhoAtual === "/emprestimos?multa=pendente"}
          />
        </MenuGroup>

        <MenuLink
          to="/relatorios"
          icon={FaFileAlt}
          label="Relatórios"
          open={open}
        />

        <MenuLink to="/configuracoes" icon={FaCog} label="Configurações" open={open} />
      </nav>
    </aside>
  );
}

export default Sidebar;