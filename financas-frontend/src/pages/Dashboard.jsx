import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import {
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import api from "../api";

export default function Dashboard() {
  const [resumo, setResumo] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    totalFixas: 0,
    saldo: 0,
    categorias: [],
    responsaveis: [],
    fixasCategorias: [],
    fixasResponsaveis: [],
    receitasCategorias: [],
    receitasResponsaveis: [],
    mensal: [],
    ultimosLancamentos: [],
  });

  const [mes, setMes] = useState(dayjs().month() + 1);
  const [ano, setAno] = useState(dayjs().year());

  useEffect(() => {
    carregarResumo();
  }, [mes, ano]);

  const carregarResumo = async () => {
    try {
      const { data } = await api.get(`/dashboard?ano=${ano}&mes=${mes}`);
      setResumo(data);
    } catch (err) {
      console.error("Erro ao carregar resumo:", err);
    }
  };

  const COLORS_RECEITAS = ["#22c55e", "#16a34a", "#15803d"];
  const COLORS_DESPESAS = ["#ef4444", "#dc2626", "#b91c1c"];
  const COLORS_FIXAS = ["#facc15", "#eab308", "#ca8a04"];

  const formatCurrency = (v) =>
    `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const renderLabel = ({ name, percent, value }) =>
    `${name} - ${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)`;

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 pb-24">
      {/* 🔹 Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white">Painel Financeiro</h1>
          <p className="text-2xl font-assinatura text-amber-400">Família Bertão</p>
        </div>

        <div className="flex items-center gap-3 mt-6 sm:mt-0">
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500"
          >
            {meses.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 rounded-lg w-24 focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={() => window.alert("Exportação em breve")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all shadow"
          >
            📊 Exportar
          </button>
        </div>
      </div>

      {/* 🔹 Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
        <div className="bg-gray-900 border border-green-500/30 rounded-xl p-5 flex items-center gap-4 shadow-md hover:shadow-green-500/20 transition-all">
          <ArrowUpCircleIcon className="h-10 w-10 text-green-400" />
          <div>
            <p className="text-sm text-gray-400 uppercase">Receitas</p>
            <p className="text-2xl font-semibold text-green-400">
              {formatCurrency(resumo.totalReceitas)}
            </p>
          </div>
        </div>

        <div className="bg-gray-900 border border-red-500/30 rounded-xl p-5 flex items-center gap-4 shadow-md hover:shadow-red-500/20 transition-all">
          <ArrowDownCircleIcon className="h-10 w-10 text-red-400" />
          <div>
            <p className="text-sm text-gray-400 uppercase">Despesas Variáveis</p>
            <p className="text-2xl font-semibold text-red-400">
              {formatCurrency(resumo.totalDespesas)}
            </p>
          </div>
        </div>

        <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-5 flex items-center gap-4 shadow-md hover:shadow-yellow-500/20 transition-all">
          <ExclamationTriangleIcon className="h-10 w-10 text-yellow-400" />
          <div>
            <p className="text-sm text-gray-400 uppercase">Despesas Fixas</p>
            <p className="text-2xl font-semibold text-yellow-400">
              {formatCurrency(resumo.totalFixas)}
            </p>
          </div>
        </div>

        <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-5 flex items-center gap-4 shadow-md hover:shadow-blue-500/20 transition-all">
          <CurrencyDollarIcon className="h-10 w-10 text-blue-400" />
          <div>
            <p className="text-sm text-gray-400 uppercase">Saldo</p>
            <p className="text-2xl font-semibold text-blue-400">
              {formatCurrency(resumo.saldo)}
            </p>
          </div>
        </div>
      </div>

      {/* 🔹 Gráficos de despesas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow">
          <h2 className="text-lg font-semibold mb-4">Despesas Variáveis por Categoria</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={resumo.categorias || []}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="total"
                nameKey="nome"
                label={renderLabel}
              >
                {resumo.categorias?.map((_, i) => (
                  <Cell key={i} fill={COLORS_DESPESAS[i % COLORS_DESPESAS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow">
          <h2 className="text-lg font-semibold mb-4">Despesas Variáveis por Responsável</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={resumo.responsaveis || []}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="total"
                nameKey="nome"
                label={renderLabel}
              >
                {resumo.responsaveis?.map((_, i) => (
                  <Cell key={i} fill={COLORS_DESPESAS[i % COLORS_DESPESAS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🔹 Gráfico mensal */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow mt-8">
        <h2 className="text-lg font-semibold mb-4">Receitas vs Despesas (Mensal)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={resumo.mensal || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Legend />
            <Bar dataKey="receitas" fill="#22c55e" name="Receitas" />
            <Bar dataKey="variaveis" fill="#ef4444" name="Variáveis" />
            <Bar dataKey="fixas" fill="#facc15" name="Fixas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 Últimos lançamentos */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow mt-8">
        <h2 className="text-lg font-semibold mb-4">Últimos Lançamentos</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700">
              <th className="p-2">Data</th>
              <th className="p-2">Descrição</th>
              <th className="p-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {resumo.ultimosLancamentos?.length > 0 ? (
              resumo.ultimosLancamentos.map((l, idx) => (
                <tr key={idx} className="border-b border-gray-700">
                  <td className="p-2">
                    {dayjs(l.data).isValid()
                      ? dayjs(l.data).format("DD/MM/YYYY")
                      : l.data}
                  </td>
                  <td className="p-2">{l.descricao}</td>
                  <td
                    className={`p-2 font-semibold ${
                      l.tipo === "RECEITA" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {formatCurrency(l.valor)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-400">
                  Nenhum lançamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
