import { useState, useEffect } from "react";
import { FaTrash, FaPlus, FaEdit, FaBook } from "react-icons/fa";

function Livros() {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [capa, setCapa] = useState("");
  const [sinopse, setSinopse] = useState("");
  const [categoria, setCategoria] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");

  const [livros, setLivros] = useState(() => {
    const livrosSalvos = localStorage.getItem("livros");
    return livrosSalvos ? JSON.parse(livrosSalvos) : [];
  });

  useEffect(() => { localStorage.setItem("livros", JSON.stringify(livros)); }, [livros]);

  useEffect(() => {
    if (mensagem) {
      const timer = setTimeout(() => setMensagem(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  const adicionarLivro = () => {
    if (!titulo || !autor) {
      alert("Preencha todos os campos!");
      return;
    }

    if (editandoId) {
      if (!window.confirm("Deseja realmente salvar as alterações deste livro?"))
        return;

      setLivros(
        livros.map((livro) =>
          livro.id === editandoId
            ? {
              ...livro,
              titulo,
              autor,
              categoria,
              quantidade: Number(quantidade),
              capa,
              sinopse,
            }
            : livro
        )
      );

      setEditandoId(null);
      setMensagem("Livro atualizado com sucesso!");
    } else {
      setLivros([
        ...livros,
        {
          id: Date.now(),
          titulo,
          autor,
          categoria,
          quantidade: Number(quantidade),
          capa,
          sinopse,
        },
      ]);

      setMensagem("Livro cadastrado com sucesso!");
    }

    setTitulo("");
    setAutor("");
    setCategoria("");
    setQuantidade(1);
    setCapa("");
    setSinopse("");
  };

  const editarLivro = (livro) => {
    if (!window.confirm("Deseja editar este livro?")) return;

    setTitulo(livro.titulo);
    setAutor(livro.autor);
    setCategoria(livro.categoria || "");
    setQuantidade(livro.quantidade || 1);
    setCapa(livro.capa || "");
    setSinopse(livro.sinopse || "");

    setEditandoId(livro.id);
    setMensagem("Editando livro...");
  };

  const cancelarEdicao = () => {
    if (!window.confirm("Deseja realmente cancelar? As alterações não salvas serão perdidas.")) return;
    setEditandoId(null); setTitulo(""); setAutor(""); setQuantidade(1); setQuantidade(1); setCapa(""); setSinopse("");
    setMensagem("Edição cancelada.");
  };

  const excluirLivro = (id) => {
    const livro = livros.find((l) => l.id === id);
    if (!livro) return;
    const emprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];
    const emprestado = emprestimos.some((emp) => emp.livro?.toLowerCase().trim() === livro.titulo.toLowerCase().trim() && emp.status === "Emprestado");
    if (emprestado) { setMensagem("Este livro está emprestado e não pode ser excluído."); return; }
    if (!window.confirm("Deseja excluir?")) return;
    setLivros(livros.filter((l) => l.id !== id));
    setMensagem("Livro excluído!");
  };

  const livrosFiltrados = livros.filter((livro) =>
    livro.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
    livro.autor.toLowerCase().includes(pesquisa.toLowerCase()) ||
    (livro.categoria || "").toLowerCase().includes(pesquisa.toLowerCase())
  );

  const inputClass = "border dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Livros</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Gerencie o acervo da biblioteca.</p>
      </div>

      {mensagem && (
        <div className={`mb-4 px-4 py-3 rounded-xl border ${mensagem.includes("cancelada") || mensagem.includes("excluído") || mensagem.includes("emprestado")
          ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400"
          : mensagem.includes("Editando")
            ? "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400"
            : "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
          }`}>
          {mensagem}
        </div>
      )}

      {editandoId && (
        <div className="mb-4 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400 px-4 py-3 rounded-xl">
          Você está editando um livro.
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{editandoId ? "Editar Livro" : "Adicionar Livro"}</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">Título do livro</label>
            <input type="text" placeholder="Ex: Dom Casmurro" value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">Autor</label>
            <input type="text" placeholder="Ex: Machado de Assis" value={autor} onChange={(e) => setAutor(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">
              Categoria
            </label>

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={`${inputClass} pr-8`}
              style={{
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
              }}
            >
              <option value="">Selecione</option>
              <option value="Romance">Romance</option>
              <option value="Fantasia">Fantasia</option>
              <option value="Terror">Terror</option>
              <option value="Suspense">Suspense</option>
              <option value="Ficção Científica">Ficção Científica</option>
              <option value="Aventura">Aventura</option>
              <option value="Biografia">Biografia</option>
              <option value="História">História</option>
              <option value="Infantil">Infantil</option>
              <option value="Didático">Didático</option>
              <option value="Tecnologia">Tecnologia</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">Quantidade de exemplares</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={quantidade}
              onChange={(e) => {
                const valor = e.target.value.replace(/\D/g, "");
                setQuantidade(valor === "" ? "" : Number(valor));
              }}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">URL da capa (opcional)</label>
            <input type="text" placeholder="https://exemplo.com/capa.jpg" value={capa} onChange={(e) => setCapa(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1 md:col-span-3">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">Sinopse (opcional)</label>
            <textarea placeholder="Resumo da história do livro..." value={sinopse} onChange={(e) => setSinopse(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={adicionarLivro} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-5 py-3 flex items-center justify-center gap-2">
            <FaPlus /> {editandoId ? "Salvar Alterações" : "Adicionar"}
          </button>
          {editandoId && (
            <button onClick={cancelarEdicao} className="bg-gray-500 hover:bg-gray-600 text-white rounded-xl px-5 py-3">Cancelar</button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border dark:border-gray-700 mb-4">
        <input type="text" placeholder="Pesquisar por título ou autor..." value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} className={`w-full ${inputClass}`} />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{livrosFiltrados.length} livro(s) encontrado(s)</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <tr>
              <th className="text-left p-4">Capa</th>
              <th className="text-left p-4">Título</th>
              <th className="text-left p-4">Autor</th>
              <th className="text-left p-4">Categoria</th>
              <th className="text-center p-4">Quantidade</th>
              <th className="text-center p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {livrosFiltrados.length === 0 ? (
              <tr><td colSpan="5" className="text-center p-8 text-gray-500 dark:text-gray-400">Nenhum livro encontrado.</td></tr>
            ) : (
              livrosFiltrados.map((livro, index) => (
                <tr key={livro.id} className={`border-t dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 ${index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/30"}`}>
                  <td className="p-4">
                    {livro.capa ? (
                      <img src={livro.capa} alt={`Capa de ${livro.titulo}`} className="w-10 h-14 object-cover rounded-md"
                        onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }} />
                    ) : null}
                    <div className="w-10 h-14 rounded-md bg-violet-50 dark:bg-violet-900/30 text-violet-400 items-center justify-center"
                      style={{ display: livro.capa ? "none" : "flex" }}>
                      <FaBook size={16} />
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-100">
                    {livro.titulo}
                  </td>

                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {livro.autor}
                  </td>

                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {livro.categoria || "-"}
                  </td>

                  <td className="p-4 text-center">
                    <span className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-sm font-semibold px-3 py-1 rounded-full">
                      {livro.quantidade || 1}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => editarLivro(livro)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                      >
                        <FaEdit />
                        <span className="hidden sm:inline">Editar</span>
                      </button>

                      <button
                        onClick={() => excluirLivro(livro.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
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
    </div>
  );
}

export default Livros;