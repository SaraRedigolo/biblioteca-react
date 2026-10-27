import { useState, useEffect } from "react";
import {
    FaPlus,
    FaTrash,
    FaEdit,
    FaEye,
    FaEyeSlash,
    FaChevronDown,
    FaSearch,
    FaUserCircle,
    FaCamera,
    FaTimes,
    FaIdCard,
} from "react-icons/fa";

function Funcionarios() {
    const [nome, setNome] = useState("");
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [cargo, setCargo] = useState("bibliotecario");
    const [foto, setFoto] = useState("");
    const [cpf, setCpf] = useState("");
    const [celular, setCelular] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");

    const [editandoId, setEditandoId] = useState(null);
    const [mensagem, setMensagem] = useState("");
    const [pesquisa, setPesquisa] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);

    const [funcionarios, setFuncionarios] = useState(() => {
        const dados = localStorage.getItem("funcionarios");
        return dados ? JSON.parse(dados) : [];
    });

    // Usuário atualmente logado (salvo pelo Login.jsx em chaves separadas)
    const nomeLogado = localStorage.getItem("usuario");

    useEffect(() => {
        localStorage.setItem("funcionarios", JSON.stringify(funcionarios));
    }, [funcionarios]);

    useEffect(() => {
        if (mensagem) {
            const timer = setTimeout(() => setMensagem(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [mensagem]);

    // Fecha o modal com a tecla Esc
    useEffect(() => {
        if (!funcionarioSelecionado) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") setFuncionarioSelecionado(null);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [funcionarioSelecionado]);

    const handleFotoChange = (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        if (!arquivo.type.startsWith("image/")) {
            alert("Selecione um arquivo de imagem válido.");
            return;
        }

        if (arquivo.size > 2 * 1024 * 1024) {
            alert("A imagem deve ter no máximo 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setFoto(reader.result);
        reader.readAsDataURL(arquivo);
    };

    const limparFormulario = () => {
        setNome("");
        setUsuario("");
        setSenha("");
        setConfirmarSenha("");
        setCargo("bibliotecario");
        setFoto("");
        setCpf("");
        setCelular("");
        setDataNascimento("");
    };

    const adicionarFuncionario = () => {
        if (!nome || !usuario || !senha) {
            alert("Preencha todos os campos!");
            return;
        }

        if (senha !== confirmarSenha) {
            alert("As senhas não coincidem.");
            return;
        }

        const existe = funcionarios.find(
            (f) => f.usuario === usuario && f.id !== editandoId
        );

        if (existe) {
            alert("Este usuário já existe.");
            return;
        }

        if (editandoId) {
            setFuncionarios(
                funcionarios.map((f) =>
                    f.id === editandoId
                        ? {
                            ...f,
                            nome,
                            usuario,
                            senha,
                            cpf,
                            celular,
                            dataNascimento,
                            cargo,
                            foto,
                        }
                        : f
                )
            );

            setMensagem("Funcionário atualizado!");
            setEditandoId(null);
        } else {
            setFuncionarios([
                ...funcionarios,
                {
                    id: Date.now(),
                    nome,
                    usuario,
                    senha,
                    cpf,
                    celular,
                    dataNascimento,
                    cargo,
                    foto,
                    criadoEm: new Date().toLocaleDateString("pt-BR"),
                },
            ]);

            setMensagem("Funcionário cadastrado!");
        }

        limparFormulario();
    };

    const cancelarEdicao = () => {
        setEditandoId(null);
        limparFormulario();
        setMensagem("Edição cancelada.");
    };

    const excluirFuncionario = (e, id) => {
        e.stopPropagation();

        const alvo = funcionarios.find((f) => f.id === id);
        const ehProprioUsuario = alvo && alvo.nome === nomeLogado;

        if (ehProprioUsuario) {
            alert("Você não pode excluir a sua própria conta.");
            return;
        }

        if (!window.confirm("Deseja excluir este funcionário?")) return;

        setFuncionarios(funcionarios.filter((f) => f.id !== id));
        setMensagem("Funcionário excluído com sucesso!");
    };

    const editarFuncionario = (e, funcionario) => {
        e.stopPropagation();

        if (!window.confirm("Deseja editar este funcionário?")) return;

        setNome(funcionario.nome);
        setUsuario(funcionario.usuario);
        setSenha(funcionario.senha);
        setConfirmarSenha(funcionario.senha);
        setCargo(funcionario.cargo);
        setFoto(funcionario.foto || "");
        setCpf(funcionario.cpf || "");
        setCelular(funcionario.celular || "");
        setDataNascimento(funcionario.dataNascimento || "");

        setEditandoId(funcionario.id);

        setMensagem("Editando funcionário...");
    };

    const inputClass =
        "w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-3 shadow-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:ring-opacity-40 focus:outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-400";

    // Filtra funcionários pelo nome, usuário ou cargo, ignorando maiúsculas/minúsculas
    const funcionariosFiltrados = funcionarios.filter((f) => {
        const termo = pesquisa.trim().toLowerCase();
        if (!termo) return true;

        return (
            f.nome.toLowerCase().includes(termo) ||
            f.usuario.toLowerCase().includes(termo) ||
            f.cargo.toLowerCase().includes(termo)
        );
    });

    const corCargo = (c) =>
        c === "admin"
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400";

    return (
        <div>
            <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
                Funcionários
            </h1>

            {mensagem && (
                <div className="mb-4 px-4 py-3 rounded-xl border bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 transition">
                    {mensagem}
                </div>
            )}

            {/* Formulário */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-5">
                    {editandoId ? "Editar funcionário" : "Novo funcionário"}
                </h2>

                <div className="flex flex-col items-center mb-6">
                    <label htmlFor="foto-upload" className="relative cursor-pointer group">
                        {foto ? (
                            <img
                                src={foto}
                                alt="Prévia da foto de perfil"
                                className="w-24 h-24 rounded-full object-cover border-2 border-violet-500"
                            />
                        ) : (
                            <FaUserCircle className="w-24 h-24 text-gray-300 dark:text-gray-600" />
                        )}

                        <span className="absolute bottom-0 right-0 bg-violet-600 group-hover:bg-violet-700 text-white p-2 rounded-full shadow-sm transition">
                            <FaCamera size={14} />
                        </span>
                    </label>

                    <input
                        id="foto-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                        className="hidden"
                    />

                    {foto && (
                        <button
                            type="button"
                            onClick={() => setFoto("")}
                            className="text-sm text-red-500 hover:text-red-600 mt-2"
                        >
                            Remover foto
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className={inputClass}
                    />

                    <input
                        type="text"
                        placeholder="Usuário"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        className={inputClass}
                    />

                    <input
                        type="text"
                        placeholder="CPF"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        className={inputClass}
                    />

                    <input
                        type="text"
                        placeholder="Celular"
                        value={celular}
                        onChange={(e) => setCelular(e.target.value)}
                        className={inputClass}
                    />

                    <input
                        type="date"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        className={`${inputClass} dark:[color-scheme:dark]`}
                    />

                    <div className="relative">
                        <input
                            type={mostrarSenha ? "text" : "password"}
                            placeholder="Senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className={`${inputClass} pr-11`}
                        />
                        <button
                            type="button"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            tabIndex={-1}
                        >
                            {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            type={mostrarConfirmarSenha ? "text" : "password"}
                            placeholder="Confirmar senha"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            className={`${inputClass} pr-11`}
                        />
                        <button
                            type="button"
                            onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            tabIndex={-1}
                        >
                            {mostrarConfirmarSenha ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <div className="relative">
                        <select
                            value={cargo}
                            onChange={(e) => setCargo(e.target.value)}
                            className={`${inputClass} appearance-none pr-12 cursor-pointer`}
                        >
                            <option value="bibliotecario">Bibliotecário</option>
                            <option value="admin">Administrador</option>
                        </select>

                        <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 pointer-events-none" />
                    </div>
                </div>

                <div className="flex gap-3 mt-5">
                    <button
                        onClick={adicionarFuncionario}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition shadow-sm"
                    >
                        <FaPlus />
                        {editandoId ? "Salvar Alterações" : "Adicionar Funcionário"}
                    </button>

                    {editandoId && (
                        <button
                            onClick={cancelarEdicao}
                            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-white px-4 py-3 rounded-xl transition"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </div>

            {/* Busca */}
            <div className="relative mb-4">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300" />
                <input
                    type="text"
                    placeholder="Pesquisar por nome, usuário ou cargo..."
                    value={pesquisa}
                    onChange={(e) => setPesquisa(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white pl-11 pr-3 py-3 shadow-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:ring-opacity-40 focus:outline-none transition"
                />
            </div>

            {/* Tabela */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase text-xs tracking-wide">
                        <tr>
                            <th className="p-4 text-left">Foto</th>
                            <th className="p-4 text-left">Nome</th>
                            <th className="p-4 text-left">Usuário</th>
                            <th className="p-4 text-left">Cargo</th>
                            <th className="p-4 text-left">CPF</th>
                            <th className="p-4 text-left">Celular</th>
                            <th className="p-4 text-left">Criado em</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {funcionariosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="p-10 text-center text-gray-400 dark:text-gray-500">
                                    <FaIdCard className="mx-auto mb-2" size={28} />
                                    Nenhum funcionário encontrado.
                                </td>
                            </tr>
                        ) : (
                            funcionariosFiltrados.map((f) => (
                                <tr
                                    key={f.id}
                                    onClick={() => setFuncionarioSelecionado(f)}
                                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-700/40 cursor-pointer transition"
                                >
                                    <td className="p-4">
                                        {f.foto ? (
                                            <img
                                                src={f.foto}
                                                alt={f.nome}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <FaUserCircle className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                        )}
                                    </td>

                                    <td className="p-4 text-gray-800 dark:text-gray-100 font-medium">
                                        {f.nome}
                                    </td>

                                    <td className="p-4 text-gray-700 dark:text-gray-300">{f.usuario}</td>

                                    <td className="p-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${corCargo(f.cargo)}`}
                                        >
                                            {f.cargo}
                                        </span>
                                    </td>

                                    <td className="p-4 text-gray-700 dark:text-gray-300">{f.cpf || "-"}</td>

                                    <td className="p-4 text-gray-700 dark:text-gray-300">{f.celular || "-"}</td>

                                    <td className="p-4 text-gray-600 dark:text-gray-300">{f.criadoEm}</td>

                                    <td className="p-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={(e) => editarFuncionario(e, f)}
                                                className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition"
                                            >
                                                <FaEdit />
                                                <span className="hidden sm:inline">Editar</span>
                                            </button>

                                            <button
                                                onClick={(e) => excluirFuncionario(e, f.id)}
                                                disabled={f.nome === nomeLogado}
                                                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition"
                                            >
                                                <FaTrash />
                                                <span className="hidden sm:inline">Excluir</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal — fora da tabela, único, e com stopPropagation para não reabrir sozinho */}
            {funcionarioSelecionado && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setFuncionarioSelecionado(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl w-[650px] max-w-full shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                Informações do Funcionário
                            </h2>

                            <button
                                onClick={() => setFuncionarioSelecionado(null)}
                                className="text-gray-500 hover:text-red-500 transition p-2 -m-2 rounded-lg"
                                aria-label="Fechar"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex flex-col items-center mb-6">
                                {funcionarioSelecionado.foto ? (
                                    <img
                                        src={funcionarioSelecionado.foto}
                                        alt={funcionarioSelecionado.nome}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-violet-500"
                                    />
                                ) : (
                                    <FaUserCircle className="w-32 h-32 text-gray-300 dark:text-gray-600" />
                                )}

                                <h3 className="text-2xl font-bold mt-4 text-gray-800 dark:text-white">
                                    {funcionarioSelecionado.nome}
                                </h3>

                                <span
                                    className={`mt-1 px-3 py-1 rounded-full text-xs font-semibold capitalize ${corCargo(funcionarioSelecionado.cargo)}`}
                                >
                                    {funcionarioSelecionado.cargo}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <p className="text-gray-500 text-sm">Usuário</p>
                                    <p className="font-semibold dark:text-white">
                                        {funcionarioSelecionado.usuario}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">CPF</p>
                                    <p className="font-semibold dark:text-white">
                                        {funcionarioSelecionado.cpf || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Celular</p>
                                    <p className="font-semibold dark:text-white">
                                        {funcionarioSelecionado.celular || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Nascimento</p>
                                    <p className="font-semibold dark:text-white">
                                        {funcionarioSelecionado.dataNascimento || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Criado em</p>
                                    <p className="font-semibold dark:text-white">
                                        {funcionarioSelecionado.criadoEm}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setFuncionarioSelecionado(null)}
                                className="mt-8 w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl transition"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Funcionarios;