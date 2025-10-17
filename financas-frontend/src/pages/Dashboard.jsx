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
import "../scrollbar.css";

export default function Dashboard() {
  const [resumo, setResumo] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    totalFixas: 0,
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
    despesasFixas: [],
  });

  const [mes, setMes] = useState(dayjs().month() + 1);
  const [ano, setAno] = useState(dayjs().year());
  const [modo, setModo] = useState("real"); // 🔹 novo estado: real ou competencia

  useEffect(() => {
    carregarResumo();
  }, [mes, ano, modo]);

  const carregarResumo = async () => {
    try {
      const res = await api.get(`/dashboard?ano=${ano}&mes=${mes}&modo=${modo}`);
      setResumo(res.data);
    } catch (err) {
      console.error("Erro ao carregar resumo:", err);
    }
  };

  const togglePago = async (id, estadoAtual) => {
    try {
      const novoEstado = !estadoAtual;
      await api.post(
        `/dashboard/despesas-fixas/pagar/${id}?mes=${mes}&ano=${ano}&pago=${novoEstado}`
      );
      await carregarResumo();
    } catch (err) {
      console.error("Erro ao atualizar pagamento:", err);
    }
  };

  const fixasCredito = resumo.despesasFixas.filter(
    (p) => p.tipoPagamento === "CREDITO"
  );
  const fixasDebito = resumo.despesasFixas.filter(
    (p) => p.tipoPagamento === "DEBITO"
  );

  const totalDebito = fixasDebito.reduce((sum, i) => sum + (i.valor || 0), 0);
  const totalCredito = fixasCredito.reduce((sum, i) => sum + (i.valor || 0), 0);
  const totalFixasPagas = resumo.despesasFixas
    .filter((p) => p.pago)
    .reduce((sum, i) => sum + (i.valor || 0), 0);

  const COLORS_RECEITAS = ["#34d399", "#10b981", "#059669", "#047857"];
  const COLORS_DESPESAS = ["#f87171", "#ef4444", "#dc2626", "#b91c1c"];
  const COLORS_FIXAS = ["#facc15", "#eab308", "#ca8a04", "#a16207"];

  const formatCurrency = (value) =>
    `R$ ${Number(value || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`;

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8">
      {/* Cabeçalho */}
      <header className="mb-10 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-950 to-black p-6 shadow-lg border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Painel Financeiro
            </h1>
            <p className="text-2xl sm:text-3xl font-assinatura text-amber-400 mt-1">
              Família Bertão
            </p>
          </div>

          {/* 🔹 Filtros de mês, ano e modo */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 mt-6 sm:mt-0 justify-center">
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 text-gray-100 p-2 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              {meses.map((m, i) => (
                <option key={i + 1} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 text-gray-100 p-2 rounded-lg w-24 focus:ring-2 focus:ring-amber-500"
            />

            {/* 🔹 Toggle modo (real / competência) */}
            <div className="flex bg-gray-800 border border-gray-700 rounded-lg overflow-hidden text-sm">
              <button
                onClick={() => setModo("real")}
                className={`px-3 py-2 transition-colors ${modo === "real"
                    ? "bg-amber-500 text-black"
                    : "text-gray-400 hover:text-gray-200"
                  }`}
              >
                Fluxo Real
              </button>
              <button
                onClick={() => setModo("competencia")}
                className={`px-3 py-2 transition-colors ${modo === "competencia"
                    ? "bg-amber-500 text-black"
                    : "text-gray-400 hover:text-gray-200"
                  }`}
              >
                Competência
              </button>
            </div>
          </div>
        </div>

        {/* 🔹 Texto explicativo */}
        <p className="mt-4 text-gray-400 text-sm text-center sm:text-right italic">
          {modo === "real"
            ? "Mostrando receitas e despesas conforme a data de pagamento."
            : "Mostrando receitas e despesas conforme o mês de competência."}
        </p>
      </header>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <Card cor="green" titulo="Receitas" valor={resumo.totalReceitas} Icon={ArrowUpCircleIcon} />
        <Card cor="red" titulo="Despesas Variáveis" valor={resumo.totalDespesas} Icon={ArrowDownCircleIcon} />
        <Card cor="yellow" titulo="Despesas Fixas" valor={resumo.totalFixas} Icon={ExclamationTriangleIcon} />
        <Card cor="purple" titulo="Despesas Fixas Pagas" valor={totalFixasPagas} Icon={CurrencyDollarIcon} />
        <Card cor="blue" titulo="Saldo" valor={resumo.saldo} Icon={CurrencyDollarIcon} />
      </div>

      {/* Gráficos e checklist lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 space-y-6">
          <Section titulo="Despesas Variáveis por Categoria">
            <PieBox data={resumo.categorias} colors={COLORS_DESPESAS} formatCurrency={formatCurrency} />
          </Section>

          <Section titulo="Despesas Variáveis por Responsável">
            <PieBox data={resumo.responsaveis} colors={COLORS_DESPESAS} formatCurrency={formatCurrency} />
          </Section>
        </div>

        {/* Checklist lateral */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 shadow-lg rounded-2xl p-6 flex flex-col max-h-[720px]">
          <h2 className="text-lg font-semibold mb-3 text-gray-100">📋 Pagamentos do Mês</h2>

          <div className="flex-1 custom-scroll pr-2 space-y-5">
            <PagamentosGrupo
              titulo="💰 Débito / Conta"
              lista={fixasDebito}
              total={totalDebito}
              togglePago={togglePago}
              formatCurrency={formatCurrency}
            />
            <PagamentosGrupo
              titulo="💳 Cartão de Crédito"
              lista={fixasCredito}
              total={totalCredito}
              togglePago={togglePago}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>
      </div>

      {/* Despesas fixas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Section titulo="Despesas Fixas por Categoria">
          <PieBox data={resumo.fixasCategorias} colors={COLORS_FIXAS} formatCurrency={formatCurrency} />
        </Section>
        <Section titulo="Despesas Fixas por Responsável">
          <PieBox data={resumo.fixasResponsaveis} colors={COLORS_FIXAS} formatCurrency={formatCurrency} />
        </Section>
      </div>

      {/* Evolução Mensal */}
      <Section titulo="📈 Evolução Mensal" className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={resumo.mensal}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="mes" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Legend />
            <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
            <Bar dataKey="variaveis" fill="#ef4444" name="Despesas Variáveis" />
            <Bar dataKey="fixas" fill="#facc15" name="Fixas" />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* Últimos lançamentos */}
      <Section titulo="📅 Últimos Lançamentos do Mês" className="mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-300 border border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-2 text-left">Data</th>
                <th className="px-4 py-2 text-left">Descrição</th>
                <th className="px-4 py-2 text-left">Categoria</th>
                <th className="px-4 py-2 text-left">Responsável</th>
                <th className="px-4 py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {resumo.ultimosLancamentos?.length ? (
                resumo.ultimosLancamentos.map((l) => (
                  <tr key={l.id} className="border-t border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-2">{dayjs(l.data).format("DD/MM/YYYY")}</td>
                    <td className="px-4 py-2">{l.descricao}</td>
                    <td className="px-4 py-2">{l.categoria?.nome}</td>
                    <td className="px-4 py-2">{l.responsavel?.nome}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(l.valor)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4 italic">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

/* ---------- Subcomponentes ---------- */
function Card({ cor, titulo, valor, Icon }) {
  const corTexto = {
    green: "text-green-400",
    red: "text-red-400",
    yellow: "text-yellow-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
  }[cor];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 shadow-lg rounded-2xl p-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Icon className={`h-8 w-8 ${corTexto}`} />
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">{titulo}</p>
          <p className={`text-xl font-semibold ${corTexto}`}>
            R$ {Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ titulo, children, className = "" }) {
  return (
    <div className={`bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 shadow-lg rounded-2xl p-6 ${className}`}>
      <h2 className="text-lg font-semibold mb-4 text-gray-100">{titulo}</h2>
      {children}
    </div>
  );
}

function PieBox({ data, colors, formatCurrency }) {
  const sortedData = Array.isArray(data)
    ? [...data].sort((a, b) => (b.total || 0) - (a.total || 0))
    : [];
  return (
    <div className="flex flex-col items-center w-full">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={sortedData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="total"
            nameKey="nome"
            label={({ name, percent, value }) =>
              `${name} - ${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)`
            }
          >
            {sortedData.map((entry, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatCurrency(v)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function PagamentosGrupo({ titulo, lista, total, togglePago, formatCurrency }) {
  return (
    <div className="mb-6 bg-gray-950/30 rounded-xl border border-gray-800 p-3">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
        <div className="flex items-center gap-2 text-base font-semibold">
          {titulo.includes("Débito") && <span className="text-amber-400 text-lg">💰</span>}
          {titulo.includes("Crédito") && <span className="text-blue-400 text-lg">💳</span>}
          <span className="text-gray-100">{titulo}</span>
        </div>
        <span className="text-gray-200 font-semibold text-sm">{formatCurrency(total)}</span>
      </div>

      <div className={`${lista.length > 8 ? "custom-scroll max-h-[360px]" : "overflow-y-visible"} space-y-1`}>
        {lista.length === 0 ? (
          <p className="text-gray-500 text-xs italic">Nenhum lançamento encontrado.</p>
        ) : (
          lista.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.pago}
                  onChange={() => togglePago(item.id, item.pago)}
                  className="form-checkbox text-green-500 rounded-md h-5 w-5"
                />
                <span className={`truncate ${item.pago ? "text-green-400 line-through" : "text-gray-200"}`}>
                  {item.descricao}
                </span>
              </label>
              <div className="text-right">
                <p className="text-xs text-gray-400">
                  {dayjs(item.dataVencimento).format("DD/MM")}
                </p>
                <p className="text-sm font-medium">{formatCurrency(item.valor)}</p>
                {item.pago && item.dataPagamento && (
                  <p className="text-xs text-green-500 italic mt-1">
                    Pago em {dayjs(item.dataPagamento).format("DD/MM/YYYY")}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
