import { useEffect, useState, useMemo } from "react";
import { FaUser, FaTimes, FaBook, FaCoins, FaExchangeAlt, FaCheckCircle } from "react-icons/fa";

// ---- Configuração do sistema de multas (mesma usada nas telas de Empréstimos/Dashboard) ----
const PRAZO_DIAS = 7;
const VALOR_MULTA_POR_DIA = 1.5;
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

function UsuariosLista() {
  const [usuarios, setUsuarios] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [emprestimosUsuario, setEmprestimosUsuario] = useState([]);

  useEffect(() => {
    try {
      const dados = JSON.parse(localStorage.getItem("usuarios"));
      setUsuarios(Array.isArray(dados) ? dados : []);
    } catch { setUsuarios([]); }
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const termo = pesquisa.toLowerCase().trim();
    if (!termo) return usuarios;
    return usuarios.filter((usuario) =>
      [
        usuario.nome,
        usuario.email,
        usuario.cpf,
        usuario.telefone,
      ].filter(Boolean).some((campo) => campo.toLowerCase().includes(termo))
    );
  }, [usuarios, pesquisa]);

  const iniciais = (nome = "") =>
    nome.trim().split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

  const abrirHistorico = (usuario) => {
    let emprestimos = [];
    try {
      emprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];
    } catch { emprestimos = []; }
    const doUsuario = emprestimos
      .filter((e) => e.usuario === usuario.nome)
      .sort((a, b) => (b.dataEmprestimoTimestamp || 0) - (a.dataEmprestimoTimestamp || 0));
    setEmprestimosUsuario(doUsuario);
    setUsuarioSelecionado(usuario);
  };

  const fecharHistorico = () => {
    setUsuarioSelecionado(null);
    setEmprestimosUsuario([]);
  };

  const ativosUsuario = emprestimosUsuario.filter((e) => e.status === "Emprestado").length;
  const multasPendentesUsuario = emprestimosUsuario.filter((e) => calcularValorMulta(e) > 0 && !e.multaPaga);
  const totalMultasUsuario = multasPendentesUsuario.reduce((total, e) => total + calcularValorMulta(e), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Usuários</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Consulte todos os usuários cadastrados na biblioteca.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-4 mb-6">
        <input type="text" placeholder="Pesquisar por nome ou e-mail..." value={pesquisa} onChange={(e) => setPesquisa(e.target.value)}
          className="w-full border dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{usuariosFiltrados.length} usuário(s) encontrado(s)</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <tr>
              <th className="p-4 text-left">Usuário</th>
              <th className="p-4 text-left">E-mail</th>
              <th className="p-4 text-left">CPF</th>
              <th className="p-4 text-left">Celular</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-0">
                  <div className="flex flex-col items-center justify-center gap-2 p-10 text-gray-400 dark:text-gray-500">
                    <FaUser size={28} />
                    <span className="text-gray-500 dark:text-gray-400">Nenhum usuário encontrado.</span>
                  </div>
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((usuario, index) => (
                <tr
                  key={usuario.id}
                  onClick={() => abrirHistorico(usuario)}
                  title="Ver histórico de empréstimos"
                  className={`border-t dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors cursor-pointer ${index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/30"}`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-semibold flex items-center justify-center text-sm flex-shrink-0">
                        {iniciais(usuario.nome) || <FaUser size={14} />}
                      </div>

                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        {usuario.nome}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {usuario.email}
                  </td>

                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {usuario.cpf || "—"}
                  </td>

                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {usuario.telefone || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de histórico do usuário */}
      {usuarioSelecionado && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={fecharHistorico}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border dark:border-gray-700 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-semibold flex items-center justify-center text-sm flex-shrink-0">
                  {iniciais(usuarioSelecionado.nome) || <FaUser size={16} />}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">{usuarioSelecionado.nome}</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{usuarioSelecionado.email}</p>
                </div>
              </div>
              <button onClick={fecharHistorico} title="Fechar"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 transition flex-shrink-0">
                <FaTimes />
              </button>
            </div>

            <div className="px-6 py-4 grid grid-cols-3 gap-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{emprestimosUsuario.length}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Empréstimos</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{ativosUsuario}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Em andamento</p>
              </div>
              <div className="text-center">
                <p className={`text-xl font-bold ${totalMultasUsuario > 0 ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-100"}`}>
                  {formatarMoeda(totalMultasUsuario)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Multas pendentes</p>
              </div>
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-2">
              {emprestimosUsuario.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Nenhum empréstimo registrado para este usuário.</p>
              ) : (
                emprestimosUsuario.map((emp) => {
                  const atraso = diasEmAtraso(emp);
                  const valorMulta = calcularValorMulta(emp);
                  return (
                    <div key={emp.id} className="flex items-center gap-3 p-3 rounded-xl border dark:border-gray-700">
                      <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
                        <FaBook size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{emp.livro}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {emp.data}{emp.dataDevolucao ? ` → devolvido em ${emp.dataDevolucao}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.status === "Devolvido"
                          ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                          : atraso > 0
                            ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400"
                            : "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400"}`}>
                          {emp.status === "Devolvido" ? <FaCheckCircle size={10} /> : <FaExchangeAlt size={10} />}
                          {emp.status === "Emprestado" && atraso > 0 ? `Em atraso (${atraso}d)` : emp.status}
                        </span>
                        {valorMulta > 0 && (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${emp.multaPaga ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            <FaCoins size={10} /> {formatarMoeda(valorMulta)}{emp.multaPaga ? " (paga)" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsuariosLista;