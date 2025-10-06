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

// ✅ importando api no lugar do axios
import api from "../api"; // ✅

export default function Dashboard() {
  const [resumo, setResumo] = useState({
    totalReceitas: 0,
    totalDespesas: 0,   // apenas variáveis
    totalFixas: 0,      // apenas fixas
    saldo: 0,
    categorias: [],
    responsaveis: [],
    bancos: [],
    ultimosLancamentos: [],
    receitasCategorias: [],
    receitasResponsaveis: [],
    receitasBancos: [],
    fixasCategorias: [],
    fixasResponsaveis: [],
    mensal: [],
  });

  const [mes, setMes] = useState(dayjs().month() + 1);
  const [ano, setAno] = useState(dayjs().year());

  useEffect(() => {
    carregarResumo();
  }, [mes, ano]);

  const carregarResumo = () => {
    api
      .get(`/dashboard?ano=${ano}&mes=${mes}`)
      .then((res) => setResumo(res.data))
      .catch((err) => console.error("Erro ao carregar resumo:", err));
  };

  const COLORS_RECEITAS = ["#34d399", "#10b981", "#059669", "#047857"];
  const COLORS_DESPESAS = ["#f87171", "#ef4444", "#dc2626", "#b91c1c"];
  const COLORS_FIXAS = ["#facc15", "#eab308", "#ca8a04", "#a16207"]; // amarelos

  const formatCurrency = (value) =>
    `R$ ${Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const renderLabel = ({ name, percent, value }) =>
    `${name} - ${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)`;

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Resumo Financeiro - Família Bertão</h1>

      {/* 🔹 Filtro de Mês e Ano */}
      <div className="flex space-x-4 mb-6">
        <select
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          className="bg-gray-800 p-2 rounded-lg"
        >
          {meses.map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>

        <input
          type="number"
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          className="bg-gray-800 p-2 rounded-lg w-28"
        />
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-gray-800 shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <ArrowUpCircleIcon className="h-10 w-10 text-green-400" />
          <div>
            <p className="text-sm">Receitas</p>
            <p className="text-xl font-semibold text-green-400">
              {formatCurrency(resumo.totalReceitas)}
            </p>
          </div>
        </div>

        <div className="bg-gray-800 shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <ArrowDownCircleIcon className="h-10 w-10 text-red-400" />
          <div>
            <p className="text-sm">Despesas Variáveis</p>
            <p className="text-xl font-semibold text-red-400">
              {formatCurrency(resumo.totalDespesas)}
            </p>
          </div>
        </div>

        <div className="bg-gray-800 shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <ExclamationTriangleIcon className="h-10 w-10 text-yellow-400" />
          <div>
            <p className="text-sm">Despesas Fixas</p>
            <p className="text-xl font-semibold text-yellow-400">
              {formatCurrency(resumo.totalFixas)}
            </p>
          </div>
        </div>

        <div className="bg-gray-800 shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <CurrencyDollarIcon className="h-10 w-10 text-blue-400" />
          <div>
            <p className="text-sm">Saldo</p>
            <p className="text-xl font-semibold text-blue-400">
              {formatCurrency(resumo.saldo)}
            </p>
          </div>
        </div>
      </div>

      {/* Gráficos Despesas Variáveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg min-h-[350px]">
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

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg min-h-[350px]">
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

      {/* Gráficos Despesas Fixas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg min-h-[350px]">
          <h2 className="text-lg font-semibold mb-4">Despesas Fixas por Categoria</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={resumo.fixasCategorias || []}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="total"
                nameKey="nome"
                label={renderLabel}
              >
                {resumo.fixasCategorias?.map((_, i) => (
                  <Cell key={i} fill={COLORS_FIXAS[i % COLORS_FIXAS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg min-h-[350px]">
          <h2 className="text-lg font-semibold mb-4">Despesas Fixas por Responsável</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={resumo.fixasResponsaveis || []}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="total"
                nameKey="nome"
                label={renderLabel}
              >
                {resumo.fixasResponsaveis?.map((_, i) => (
                  <Cell key={i} fill={COLORS_FIXAS[i % COLORS_FIXAS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos Receitas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg min-h-[350px]">
          <h2 className="text-lg font-semibold mb-4">Receitas por Categoria</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={resumo.receitasCategorias || []}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="total"
                nameKey="nome"
                label={renderLabel}
              >
                {resumo.receitasCategorias?.map((_, i) => (
                  <Cell key={i} fill={COLORS_RECEITAS[i % COLORS_RECEITAS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg min-h-[350px]">
          <h2 className="text-lg font-semibold mb-4">Receitas por Responsável</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={resumo.receitasResponsaveis || []}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="total"
                nameKey="nome"
                label={renderLabel}
              >
                {resumo.receitasResponsaveis?.map((_, i) => (
                  <Cell key={i} fill={COLORS_RECEITAS[i % COLORS_RECEITAS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico mensal */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg mt-8">
        <h2 className="text-lg font-semibold mb-4">Receitas vs Despesas (Mensal)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={resumo.mensal || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Legend />
            <Bar dataKey="receitas" fill="#34d399" name="Receitas" />
            <Bar dataKey="variaveis" fill="#f87171" name="Variáveis" />
            <Bar dataKey="fixas" fill="#facc15" name="Fixas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Últimos lançamentos */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg mt-8">
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
