import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import {
  FaBookOpen,
  FaBook,
  FaClock,
  FaCoins,
} from "react-icons/fa";

import NavbarCliente from "../components/NavbarCliente";

const DIA_MS = 24 * 60 * 60 * 1000;
const VALOR_MULTA = 1.5;

export default function AreaCliente() {
  const navigate = useNavigate();
  const nome = localStorage.getItem("usuario");

  const { ativos, historico, multas, atrasados } = useMemo(() => {
    const livros = JSON.parse(localStorage.getItem("livros")) || [];
    const emprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];

    const lista = emprestimos
      .filter((e) => e.usuario === nome)
      .map((e) => {
        const livro = livros.find(
          (l) => Number(l.id) === Number(e.livroId)
        );

        const limite =
          (e.dataEmprestimoTimestamp || Date.now()) +
          Number(e.prazoDias || 7) * DIA_MS;

        const ref =
          e.status === "Devolvido"
            ? e.dataDevolucaoTimestamp || Date.now()
            : Date.now();

        const atraso = Math.max(
          0,
          Math.ceil((ref - limite) / DIA_MS)
        );

        const multa = atraso * VALOR_MULTA;

        return {
          ...e,
          titulo: livro?.titulo || e.livro,
          autor: livro?.autor || "-",
          atraso,
          multa,
          limite,
        };
      })
      .sort(
        (a, b) =>
          (b.dataEmprestimoTimestamp || 0) -
          (a.dataEmprestimoTimestamp || 0)
      );

    return {
      ativos: lista.filter((e) => e.status === "Emprestado"),
      historico: lista.filter((e) => e.status === "Devolvido"),
      atrasados: lista.filter(
        (e) => e.status === "Emprestado" && e.atraso > 0
      ).length,
      multas: lista
        .filter((e) => !e.multaPaga)
        .reduce((t, e) => t + e.multa, 0),
    };
  }, [nome]);

  const fmtData = (t) =>
    t ? new Date(t).toLocaleDateString("pt-BR") : "-";

  const fmtMoeda = (v) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <>
      <NavbarCliente />

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center text-white">
            <FaBookOpen size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Olá, {nome}!
            </h1>

            <p className="text-gray-500 dark:text-gray-400">
              Minha Área
            </p>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card
            icon={<FaBook />}
            titulo="Empréstimos ativos"
            valor={ativos.length}
          />

          <Card
            icon={<FaClock />}
            titulo="Livros em atraso"
            valor={atrasados}
          />

          <Card
            icon={<FaCoins />}
            titulo="Multas pendentes"
            valor={fmtMoeda(multas)}
          />
        </div>

        <Tabela
          titulo="Meus Empréstimos"
          lista={ativos}
          fmtData={fmtData}
          fmtMoeda={fmtMoeda}
        />

        <div className="h-8" />

        <Tabela
          titulo="Histórico"
          lista={historico}
          fmtData={fmtData}
          fmtMoeda={fmtMoeda}
        />
      </div>
    </>
  );
}

/* CARD */
function Card({ icon, titulo, valor }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow">
      <div className="flex items-center gap-3">
        <div className="text-violet-600 text-2xl">
          {icon}
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400">
            {titulo}
          </p>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {valor}
          </h2>
        </div>
      </div>
    </div>
  );
}

/* TABELA */
function Tabela({ titulo, lista, fmtData, fmtMoeda }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        {titulo}
      </h2>

      {lista.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum registro.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-sm">
                <th className="w-40 text-left py-3">Livro</th>
                <th className="w-32 text-left">Autor</th>
                <th className="w-32 text-center">Empréstimo</th>
                <th className="w-32 text-center">Limite</th>
                <th className="w-28 text-center">Status</th>
                <th className="w-28 text-center">Multa</th>
              </tr>
            </thead>

            <tbody className="text-gray-700 dark:text-gray-200">
              {lista.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <td className="py-3 pr-2 truncate">
                    {e.titulo}
                  </td>

                  <td className="truncate">
                    {e.autor}
                  </td>

                  <td className="text-center whitespace-nowrap">
                    {fmtData(e.dataEmprestimoTimestamp)}
                  </td>

                  <td className="text-center whitespace-nowrap">
                    {fmtData(e.limite)}
                  </td>

                  <td className="text-center">
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300">
                      {e.status}
                    </span>
                  </td>

                  <td className="text-center">
                    {e.multa > 0 ? fmtMoeda(e.multa) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}