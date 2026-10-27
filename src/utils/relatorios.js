import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * Deixa a primeira letra maiúscula e troca "_" por espaço.
 * Usado para transformar chaves de objeto (ex: "dataLimite") em
 * cabeçalhos legíveis (ex: "Data Limite"), caso não seja passado
 * um mapeamento de colunas customizado.
 */
function rotuloAutomatico(chave) {
  return chave
    .replace(/([a-z])([A-Z])/g, "$1 $2") // dataLimite -> data Limite
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Normaliza os dados para um formato { rotulo, valor } por linha,
 * com base em `colunas` (opcional) ou nas chaves do primeiro item.
 *
 * colunas (opcional): [{ chave: "titulo", rotulo: "Título" }, ...]
 */
function montarColunas(dados, colunas) {
  if (colunas && colunas.length) return colunas;
  if (!dados.length) return [];
  return Object.keys(dados[0]).map((chave) => ({
    chave,
    rotulo: rotuloAutomatico(chave),
  }));
}

/**
 * Exporta um array de objetos para um arquivo .xlsx
 *
 * @param {Array<Object>} dados - lista de registros (ex: livros, usuários)
 * @param {string} nomeArquivo - nome do arquivo, sem extensão (ex: "livros")
 * @param {Array<{chave: string, rotulo: string}>} [colunas] - mapeamento opcional
 * @param {string} [nomeAba] - nome da aba do Excel
 */
export function exportarExcel(dados, nomeArquivo, colunas, nomeAba = "Dados") {
  if (!dados || !dados.length) {
    alert("Não há dados para exportar.");
    return;
  }

  const cols = montarColunas(dados, colunas);

  const linhas = dados.map((item) => {
    const linha = {};
    cols.forEach(({ chave, rotulo }) => {
      linha[rotulo] = item[chave] ?? "";
    });
    return linha;
  });

  const planilha = XLSX.utils.json_to_sheet(linhas);
  const livro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(livro, planilha, nomeAba);

  const dataHoje = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(livro, `${nomeArquivo}-${dataHoje}.xlsx`);
}

/**
 * Exporta um array de objetos para um arquivo .pdf (tabela)
 *
 * @param {Array<Object>} dados - lista de registros
 * @param {string} titulo - título exibido no topo do PDF
 * @param {string} nomeArquivo - nome do arquivo, sem extensão
 * @param {Array<{chave: string, rotulo: string}>} [colunas] - mapeamento opcional
 */
export function exportarPDF(dados, titulo, nomeArquivo, colunas) {
  if (!dados || !dados.length) {
    alert("Não há dados para exportar.");
    return;
  }

  const cols = montarColunas(dados, colunas);
  const doc = new jsPDF();
  const dataHoje = new Date().toLocaleDateString("pt-BR");

  // Cabeçalho
  doc.setFontSize(16);
  doc.setTextColor(109, 40, 217); // violet-700
  doc.text(titulo, 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Gerado em ${dataHoje} • ${dados.length} registro(s)`, 14, 25);

  autoTable(doc, {
    startY: 32,
    head: [cols.map((c) => c.rotulo)],
    body: dados.map((item) => cols.map(({ chave }) => String(item[chave] ?? ""))),
    headStyles: { fillColor: [124, 58, 237] }, // violet-600
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [245, 243, 255] }, // violet-50
  });

  const dataArquivo = new Date().toISOString().slice(0, 10);
  doc.save(`${nomeArquivo}-${dataArquivo}.pdf`);
}