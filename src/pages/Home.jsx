import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaUsers, FaExchangeAlt, FaCheckCircle, FaArrowRight } from "react-icons/fa";

function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ livros: 0, usuarios: 0, emprestimosAtivos: 0, devolvidos: 0 });

  useEffect(() => {
    const livros = JSON.parse(localStorage.getItem("livros")) || [];
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const emprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];
    setStats({
      livros: livros.length,
      usuarios: usuarios.length,
      emprestimosAtivos: emprestimos.filter((e) => e.status === "Emprestado").length,
      devolvidos: emprestimos.filter((e) => e.status === "Devolvido").length,
    });
  }, []);

  const acoes = [
    { titulo: "Cadastrar livro", descricao: "Adicione um novo título ao acervo.", icone: <FaBook className="text-violet-600 text-2xl" />, bg: "bg-violet-50 dark:bg-violet-900/30", rota: "/livros" },
    { titulo: "Novo usuário", descricao: "Registre um leitor na biblioteca.", icone: <FaUsers className="text-indigo-600 text-2xl" />, bg: "bg-indigo-50 dark:bg-indigo-900/30", rota: "/usuarios" },
    { titulo: "Registrar empréstimo", descricao: "Associe um livro a um usuário.", icone: <FaExchangeAlt className="text-yellow-600 text-2xl" />, bg: "bg-yellow-50 dark:bg-yellow-900/30", rota: "/emprestimos" },
    { titulo: "Ver devoluções", descricao: "Acompanhe livros já devolvidos.", icone: <FaCheckCircle className="text-green-600 text-2xl" />, bg: "bg-green-50 dark:bg-green-900/30", rota: "/emprestimos?status=Devolvido" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 leading-tight">Bem-vindo ao BookHub</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-0.5">Sistema de gerenciamento de biblioteca</p>
        <div className="h-1 w-16 bg-violet-500 rounded-full mt-4" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { rota: "/acervo", value: stats.livros, label: "Livros", icon: <FaBook className="text-violet-600" />, bg: "bg-violet-100 dark:bg-violet-900/40" },
          { rota: "/lista-usuarios", value: stats.usuarios, label: "Usuários", icon: <FaUsers className="text-indigo-600" />, bg: "bg-indigo-100 dark:bg-indigo-900/40" },
          { rota: "/emprestimos?status=Emprestado", value: stats.emprestimosAtivos, label: "Emprestados", icon: <FaExchangeAlt className="text-yellow-600" />, bg: "bg-yellow-100 dark:bg-yellow-900/40" },
          { rota: "/emprestimos?status=Devolvido", value: stats.devolvidos, label: "Devolvidos", icon: <FaCheckCircle className="text-green-600" />, bg: "bg-green-100 dark:bg-green-900/40" },
        ].map((card) => (
          <div
            key={card.rota}
            onClick={() => navigate(card.rota)}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-2">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Ações rápidas</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {acoes.map((acao) => (
            <button
              key={acao.rota}
              onClick={() => navigate(acao.rota)}
              className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl p-5 flex items-center gap-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full group"
            >
              <div className={`w-12 h-12 ${acao.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {acao.icone}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-gray-100">{acao.titulo}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{acao.descricao}</p>
              </div>
              <FaArrowRight className="text-gray-300 dark:text-gray-600 group-hover:text-violet-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div
        className="
    mt-8 p-8 rounded-2xl transition-colors
    bg-gradient-to-r from-violet-600 to-indigo-500 text-white
    dark:bg-none dark:bg-gray-800 dark:border dark:border-gray-700
  "
      >
        <p className="text-xs uppercase tracking-widest text-violet-100 dark:text-violet-400 mb-2">
          BookHub • Library
        </p>

        <h2 className="text-2xl font-bold mb-2 text-white dark:text-gray-100">
          Tudo em um só lugar
        </h2>

        <p className="text-violet-100 dark:text-gray-400">
          Controle livros, usuários e empréstimos de forma simples e organizada.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="
      mt-6 px-5 py-2 rounded-xl font-medium transition
      bg-white text-violet-700 hover:bg-violet-100
      dark:bg-violet-600 dark:text-white dark:hover:bg-violet-700
    "
        >
          Ver Dashboard
        </button>
      </div>
    </div>
  );
}

export default Home;