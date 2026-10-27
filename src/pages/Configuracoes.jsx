import { useNavigate } from "react-router-dom";
import { FaMoon, FaSun, FaSignOutAlt } from "react-icons/fa";

function Configuracoes({ darkMode, setDarkMode }) {
  const navigate = useNavigate();

  const sair = () => {
    localStorage.removeItem("logado");
    navigate("/login");
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
        Configurações
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6 space-y-6">

        {/* Modo Escuro */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-white">
              Tema
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Altere entre modo claro e escuro.
            </p>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-4 py-2 flex items-center gap-2"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
            {darkMode ? "Modo Claro" : "Modo Escuro"}
          </button>
        </div>

        <hr className="dark:border-gray-700" />

        {/* Logout */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-white">
              Sessão
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Encerrar a sessão atual.
            </p>
          </div>

          <button
            onClick={sair}
            className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-4 py-2 flex items-center gap-2"
          >
            <FaSignOutAlt />
            Sair
          </button>
        </div>

      </div>
    </div>
  );
}

export default Configuracoes;