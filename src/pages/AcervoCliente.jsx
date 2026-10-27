import { useState, useEffect, useMemo } from "react";
import { BookOpen, X, Layers } from "lucide-react";
import NavbarCliente from "../components/NavbarCliente";
import { FaMoon, FaSun } from "react-icons/fa";

function AcervoCliente() {
    const [livros, setLivros] = useState([]);
    const [emprestimos, setEmprestimos] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
    const [livroSelecionado, setLivroSelecionado] = useState(null);
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [nota, setNota] = useState(5);
    const [comentario, setComentario] = useState("");

    useEffect(() => {
        try {
            const dadosLivros = JSON.parse(localStorage.getItem("livros"));
            setLivros(Array.isArray(dadosLivros) ? dadosLivros : []);
        } catch {
            setLivros([]);
        }

        try {
            const dadosEmprestimos = JSON.parse(localStorage.getItem("emprestimos"));
            setEmprestimos(Array.isArray(dadosEmprestimos) ? dadosEmprestimos : []);
        } catch {
            setEmprestimos([]);
        }

        try {
            const dadosAvaliacoes = JSON.parse(localStorage.getItem("avaliacoes"));
            setAvaliacoes(Array.isArray(dadosAvaliacoes) ? dadosAvaliacoes : []);
        } catch {
            setAvaliacoes([]);
        }

    }, []);



    const categorias = useMemo(() => {
        return [
            ...new Set(
                livros
                    .map((livro) => livro.categoria)
                    .filter(Boolean)
            ),
        ].sort();
    }, [livros]);

    const livrosFiltrados = useMemo(() => {
        const termo = pesquisa.toLowerCase();

        return livros.filter((livro) => {
            const pesquisaOk =
                livro.titulo?.toLowerCase().includes(termo) ||
                livro.autor?.toLowerCase().includes(termo);

            const categoriaOk =
                categoriaSelecionada === "" ||
                livro.categoria === categoriaSelecionada;

            return pesquisaOk && categoriaOk;
        });
    }, [livros, pesquisa, categoriaSelecionada]);

    const totalEmprestado = (livro) => {
        return emprestimos
            .filter(
                (e) =>
                    Number(e.livroId) === Number(livro.id) &&
                    e.status === "Emprestado"
            )
            .reduce((t, e) => t + Number(e.quantidade || 1), 0);
    };

    const totalDisponivel = (livro) => {
        return Math.max(
            0,
            Number(livro.quantidade || 0) - totalEmprestado(livro)
        );
    };

    const enviarAvaliacao = () => {
        if (!comentario.trim()) {
            alert("Digite uma avaliação.");
            return;
        }

        const usuario = localStorage.getItem("usuario");

        const nova = {
            id: Date.now(),
            livroId: livroSelecionado.id,
            usuario,
            nota,
            comentario,
            data: new Date().toLocaleDateString("pt-BR"),
        };

        const lista = [...avaliacoes, nova];

        setAvaliacoes(lista);
        localStorage.setItem("avaliacoes", JSON.stringify(lista));

        setComentario("");
        setNota(5);
    };

    const avaliacoesLivro = livroSelecionado
        ? avaliacoes.filter(
            a => Number(a.livroId) === Number(livroSelecionado.id)
        )
        : [];

    return (
        <>
            <NavbarCliente />

            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">

                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                        Acervo da Biblioteca
                    </h1>

                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Consulte todos os livros disponíveis.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 mb-8">

                    <div className="grid md:grid-cols-2 gap-4">

                        <input
                            type="text"
                            placeholder="Pesquisar livro..."
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                            className="border rounded-xl p-3 bg-white dark:bg-gray-700 dark:text-white"
                        />

                        <select
                            value={categoriaSelecionada}
                            onChange={(e) =>
                                setCategoriaSelecionada(e.target.value)
                            }
                            className="border rounded-xl p-3 bg-white dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Todas as categorias</option>

                            {categorias.map((categoria) => (
                                <option
                                    key={categoria}
                                    value={categoria}
                                >
                                    {categoria}
                                </option>
                            ))}
                        </select>

                    </div>

                </div>

                <div className="grid md:grid-cols-3 gap-6">

                    {livrosFiltrados.map((livro) => (

                        <button
                            key={livro.id}
                            onClick={() => setLivroSelecionado(livro)}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-xl transition p-5 text-left"
                        >

                            <div className="flex justify-center mb-4">

                                {livro.capa ? (
                                    <img
                                        src={livro.capa}
                                        alt={livro.titulo}
                                        className="w-28 h-40 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-28 h-40 rounded-lg bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                                        <BookOpen
                                            size={42}
                                            className="text-violet-600"
                                        />
                                    </div>
                                )}

                            </div>

                            <h2 className="font-bold text-lg text-center dark:text-white">
                                {livro.titulo}
                            </h2>

                            <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
                                {livro.autor}
                            </p>

                            <div className="flex justify-center mt-4">
                                <span className="bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 px-4 py-2 rounded-full font-semibold">
                                    {livro.quantidade} exemplares
                                </span>
                            </div>

                        </button>

                    ))}

                    {livrosFiltrados.length === 0 && (
                        <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
                            Nenhum livro encontrado.
                        </div>
                    )}

                </div>
                {livroSelecionado && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setLivroSelecionado(null)}
                    >
                        <div
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setLivroSelecionado(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex gap-5">
                                {livroSelecionado.capa ? (
                                    <img
                                        src={livroSelecionado.capa}
                                        alt={livroSelecionado.titulo}
                                        className="w-28 h-40 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="w-28 h-40 rounded-lg bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                                        <BookOpen
                                            size={40}
                                            className="text-violet-600"
                                        />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold dark:text-white">
                                        {livroSelecionado.titulo}
                                    </h2>

                                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                                        {livroSelecionado.autor}
                                    </p>

                                    {livroSelecionado.categoria && (
                                        <span className="inline-flex items-center gap-1 mt-3 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm">
                                            <Layers size={14} />
                                            {livroSelecionado.categoria}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mt-6">

                                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold dark:text-white">
                                        {livroSelecionado.quantidade || 0}
                                    </p>
                                    <span className="text-sm text-gray-500">
                                        Total
                                    </span>
                                </div>

                                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-green-600">
                                        {totalDisponivel(livroSelecionado)}
                                    </p>
                                    <span className="text-sm text-gray-500">
                                        Disponíveis
                                    </span>
                                </div>

                                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-yellow-500">
                                        {totalEmprestado(livroSelecionado)}
                                    </p>
                                    <span className="text-sm text-gray-500">
                                        Emprestados
                                    </span>
                                </div>

                            </div>

                            <div className="mt-6">
                                <h3 className="font-bold text-lg dark:text-white mb-2">
                                    Sinopse
                                </h3>

                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {livroSelecionado.sinopse ||
                                        "Nenhuma sinopse cadastrada para este livro."}
                                </p>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-bold dark:text-white mb-3">
                                    Avaliações
                                </h3>

                                <select
                                    value={nota}
                                    onChange={(e) => setNota(Number(e.target.value))}
                                    className="border rounded-lg p-2 w-full mb-3 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value={5}>⭐⭐⭐⭐⭐ - 5</option>
                                    <option value={4}>⭐⭐⭐⭐ - 4</option>
                                    <option value={3}>⭐⭐⭐ - 3</option>
                                    <option value={2}>⭐⭐ - 2</option>
                                    <option value={1}>⭐ - 1</option>
                                </select>

                                <textarea
                                    placeholder="Escreva sua avaliação..."
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    className="w-full border rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                />

                                <button
                                    onClick={enviarAvaliacao}
                                    className="mt-3 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-lg"
                                >
                                    Avaliar Livro
                                </button>

                                <div className="mt-6 space-y-4">
                                    {avaliacoesLivro.map((a) => (
                                        <div
                                            key={a.id}
                                            className="border rounded-xl p-4 dark:border-gray-700"
                                        >
                                            <div className="flex justify-between">
                                                <strong className="dark:text-white">
                                                    {a.usuario}
                                                </strong>

                                                <span className="text-yellow-500">
                                                    {"⭐".repeat(a.nota)}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                                {a.comentario}
                                            </p>

                                            <small className="text-gray-400">
                                                {a.data}
                                            </small>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => setLivroSelecionado(null)}
                                    className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-xl"
                                >
                                    Fechar
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </>
    );
}

export default AcervoCliente;