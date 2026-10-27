import { useState } from "react";
import {
  FaFilePdf,
  FaFileExcel,
  FaBook,
  FaUsers,
  FaExchangeAlt,
  FaBoxes,
  FaCoins,
  FaUserTie,
} from "react-icons/fa";
import { exportarExcel, exportarPDF } from "../utils/relatorios";
// ---- Mesmo cálculo de multa usado no Dashboard.jsx ----
const PRAZO_DIAS = 7;
const VALOR_MULTA_POR_DIA = 1.5;
const DIA_MS = 24 * 60 * 60 * 1000;

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

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Remove campos sensíveis (senha) antes de exportar qualquer relatório.
function sanitizar(lista) {
  return (lista || []).map(({ senha, ...resto }) => resto);
}

function lerStorage(chave) {
  try {
    return JSON.parse(localStorage.getItem(chave)) || [];
  } catch {
    return [];
  }
}

// Cada relatório sabe de onde tirar seus dados e como se chama o arquivo.
function useRelatorios() {
  const livros = sanitizar(lerStorage("livros"));
  const usuarios = sanitizar(lerStorage("usuarios"));
  const funcionarios = sanitizar(lerStorage("funcionarios"));
  const emprestimos = sanitizar(lerStorage("emprestimos"));

  // Estoque não tem uma chave própria no localStorage — é calculado
  // cruzando "livros" (campo quantidade) com "emprestimos" (por livroId),
  // exatamente como a página Estoque.jsx faz.
  const estoque = livros.map((livro) => {
    const emprestados = emprestimos
      .filter((e) => e.livroId === livro.id && e.status === "Emprestado")
      .reduce((total, e) => total + Number(e.quantidade || 1), 0);
    const total = Number(livro.quantidade || 0);
    const disponiveis = total - emprestados;
    return {
      titulo: livro.titulo,
      autor: livro.autor,
      total,
      emprestados,
      disponiveis,
      situacao: disponiveis <= 0 ? "Esgotado" : disponiveis <= 2 ? "Estoque baixo" : "Disponível",
    };
  });

  const multasPendentes = emprestimos
    .map((e) => ({ ...e, multa: calcularValorMulta(e) }))
    .filter((e) => e.multa > 0 && !e.multaPaga)
    .map((e) => ({
      usuario: e.usuario,
      livro: e.livro,
      data: e.data,
      diasEmAtraso: diasEmAtraso(e),
      multa: formatarMoeda(e.multa),
    }));

  return [
    {
      id: "livros",
      titulo: "Livros",
      descricao: "Acervo completo cadastrado no sistema.",
      icon: FaBook,
      dados: livros,
    },
    {
      id: "usuarios",
      titulo: "Usuários",
      descricao: "Clientes cadastrados na plataforma.",
      icon: FaUsers,
      dados: usuarios,
    },
    {
      id: "funcionarios",
      titulo: "Funcionários",
      descricao: "Equipe com acesso ao sistema.",
      icon: FaUserTie,
      dados: funcionarios,
    },
    {
      id: "emprestimos",
      titulo: "Empréstimos",
      descricao: "Todos os empréstimos registrados.",
      icon: FaExchangeAlt,
      dados: emprestimos,
    },
    {
      id: "estoque",
      titulo: "Estoque",
      descricao: "Quantidade disponível por item.",
      icon: FaBoxes,
      dados: estoque,
    },
    {
      id: "multas",
      titulo: "Multas pendentes",
      descricao: "Empréstimos com multa em aberto.",
      icon: FaCoins,
      dados: multasPendentes,
    },
  ];
}

function CardRelatorio({ relatorio }) {
  const { titulo, descricao, icon: Icon, dados } = relatorio;
  const [gerando, setGerando] = useState(null); // "pdf" | "excel" | null
  const vazio = !dados || dados.length === 0;

  const baixarPDF = () => {
    setGerando("pdf");
    setTimeout(() => {
      exportarPDF(dados, titulo, relatorio.id);
      setGerando(null);
    }, 150);
  };

  const baixarExcel = () => {
    setGerando("excel");
    setTimeout(() => {
      exportarExcel(dados, relatorio.id);
      setGerando(null);
    }, 150);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
          <Icon className="text-violet-600 dark:text-violet-400 text-xl" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800 dark:text-white">{titulo}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{descricao}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        {vazio ? "Nenhum registro disponível" : `${dados.length} registro(s) disponível(is)`}
      </p>

      <div className="mt-auto flex gap-3">
        <button
          onClick={baixarPDF}
          disabled={vazio || gerando !== null}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-2 flex items-center justify-center gap-2 transition"
        >
          <FaFilePdf />
          {gerando === "pdf" ? "Gerando..." : "PDF"}
        </button>

        <button
          onClick={baixarExcel}
          disabled={vazio || gerando !== null}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-2 flex items-center justify-center gap-2 transition"
        >
          <FaFileExcel />
          {gerando === "excel" ? "Gerando..." : "Excel"}
        </button>
      </div>
    </div>
  );
}

function Relatorios() {
  const relatorios = useRelatorios();

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Relatórios
      </h1>

      <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">
        Baixe relatórios do sistema em PDF ou Excel.
      </p>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {relatorios.map((r) => (
          <CardRelatorio key={r.id} relatorio={r} />
        ))}
      </div>
    </div>
  );
}

export default Relatorios;