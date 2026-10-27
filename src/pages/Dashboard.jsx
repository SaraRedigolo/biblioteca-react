import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaUsers, FaExchangeAlt, FaCheckCircle, FaArrowRight, FaChartBar, FaCoins, FaTrophy } from "react-icons/fa";

// ---- Configuração do sistema de multas (mantida igual à tela de Empréstimos) ----
const PRAZO_DIAS = 7; // dias permitidos antes de gerar multa
const VALOR_MULTA_POR_DIA = 1.5; // valor em R$ por dia de atraso
const DIA_MS = 24 * 60 * 60 * 1000;

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function diasEmAtraso(emprestimo) {
  const inicio = emprestimo.dataEmprestimoTimestamp;
  if (!inicio) return 0;
  const prazo = Number(emprestimo.prazoDias) || PRAZO_DIAS;
  const limite = inicio + prazo * DIA_MS;
  const referencia =
    emprestimo.status === "Devolvido"
      ? emprestimo.dataDevolucaoTimestamp || Date.now()
      : Date.now();
  const diferenca = referencia - limite;
  if (diferenca <= 0) return 0;
  return Math.ceil(diferenca / DIA_MS);
}

function calcularValorMulta(emprestimo) {
  return diasEmAtraso(emprestimo) * VALOR_MULTA_POR_DIA;
}

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalLivros: 0, totalUsuarios: 0, emprestimosAtivos: 0, devolvidos: 0 });
  const [recentes, setRecentes] = useState([]);
  const [grafico, setGrafico] = useState([]);
  const [taxaDevolucao, setTaxaDevolucao] = useState(0);
  const [totalMultasPendentes, setTotalMultasPendentes] = useState(0);
  const [emprestimosEmAtraso, setEmprestimosEmAtraso] = useState(0);
  const [rankingLivros, setRankingLivros] = useState([]);
  const [rankingUsuarios, setRankingUsuarios] = useState([]);

  useEffect(() => {
    const livros = JSON.parse(localStorage.getItem("livros")) || [];
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const emprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];
    const ativos = emprestimos.filter((e) => e.status === "Emprestado");
    const devolvidos = emprestimos.filter((e) => e.status === "Devolvido");
    setStats({ totalLivros: livros.length, totalUsuarios: usuarios.length, emprestimosAtivos: ativos.length, devolvidos: devolvidos.length });
    setRecentes([...emprestimos].reverse().slice(0, 5));
    setTaxaDevolucao(emprestimos.length > 0 ? Math.round((devolvidos.length / emprestimos.length) * 100) : 0);

    const pendentes = emprestimos.filter((e) => calcularValorMulta(e) > 0 && !e.multaPaga);
    setTotalMultasPendentes(pendentes.reduce((total, e) => total + calcularValorMulta(e), 0));
    setEmprestimosEmAtraso(pendentes.length);

    const contagemLivros = {};
    emprestimos.forEach((e) => {
      contagemLivros[e.livro] = (contagemLivros[e.livro] || 0) + Number(e.quantidade || 1);
    });
    const ranking = Object.entries(contagemLivros)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([livro, total]) => ({ livro, total }));
    setRankingLivros(ranking);

    const contagemUsuarios = {};
    emprestimos.forEach((e) => {
      contagemUsuarios[e.usuario] = (contagemUsuarios[e.usuario] || 0) + 1;
    });
    const rankingUsu = Object.entries(contagemUsuarios)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([usuario, total]) => ({ usuario, total }));
    setRankingUsuarios(rankingUsu);

    const hoje = new Date();
    const meses = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mes = d.toLocaleString("pt-BR", { month: "short" });
      const chave = `${d.getMonth() + 1}/${d.getFullYear()}`;
      const count = emprestimos.filter((e) => {
        if (!e.data) return false;
        const [, m, a] = e.data.split("/");
        return `${Number(m)}/${a}` === chave;
      }).length;
      meses.push({ label: mes, value: count });
    }
    setGrafico(meses);
  }, []);

  const maxGrafico = Math.max(...grafico.map((g) => g.value), 1);

  const cards = [
    { label: "Livros no acervo", value: stats.totalLivros, icon: <FaBook />, bg: "bg-violet-100 dark:bg-violet-900/40", color: "text-violet-600", rota: "/livros", detalhe: "cadastrados" },
    { label: "Usuários", value: stats.totalUsuarios, icon: <FaUsers />, bg: "bg-indigo-100 dark:bg-indigo-900/40", color: "text-indigo-600", rota: "/usuarios", detalhe: "cadastrados" },
    { label: "Empréstimos ativos", value: stats.emprestimosAtivos, icon: <FaExchangeAlt />, bg: "bg-yellow-100 dark:bg-yellow-900/40", color: "text-yellow-600", rota: "/emprestimos?status=Emprestado", detalhe: "em andamento" },
    { label: "Devolvidos", value: stats.devolvidos, icon: <FaCheckCircle />, bg: "bg-green-100 dark:bg-green-900/40", color: "text-green-600", rota: "/emprestimos?status=Devolvido", detalhe: "concluídos" },
    { label: "Multas pendentes", value: formatarMoeda(totalMultasPendentes), icon: <FaCoins />, bg: "bg-red-100 dark:bg-red-900/40", color: "text-red-600", rota: "/emprestimos", detalhe: `${emprestimosEmAtraso} empréstimo(s) em atraso` },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Visão geral do sistema BookHub.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        {cards.map((card) => (
          <div key={card.rota + card.label} onClick={() => navigate(card.rota)}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              {card.icon}
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{card.value}</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">{card.label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{card.detalhe}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <FaChartBar className="text-violet-500" />
            <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">Empréstimos nos últimos 6 meses</h2>
          </div>
          <div className="flex items-end gap-3 h-36">
            {grafico.map((item) => (
              <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.value > 0 ? item.value : ""}</span>
                <div className="w-full flex items-end justify-center">
                  <div
                    className="w-full bg-violet-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${Math.max((item.value / maxGrafico) * 112, item.value > 0 ? 8 : 4)}px`, opacity: item.value === 0 ? 0.15 : 1 }}
                  />
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm p-6 flex flex-col justify-between">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">Taxa de devolução</h2>
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${(taxaDevolucao / 100) * 251.2} 251.2`} className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{taxaDevolucao}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {stats.devolvidos} de {stats.devolvidos + stats.emprestimosAtivos} empréstimos devolvidos
            </p>
          </div>
          <button onClick={() => navigate("/emprestimos")}
            className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-medium transition-colors"
          >
            Ver empréstimos <FaArrowRight className="text-xs" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <FaTrophy className="text-amber-500" />
            <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">Livros mais emprestados</h2>
          </div>
          {rankingLivros.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhum empréstimo registrado ainda.</p>
          ) : (
            <div className="space-y-3">
              {rankingLivros.map((item, i) => {
                const maxRanking = rankingLivros[0].total;
                const medalha = ["bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
                  "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
                  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"][i] || "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400";
                return (
                  <div key={item.livro} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${medalha}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate pr-2">{item.livro}</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">{item.total} empréstimo{item.total === 1 ? "" : "s"}</p>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full transition-all duration-500"
                          style={{ width: `${(item.total / maxRanking) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <FaTrophy className="text-indigo-500" />
            <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">Usuários mais ativos</h2>
          </div>
          {rankingUsuarios.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhum empréstimo registrado ainda.</p>
          ) : (
            <div className="space-y-3">
              {rankingUsuarios.map((item, i) => {
                const maxRanking = rankingUsuarios[0].total;
                const medalha = ["bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
                  "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
                  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"][i] || "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400";
                return (
                  <div key={item.usuario} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${medalha}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate pr-2">{item.usuario}</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">{item.total} empréstimo{item.total === 1 ? "" : "s"}</p>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${(item.total / maxRanking) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>



      <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">Empréstimos recentes</h2>
          <button onClick={() => navigate("/emprestimos")}
            className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 font-medium flex items-center gap-1 transition-colors"
          >
            Ver todos <FaArrowRight className="text-xs" />
          </button>
        </div>
        {recentes.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Nenhum empréstimo registrado ainda.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3">Usuário</th>
                <th className="text-left px-6 py-3">Livro</th>
                <th className="text-left px-6 py-3">Data</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Multa</th>
              </tr>
            </thead>
            <tbody>
              {recentes.map((emp, i) => {
                const atraso = diasEmAtraso(emp);
                const valorMulta = calcularValorMulta(emp);
                return (
                  <tr key={emp.id} className={`border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/40 dark:bg-gray-700/20"}`}>
                    <td className="px-6 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{emp.usuario}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{emp.livro}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{emp.data}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.status === "Devolvido"
                        ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                        : atraso > 0
                          ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400"
                          : "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400"}`}>
                        {emp.status === "Emprestado" && atraso > 0 ? `Em atraso (${atraso}d)` : emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {valorMulta > 0 ? (
                        <span className={emp.multaPaga ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400 font-medium"}>
                          {formatarMoeda(valorMulta)}{emp.multaPaga ? " (paga)" : ""}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;