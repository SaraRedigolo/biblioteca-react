import { useEffect, useState } from "react";
import { FaBook, FaExchangeAlt, FaCheckCircle, FaEdit, FaSave, FaTimes } from "react-icons/fa";

function Estoque() {
  const [livros, setLivros] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [quantidade, setQuantidade] = useState(0);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    setLivros(JSON.parse(localStorage.getItem("livros")) || []);
    setEmprestimos(JSON.parse(localStorage.getItem("emprestimos")) || []);
  }, []);

  useEffect(() => {
    if (mensagem) { const t = setTimeout(() => setMensagem(""), 3000); return () => clearTimeout(t); }
  }, [mensagem]);

  const salvarQuantidade = (livroId) => {
    if (quantidade < 0) { setMensagem(" Quantidade não pode ser negativa."); return; }
    const atualizados = livros.map((l) => l.id === livroId ? { ...l, quantidade: Number(quantidade) } : l);
    setLivros(atualizados);
    localStorage.setItem("livros", JSON.stringify(atualizados));
    setEditandoId(null);
    setMensagem("Quantidade atualizada!");
  };

  const totalLivros = livros.reduce((acc, l) => acc + (l.quantidade || 0), 0);
  const totalEmprestados = livros.reduce((acc, l) => {
    const emp = emprestimos.filter((e) => e.livro === l.titulo && e.status === "Emprestado").length;
    return acc + emp;
  }, 0);
  const totalDisponiveis = totalLivros - totalEmprestados;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Estoque</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Controle de disponibilidade do acervo.</p>
      </div>

      {mensagem && (
        <div className={`mb-4 px-4 py-3 rounded-xl border ${
          mensagem.includes("")
            ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400"
            : "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
        }`}>{mensagem}</div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total no acervo", value: totalLivros, icon: <FaBook className="text-violet-600" />, bg: "bg-violet-100 dark:bg-violet-900/40" },
          { label: "Emprestados", value: totalEmprestados, icon: <FaExchangeAlt className="text-yellow-600" />, bg: "bg-yellow-100 dark:bg-yellow-900/40" },
          { label: "Disponíveis", value: totalDisponiveis, icon: <FaCheckCircle className="text-green-600" />, bg: "bg-green-100 dark:bg-green-900/40" },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border dark:border-gray-700 shadow-sm">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>{card.icon}</div>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <tr>
              <th className="text-left p-4">Livro</th>
              <th className="text-left p-4">Autor</th>
              <th className="text-center p-4">Total</th>
              <th className="text-center p-4">Emprestados</th>
              <th className="text-center p-4">Disponíveis</th>
              <th className="text-center p-4">Situação</th>
              <th className="text-center p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {livros.length === 0 ? (
              <tr><td colSpan="7" className="text-center p-8 text-gray-400 dark:text-gray-500 text-sm">Nenhum livro cadastrado.</td></tr>
            ) : (
              livros.map((livro) => {
                const emprestados = emprestimos.filter((e) => e.livroId === livro.id && e.status === "Emprestado").reduce((total, e) => total + Number(e.quantidade || 1), 0);
                const total = Number(livro.quantidade || 0);
                const disponiveis = total - emprestados;
                const esgotado = disponiveis <= 0;
                const baixo = disponiveis > 0 && disponiveis <= 2;

                return (
                  <tr key={livro.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-100">{livro.titulo}</td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{livro.autor}</td>
                    <td className="p-4 text-center">
                      {editandoId === livro.id ? (
                        <input type="number" min="0" value={quantidade} onChange={(e) => setQuantidade(e.target.value)}
                          className="w-16 text-center border dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                      ) : (
                        <span className="font-semibold text-gray-800 dark:text-gray-100">{total}</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-yellow-600 dark:text-yellow-400 font-medium">{emprestados}</td>
                    <td className="p-4 text-center font-semibold text-gray-800 dark:text-gray-100">{disponiveis}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        esgotado ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400"
                          : baixo ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400"
                            : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                      }`}>
                        {esgotado ? "Esgotado" : baixo ? "Estoque baixo" : "Disponível"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {editandoId === livro.id ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => salvarQuantidade(livro.id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg"><FaSave /></button>
                          <button onClick={() => setEditandoId(null)} className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded-lg"><FaTimes /></button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditandoId(livro.id); setQuantidade(livro.quantidade || 0); }}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg">
                          <FaEdit />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Estoque;