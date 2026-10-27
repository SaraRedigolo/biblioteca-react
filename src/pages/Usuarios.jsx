import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaTimes, FaBook, FaCoins, FaExchangeAlt, FaCheckCircle, FaUser } from "react-icons/fa";

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

function iniciais(nome = "") {
  return nome.trim().split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function Usuarios() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erroEmail, setErroEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [emprestimosUsuario, setEmprestimosUsuario] = useState([]);

  const [usuarios, setUsuarios] = useState(() => {
    const s = localStorage.getItem("usuarios");
    return s ? JSON.parse(s) : [];
  });

  useEffect(() => { localStorage.setItem("usuarios", JSON.stringify(usuarios)); }, [usuarios]);
  useEffect(() => {
    if (mensagem) { const t = setTimeout(() => setMensagem(""), 3000); return () => clearTimeout(t); }
  }, [mensagem]);

  const adicionarUsuario = () => {
    if (
      !nome ||
      !email ||
      !cpf ||
      !telefone ||
      !usuario ||
      !senha ||
      !confirmarSenha
    ) {
      alert("Preencha todos os campos!");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErroEmail("Digite um e-mail válido.");
      return;
    }

    setErroEmail("");

    if (senha !== confirmarSenha) {
      setErroSenha("As senhas não coincidem.");
      return;
    }

    setErroSenha("");

    if (
      usuarios.some(
        (u) =>
          u.usuario === usuario &&
          u.id !== editandoId
      )
    ) {
      alert("Esse usuário já existe.");
      return;
    }

    if (
      usuarios.some(
        (u) =>
          u.cpf === cpf &&
          u.id !== editandoId
      )
    ) {
      alert("Esse CPF já está cadastrado.");
      return;
    }

    if (editandoId) {
      setUsuarios(
        usuarios.map((u) =>
          u.id === editandoId
            ? {
              ...u,
              nome,
              email,
              cpf,
              telefone,
              usuario,
              senha,
            }
            : u
        )
      );

      setEditandoId(null);
      setMensagem("Usuário atualizado com sucesso!");
    } else {
      setUsuarios([
        ...usuarios,
        {
          id: Date.now(),
          nome,
          email,
          cpf,
          telefone,
          usuario,
          senha,
          tipo: "cliente",
        },
      ]);

      setMensagem("Usuário cadastrado com sucesso!");
    }

    setNome("");
    setEmail("");
    setCpf("");
    setTelefone("");
    setUsuario("");
    setSenha("");
    setConfirmarSenha("");
  };

  const editarUsuario = (usuario) => {
    if (!window.confirm("Deseja editar este usuário?")) return;

    setNome(usuario.nome);
    setEmail(usuario.email);
    setCpf(usuario.cpf || "");
    setTelefone(usuario.telefone || "");
    setUsuario(usuario.usuario || "");
    setSenha(usuario.senha || "");
    setConfirmarSenha(usuario.senha || "");

    setEditandoId(usuario.id);
    setErroEmail("");
    setErroSenha("");
    setMensagem("Editando usuário...");
  };

  const cancelarEdicao = () => {
    setEditandoId(null);

    setNome("");
    setEmail("");
    setCpf("");
    setTelefone("");
    setUsuario("");
    setSenha("");
    setConfirmarSenha("");

    setErroEmail("");
    setErroSenha("");
    setMensagem("Edição cancelada.");
  };
  const excluirUsuario = (id) => {
    if (!window.confirm("Deseja excluir este usuário?")) return;
    setUsuarios(usuarios.filter((u) => u.id !== id));
    setMensagem("Usuário excluído com sucesso!");
    if (editandoId === id) { setEditandoId(null); setNome(""); setEmail(""); setErroEmail(""); }
  };

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

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
    u.email.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const inputClass = "border dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Usuários</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Gerencie os usuários cadastrados.</p>
      </div>

      {mensagem && (
        <div className={`mb-4 px-4 py-3 rounded-xl border ${mensagem.includes("cancelada") || mensagem.includes("excluído")
          ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400"
          : mensagem.includes("Editando")
            ? "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400"
            : "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
          }`}>{mensagem}</div>
      )}

      {editandoId && (
        <div className="mb-4 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400 px-4 py-3 rounded-xl">
          Você está editando um usuário.
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{editandoId ? "Editar Usuário" : "Adicionar Usuário"}</h2>
        <div className="grid md:grid-cols-4 gap-4 items-start">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">Nome</label>
            <input type="text" placeholder="Ex: João Silva" value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">E-mail</label>
            <input type="email" placeholder="Ex: joao@email.com" value={email}
              onChange={(e) => { setEmail(e.target.value); setErroEmail(""); }}
              className={`${inputClass} ${erroEmail ? "border-red-400 focus:ring-red-400" : ""}`} />
            {erroEmail && <p className="text-xs text-red-500 px-1">{erroEmail}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">
              CPF
            </label>

            <input
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">
              Celular
            </label>

            <input
              type="text"
              placeholder="(11) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">
              Usuário
            </label>

            <input
              type="text"
              placeholder="Login do cliente"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">
              Senha
            </label>

            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErroSenha(""); }}
              className={`${inputClass} ${erroSenha ? "border-red-400 focus:ring-red-400" : ""}`}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">
              Confirmar Senha
            </label>

            <input
              type="password"
              placeholder="Repita a senha"
              value={confirmarSenha}
              onChange={(e) => { setConfirmarSenha(e.target.value); setErroSenha(""); }}
              className={`${inputClass} ${erroSenha ? "border-red-400 focus:ring-red-400" : ""}`}
            />
            {erroSenha && <p className="text-xs text-red-500 px-1">{erroSenha}</p>}
          </div>

          <div className="flex gap-2 mt-5">
            <button onClick={adicionarUsuario} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl p-3 flex items-center justify-center gap-2">
              <FaPlus /> {editandoId ? "Salvar Alterações" : "Adicionar"}
            </button>
            {editandoId && (
              <button onClick={cancelarEdicao} className="bg-gray-500 hover:bg-gray-600 text-white rounded-xl p-3 px-4">Cancelar</button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border dark:border-gray-700 mb-4">
        <input type="text" placeholder="Pesquisar por nome ou e-mail..." value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} className={`w-full ${inputClass}`} />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{usuariosFiltrados.length} usuário(s) encontrado(s)</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <tr>
              <th className="text-left p-4">Nome</th>
              <th className="text-left p-4">E-mail</th>
              <th className="text-left p-4">CPF</th>
              <th className="text-left p-4">Celular</th>
              <th className="text-left p-4">Usuário</th>
              <th className="text-center p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <td colSpan="6" className="text-center p-8 text-gray-500 dark:text-gray-400">
                Nenhum usuário encontrado.
              </td>
            ) : (
              usuariosFiltrados.map((usuario, index) => (
                <tr
                  key={usuario.id}
                  onClick={() => abrirHistorico(usuario)}
                  title="Ver histórico de empréstimos"
                  className={`border-t dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 cursor-pointer transition-colors ${index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/30"}`}
                >
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-semibold flex items-center justify-center text-sm flex-shrink-0">
                        {iniciais(usuario.nome) || <FaUser size={14} />}
                      </div>
                      <span>{usuario.nome}</span>
                    </div>
                  </td>

                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {usuario.email}
                  </td>

                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {usuario.cpf}
                  </td>

                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {usuario.telefone}
                  </td>

                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {usuario.usuario}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); editarUsuario(usuario); }} title="Editar usuário"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                        <FaEdit /><span className="hidden sm:inline">Editar</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); excluirUsuario(usuario.id); }} title="Excluir usuário"
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                        <FaTrash /><span className="hidden sm:inline">Excluir</span>
                      </button>
                    </div>
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

export default Usuarios;