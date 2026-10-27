import { useState, useEffect, useMemo } from "react";
import { BookOpen, X, User, Layers } from "lucide-react";

function Acervo() {
  const [livros, setLivros] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");

  useEffect(() => {
    try {
      const dados = JSON.parse(localStorage.getItem("livros"));
      setLivros(Array.isArray(dados) ? dados : []);
    } catch { setLivros([]); }

    try {
      const dadosEmprestimos = JSON.parse(localStorage.getItem("emprestimos"));
      setEmprestimos(Array.isArray(dadosEmprestimos) ? dadosEmprestimos : []);
    } catch { setEmprestimos([]); }
  }, []);

  const categorias = useMemo(() => {
    const lista = [...new Set(
      livros
        .map((livro) => livro.categoria)
        .filter(Boolean)
    )];

    return lista.sort();
  }, [livros]);

  const livrosFiltrados = useMemo(() => {
    const termo = pesquisa.toLowerCase().trim();

    return livros.filter((livro) => {
      const correspondePesquisa =
        !termo ||
        [livro.titulo, livro.autor]
          .filter(Boolean)
          .some((campo) =>
            campo.toLowerCase().includes(termo)
          );

      const correspondeCategoria =
        !categoriaSelecionada ||
        livro.categoria === categoriaSelecionada;

      return correspondePesquisa && correspondeCategoria;
    });
  }, [livros, pesquisa, categoriaSelecionada]);

  const emprestimosAtivosDoLivro = (livro) =>
    emprestimos.filter((e) => e.livroId === livro.id && e.status === "Emprestado");

  const totalEmprestado = (livro) =>
    emprestimosAtivosDoLivro(livro).reduce((total, e) => total + Number(e.quantidade || 1), 0);

  const totalDisponivel = (livro) =>
    Math.max(0, Number(livro.quantidade || 0) - totalEmprestado(livro));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Acervo da Biblioteca</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Consulte todos os livros disponíveis.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-4 mb-6">
        <div className="grid md:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Pesquisar livro..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            className="w-full border dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <select
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
            className="w-full border dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Todas as categorias</option>

            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>

        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {livrosFiltrados.map((livro) => (
          <button key={livro.id} onClick={() => setLivroSelecionado(livro)}
            className="text-left bg-white dark:bg-gray-800 rounded-2xl shadow border dark:border-gray-700 p-5 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">
            <div className="flex justify-center mb-4">
              {livro.capa ? (
                <img src={livro.capa} alt={`Capa de ${livro.titulo}`} className="w-28 h-40 object-cover rounded-lg shadow-sm"
                  onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }} />
              ) : null}
              <div className="w-28 h-40 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-400 items-center justify-center"
                style={{ display: livro.capa ? "none" : "flex" }}>
                <BookOpen size={40} strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">{livro.titulo}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center mt-2">{livro.autor}</p>
            <div className="mt-4 flex justify-center">
              <span className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-4 py-2 rounded-full font-semibold">
                {livro.quantidade} exemplares
              </span>
            </div>
          </button>
        ))}
        {livrosFiltrados.length === 0 && (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400">Nenhum livro encontrado.</div>
        )}
      </div>

      {livroSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setLivroSelecionado(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLivroSelecionado(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X size={24} />
            </button>

            <div className="flex gap-5">
              {livroSelecionado.capa ? (
                <img src={livroSelecionado.capa} alt={`Capa de ${livroSelecionado.titulo}`} className="w-24 h-36 object-cover rounded-lg shadow-sm flex-shrink-0" />
              ) : (
                <div className="w-24 h-36 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-400 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={32} strokeWidth={1.5} />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{livroSelecionado.titulo}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{livroSelecionado.autor}</p>
                {livroSelecionado.categoria && (
                  <span className="inline-flex items-center gap-1 mt-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold">
                    <Layers size={12} /> {livroSelecionado.categoria}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="text-center bg-gray-50 dark:bg-gray-900/30 rounded-xl py-3">
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{livroSelecionado.quantidade || 0}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Quantidade</p>
              </div>
              <div className="text-center bg-gray-50 dark:bg-gray-900/30 rounded-xl py-3">
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{totalDisponivel(livroSelecionado)}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Disponíveis</p>
              </div>
              <div className="text-center bg-gray-50 dark:bg-gray-900/30 rounded-xl py-3">
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{totalEmprestado(livroSelecionado)}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Emprestados</p>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Sinopse</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {livroSelecionado.sinopse || "Nenhuma sinopse cadastrada para este livro."}
              </p>
            </div>

            <div className="mt-5">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Quem está com ele</h3>
              {emprestimosAtivosDoLivro(livroSelecionado).length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum exemplar emprestado no momento.</p>
              ) : (
                <div className="space-y-2">
                  {emprestimosAtivosDoLivro(livroSelecionado).map((emp) => (
                    <div key={emp.id} className="flex items-center gap-3 p-2.5 rounded-xl border dark:border-gray-700">
                      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 flex items-center justify-center flex-shrink-0">
                        <User size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{emp.usuario}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Desde {emp.data}</p>
                      </div>
                      {Number(emp.quantidade || 1) > 1 && (
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">{emp.quantidade}x</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Acervo;