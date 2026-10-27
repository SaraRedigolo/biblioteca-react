import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaCheck, FaCoins } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";

// ---- Configuração do sistema de multas ----
const PRAZO_DIAS = 7; // dias permitidos antes de gerar multa
const VALOR_MULTA_POR_DIA = 1.5; // valor em R$ por dia de atraso
const DIA_MS = 24 * 60 * 60 * 1000;

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Calcula quantos dias um empréstimo está (ou ficou) em atraso.
// Usa a data de devolução se já foi devolvido, ou "agora" se ainda está emprestado.
function calcularDataLimite(emprestimo) {
  const inicio = emprestimo.dataEmprestimoTimestamp;
  if (!inicio) return null;
  const prazo = Number(emprestimo.prazoDias) || PRAZO_DIAS;
  return inicio + prazo * DIA_MS;
}

function diasEmAtraso(emprestimo) {
  const limite = calcularDataLimite(emprestimo);
  if (!limite) return 0;
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

function Emprestimos() {
  const [usuario, setUsuario] = useState("");
  const [livro, setLivro] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [prazoDias, setPrazoDias] = useState(PRAZO_DIAS);
  const [usuarios, setUsuarios] = useState([]);
  const [livros, setLivros] = useState([]);
  const [somenteMultaPendente, setSomenteMultaPendente] = useState(false);

  const [emprestimos, setEmprestimos] = useState(() => {
    const dados = localStorage.getItem("emprestimos");
    return dados ? JSON.parse(dados) : [];
  });

  useEffect(() => {
    setUsuarios(JSON.parse(localStorage.getItem("usuarios")) || []);
    setLivros(JSON.parse(localStorage.getItem("livros")) || []);
  }, []);

  useEffect(() => { localStorage.setItem("emprestimos", JSON.stringify(emprestimos)); }, [emprestimos]);

  useEffect(() => {
    if (mensagem) { const t = setTimeout(() => setMensagem(""), 4000); return () => clearTimeout(t); }
  }, [mensagem]);

  const calcularDisponiveis = (livroId, ignorarEmprestimoId = null) => {
    const livroEncontrado = livros.find((l) => l.id === livroId);
    if (!livroEncontrado) return 0;
    const emprestados = emprestimos
      .filter((emp) => emp.livroId === livroId && emp.status === "Emprestado" && emp.id !== ignorarEmprestimoId)
      .reduce((total, emp) => total + Number(emp.quantidade || 1), 0);
    return Number(livroEncontrado.quantidade || 0) - emprestados;
  };

  const registrarEmprestimo = () => {
    if (!usuario || !livro) { setMensagem("Selecione um usuário e um livro."); return; }
    if (quantidade <= 0) { setMensagem("Informe uma quantidade válida."); return; }
    if (prazoDias <= 0) { setMensagem("Informe um prazo de devolução válido."); return; }
    const livroSelecionado = livros.find((l) => l.id === Number(livro));
    if (!livroSelecionado) { setMensagem("Livro não encontrado."); return; }
    const disponiveis = calcularDisponiveis(livroSelecionado.id, editandoId || null);
    if (quantidade > disponiveis) { setMensagem(`Existem apenas ${disponiveis} exemplar(es) disponível(is).`); return; }

    if (editandoId) {
      setEmprestimos(emprestimos.map((emp) => emp.id === editandoId
        ? { ...emp, usuario, livroId: livroSelecionado.id, livro: livroSelecionado.titulo, quantidade: Number(quantidade), prazoDias: Number(prazoDias) }
        : emp));
      setEditandoId(null);
      setMensagem("Empréstimo atualizado!");
    } else {
      const agora = Date.now();

      setEmprestimos([...emprestimos, {
        id: agora,
        usuario,
        livroId: livroSelecionado.id,
        livro: livroSelecionado.titulo,
        quantidade: Number(quantidade),

        dataEmprestimoTimestamp: agora, // 🔥 ESSENCIAL

        prazoDias: Number(prazoDias),
        status: "Emprestado",
        multaPaga: false,
      }]);
      setMensagem(`Empréstimo registrado com sucesso! Prazo de devolução: ${prazoDias} dias.`);
    }
    setUsuario(""); setLivro(""); setQuantidade(1); setPrazoDias(PRAZO_DIAS);
  };

  const editarEmprestimo = (emprestimo) => {
    if (!window.confirm(`Deseja editar o empréstimo do livro "${emprestimo.livro}"?`)) return;
    setUsuario(emprestimo.usuario); setLivro(String(emprestimo.livroId));
    setQuantidade(emprestimo.quantidade || 1); setEditandoId(emprestimo.id);
    setPrazoDias(emprestimo.prazoDias || PRAZO_DIAS);
    setMensagem("Editando empréstimo...");
  };

  const cancelarEdicao = () => {
    setEditandoId(null); setUsuario(""); setLivro(""); setQuantidade(1); setPrazoDias(PRAZO_DIAS);
    setMensagem("Edição cancelada.");
  };

  const excluirEmprestimo = (id) => {
    const emprestimo = emprestimos.find((emp) => emp.id === id);
    if (!emprestimo) return;
    if (emprestimo.status === "Emprestado") { setMensagem("Não é possível excluir um empréstimo ativo."); return; }
    if (calcularValorMulta(emprestimo) > 0 && !emprestimo.multaPaga) {
      setMensagem("Não é possível excluir: existe multa pendente para este empréstimo.");
      return;
    }
    if (!window.confirm("Deseja excluir?")) return;
    setEmprestimos(emprestimos.filter((emp) => emp.id !== id));
    setMensagem("Empréstimo excluído!");
  };

  const devolverLivro = (id) => {
    const agora = Date.now();
    const emprestimoAtual = emprestimos.find((emp) => emp.id === id);
    if (!emprestimoAtual) return;

    const atraso = diasEmAtraso({ ...emprestimoAtual, status: "Devolvido", dataDevolucaoTimestamp: agora });

    setEmprestimos(emprestimos.map((emp) => emp.id === id
      ? {
        ...emp,
        status: "Devolvido",
        dataDevolucaoTimestamp: agora,
        dataDevolucao: new Date(agora).toLocaleDateString("pt-BR"),
      }
      : emp));

    if (atraso > 0) {
      setMensagem(`Livro devolvido com ${atraso} dia(s) de atraso. Multa gerada: ${formatarMoeda(atraso * VALOR_MULTA_POR_DIA)}`);
    } else {
      setMensagem("Livro devolvido com sucesso, sem atraso!");
    }
  };

  const pagarMulta = (id) => {
    const emprestimo = emprestimos.find((emp) => emp.id === id);
    if (!emprestimo) return;
    if (!window.confirm(`Confirmar pagamento de ${formatarMoeda(calcularValorMulta(emprestimo))} referente à multa?`)) return;
    setEmprestimos(emprestimos.map((emp) => emp.id === id ? { ...emp, multaPaga: true } : emp));
    setMensagem("Multa marcada como paga!");
  };

  const [searchParams] = useSearchParams();
  const [filtro, setFiltro] = useState(searchParams.get("status") || "Todos");
  useEffect(() => { setFiltro(searchParams.get("status") || "Todos"); }, [searchParams]);
  useEffect(() => { setSomenteMultaPendente(searchParams.get("multa") === "pendente"); }, [searchParams]);

  const emprestimosFiltrados = emprestimos.filter((emp) => {
    const pesquisaMatch = emp.usuario.toLowerCase().includes(pesquisa.toLowerCase()) || emp.livro.toLowerCase().includes(pesquisa.toLowerCase());
    const statusMatch = filtro === "Todos" ? true : emp.status === filtro;
    const multaMatch = somenteMultaPendente ? (calcularValorMulta(emp) > 0 && !emp.multaPaga) : true;
    return pesquisaMatch && statusMatch && multaMatch;
  });

  const totalMultasPendentes = emprestimos
    .filter((emp) => calcularValorMulta(emp) > 0 && !emp.multaPaga)
    .reduce((total, emp) => total + calcularValorMulta(emp), 0);

  const quantidadeEmAtraso = emprestimos.filter((emp) => diasEmAtraso(emp) > 0 && !emp.multaPaga).length;

  const inputClass =
    "w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none";
  return (
    <div>

      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Empréstimos</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Gerencie os empréstimos da biblioteca.</p>
        </div>

        {mensagem && (
          <div className={`mb-4 px-4 py-3 rounded-xl border ${mensagem.toLowerCase().includes("não") || mensagem.toLowerCase().includes("atraso") || mensagem.toLowerCase().includes("multa")
            ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400"
            : mensagem.toLowerCase().includes("editando") || mensagem.toLowerCase().includes("cancelada")
              ? "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400"
              : "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
            }`}>{mensagem}</div>
        )}

        {/* Resumo de multas */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border dark:border-gray-700 flex items-center gap-4">
            <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl">
              <FaCoins size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total de multas pendentes</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatarMoeda(totalMultasPendentes)}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border dark:border-gray-700 flex items-center gap-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 p-3 rounded-xl">
              <FaCoins size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Empréstimos com multa pendente</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{quantidadeEmAtraso}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{editandoId ? "Editar Empréstimo" : "Novo Empréstimo"}</h2>
          <div className="grid md:grid-cols-6 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">Usuário</label>
              <select
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className={`${inputClass} pr-10`}
              >
                <option value="">Selecione um usuário</option>
                {usuarios.map((u) => <option key={u.id} value={u.nome}>{u.nome}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">Livro</label>
              <select
                value={livro}
                onChange={(e) => setLivro(e.target.value)}
                className={`${inputClass} pr-10`}
              >
                <option value="">Selecione um livro</option>
                {livros.map((l) => {
                  const disponiveis = calcularDisponiveis(l.id, editandoId);
                  return (
                    <option key={l.id} value={l.id} disabled={disponiveis <= 0}>
                      {l.titulo} ({disponiveis} disponíve{disponiveis === 1 ? "l" : "is"})
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">Quantidade</label>
              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                placeholder="Ex: 1"
                className={`${inputClass} appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">Prazo (dias)</label>
              <input
                type="number"
                min="1"
                value={prazoDias}
                onChange={(e) => setPrazoDias(Number(e.target.value))}
                placeholder={`Padrão: ${PRAZO_DIAS}`}
                className={`${inputClass} appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              />
            </div>
            <div className="flex flex-col gap-1 justify-end">
              <button onClick={registrarEmprestimo} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl p-3 flex items-center justify-center gap-2">
                <FaPlus /> {editandoId ? "Salvar Alterações" : "Registrar"}
              </button>
            </div>
            {editandoId && (
              <div className="flex flex-col gap-1 justify-end">
                <button onClick={cancelarEdicao} className="bg-gray-500 hover:bg-gray-600 text-white rounded-xl p-3">Cancelar</button>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            Prazo padrão: {PRAZO_DIAS} dias (ajustável por empréstimo). Multa de {formatarMoeda(VALOR_MULTA_POR_DIA)} por dia de atraso.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border dark:border-gray-700 mb-4">
          <input type="text" placeholder="Pesquisar por usuário, livro ou status..." value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} className={`w-full ${inputClass}`} />
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">{emprestimosFiltrados.length} empréstimo(s) encontrado(s)</p>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={somenteMultaPendente}
                onChange={(e) => setSomenteMultaPendente(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-violet-500"
              />
              Somente com multa pendente
            </label>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="p-4 text-left">Usuário</th>
                <th className="p-4 text-left">Livro</th>
                <th className="p-4 text-center">Quantidade</th>
                <th className="p-4 text-left">Data</th>
                <th className="p-4 text-left">Data limite</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Disponível</th>
                <th className="p-4 text-left">Multa</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {emprestimosFiltrados.length === 0 ? (
                <tr><td colSpan="9" className="text-center p-8 text-gray-500 dark:text-gray-400">Nenhum empréstimo encontrado.</td></tr>
              ) : (
                emprestimosFiltrados.map((emprestimo) => {
                  const atraso = diasEmAtraso(emprestimo);
                  const valorMulta = calcularValorMulta(emprestimo);
                  const multaPendente = valorMulta > 0 && !emprestimo.multaPaga;
                  const dataLimite = calcularDataLimite(emprestimo);
                  return (
                    <tr key={emprestimo.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-4 text-gray-800 dark:text-gray-200">{emprestimo.usuario}</td>
                      <td className="p-4 text-gray-800 dark:text-gray-200">{emprestimo.livro}</td>
                      <td className="p-4 text-center text-gray-800 dark:text-gray-200">{emprestimo.quantidade}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">{emprestimo.data}</td>
                      <td className={`p-4 ${atraso > 0 && emprestimo.status === "Emprestado" ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-300"}`}>
                        {dataLimite ? new Date(dataLimite).toLocaleDateString("pt-BR") : "-"}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${emprestimo.status === "Devolvido"
                          ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                          : atraso > 0
                            ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400"
                            : "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400"}`}>
                          {emprestimo.status === "Emprestado" && atraso > 0 ? `Em atraso (${atraso}d)` : emprestimo.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-800 dark:text-gray-200">
                        {(() => {
                          const livroEncontrado = livros.find((l) => l.id === emprestimo.livroId);
                          if (!livroEncontrado) return "-";
                          const emprestados = emprestimos.filter((emp) => emp.livroId === emprestimo.livroId && emp.status === "Emprestado").reduce((total, emp) => total + Number(emp.quantidade || 1), 0);
                          return Math.max(0, Number(livroEncontrado.quantidade || 0) - emprestados);
                        })()}
                      </td>
                      <td className="p-4">
                        {valorMulta > 0 ? (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${emprestimo.multaPaga
                            ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400"}`}>
                            {formatarMoeda(valorMulta)} {emprestimo.multaPaga ? "· Paga" : "· Pendente"}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2 flex-wrap">
                          <button onClick={() => editarEmprestimo(emprestimo)} title="Editar empréstimo"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                            <FaEdit /><span className="hidden sm:inline">Editar</span>
                          </button>
                          {emprestimo.status === "Emprestado" && (
                            <button onClick={() => devolverLivro(emprestimo.id)} title="Marcar como devolvido"
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                              <FaCheck /><span className="hidden sm:inline">Devolver</span>
                            </button>
                          )}
                          {multaPendente && (
                            <button onClick={() => pagarMulta(emprestimo.id)} title="Marcar multa como paga"
                              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                              <FaCoins /><span className="hidden sm:inline">Pagar Multa</span>
                            </button>
                          )}
                          <button onClick={() => excluirEmprestimo(emprestimo.id)} title="Excluir empréstimo"
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                            <FaTrash /><span className="hidden sm:inline">Excluir</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Emprestimos;