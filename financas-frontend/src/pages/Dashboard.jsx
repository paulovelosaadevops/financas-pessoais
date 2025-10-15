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

  // 🔹 Estados principais
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
  });

  const [mes, setMes] = useState(dayjs().month() + 1);
  const [ano, setAno] = useState(dayjs().year());
  const [categorias, setCategorias] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);

  // 🔹 Carregamento inicial
  useEffect(() => {
    carregarCategorias();
  }, []);

  useEffect(() => {
    carregarResumo();
    carregarPagamentosFixos();
  }, [mes, ano, categorias]);

  // 🔹 Funções auxiliares de carregamento
  const carregarCategorias = async () => {
    try {
      const res = await api.get("/categorias");
      setCategorias(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
      setCategorias([]);
    }
  };

  const carregarResumo = () => {
    api
      .get(`/dashboard?ano=${ano}&mes=${mes}`)
      .then((res) => setResumo(res.data))
      .catch((err) => console.error("Erro ao carregar resumo:", err));
  };

  const carregarPagamentosFixos = async () => {
    try {
      const res = await api.get("/parametros/despesas-fixas");
      if (Array.isArray(res.data)) {
        const fixas = res.data.map((f) => ({
          id: f.id,
          descricao: f.descricao,
          valor: f.valor,
          data: f.diaVencimento
            ? dayjs(`${ano}-${String(mes).padStart(2, "0")}-${String(f.diaVencimento).padStart(2, "0")}`).format("YYYY-MM-DD")
            : dayjs().format("YYYY-MM-DD"),
          categoriaNome: f.categoria?.nome || "",
          conta: f.conta || {},
          pago: false,
        }));
        setPagamentos(
          fixas.sort((a, b) => dayjs(a.data).date() - dayjs(b.data).date())
        );
      }
    } catch (err) {
      console.error("Erro ao carregar despesas fixas:", err);
      setPagamentos([]);
    }
  };

  const togglePago = (id) => {
    setPagamentos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, pago: !p.pago } : p))
    );
  };

  // 🔹 Paletas de cores
  const COLORS_RECEITAS = ["#34d399", "#10b981", "#059669", "#047857"];
  const COLORS_DESPESAS = ["#f87171", "#ef4444", "#dc2626", "#b91c1c"];
  const COLORS_FIXAS = ["#facc15", "#eab308", "#ca8a04", "#a16207"];

  // 🔹 Utilitários
  const formatCurrency = (value) =>
    `R$ ${Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // 🔹 Filtro de crédito / débito
  const fixasCredito = pagamentos.filter((p) => {
    const nomeCategoria = (p.categoriaNome || "").toUpperCase();
    const nomeConta = (p.conta?.nome || "").toUpperCase();
    return (
      nomeCategoria.includes("CARTAO") ||
      nomeCategoria.includes("CARTÃO") ||
      nomeConta.includes("CREDITO") ||
      nomeConta.includes("CRÉDITO")
    );
  });

  const fixasDebito = pagamentos.filter((p) => {
    const nomeCategoria = (p.categoriaNome || "").toUpperCase();
    const nomeConta = (p.conta?.nome || "").toUpperCase();
    return (
      !nomeCategoria.includes("CARTAO") &&
      !nomeCategoria.includes("CARTÃO") &&
      !nomeConta.includes("CREDITO") &&
      !nomeConta.includes("CRÉDITO")
    );
  });

  const totalDebito = fixasDebito.reduce((sum, i) => sum + (i.valor || 0), 0);
  const totalCredito = fixasCredito.reduce((sum, i) => sum + (i.valor || 0), 0);

  // 🔹 Render principal
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8">

      {/* ==========================
          CABEÇALHO
      ========================== */}
      <header className="mb-10 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-950 to-black p-6 shadow-lg border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">

          {/* 🔸 Título e subtítulo */}
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Painel Financeiro
            </h1>
            <p className="text-2xl sm:text-3xl font-assinatura text-amber-400 mt-1">
              Família Bertão
            </p>
          </div>

          {/* 🔸 Filtros de mês e ano */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 mt-6 sm:mt-0 justify-center">
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 text-gray-100 p-2 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              {meses.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>

            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 text-gray-100 p-2 rounded-lg w-24 focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </header>

      {/* ==========================
          CARDS DE RESUMO
      ========================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card cor="green" titulo="Receitas" valor={resumo.totalReceitas} Icon={ArrowUpCircleIcon} />
        <Card cor="red" titulo="Despesas Variáveis" valor={resumo.totalDespesas} Icon={ArrowDownCircleIcon} />
        <Card cor="yellow" titulo="Despesas Fixas" valor={resumo.totalFixas} Icon={ExclamationTriangleIcon} />
        <Card cor="blue" titulo="Saldo" valor={resumo.saldo} Icon={CurrencyDollarIcon} />
      </div>

      {/* ==========================
          GRÁFICOS DE RECEITAS
      ========================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Section titulo="Receitas por Categoria">
          <PieBox data={resumo.receitasCategorias} colors={COLORS_RECEITAS} formatCurrency={formatCurrency} />
        </Section>

        <Section titulo="Receitas por Responsável">
          <PieBox data={resumo.receitasResponsaveis} colors={COLORS_RECEITAS} formatCurrency={formatCurrency} />
        </Section>
      </div>

      {/* ==========================
          DESPESAS VARIÁVEIS + CHECKLIST
      ========================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

        {/* 🔸 Gráficos principais */}
        <div className="lg:col-span-2 space-y-6">
          <Section titulo="Despesas Variáveis por Categoria">
            <PieBox data={resumo.categorias} colors={COLORS_DESPESAS} formatCurrency={formatCurrency} />
          </Section>

          <Section titulo="Despesas Variáveis por Responsável">
            <PieBox data={resumo.responsaveis} colors={COLORS_DESPESAS} formatCurrency={formatCurrency} />
          </Section>
        </div>

        {/* 🔸 Checklist lateral */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 shadow-lg rounded-2xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-3 text-gray-100">📋 Pagamentos do Mês</h2>

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

      {/* ==========================
          DESPESAS FIXAS
      ========================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Section titulo="Despesas Fixas por Categoria">
          <PieBox data={resumo.fixasCategorias} colors={COLORS_FIXAS} formatCurrency={formatCurrency} />
        </Section>

        <Section titulo="Despesas Fixas por Responsável">
          <PieBox data={resumo.fixasResponsaveis} colors={COLORS_FIXAS} formatCurrency={formatCurrency} />
        </Section>
      </div>

      {/* ==========================
          GRÁFICO DE EVOLUÇÃO MENSAL
      ========================== */}
      <Section titulo="📈 Evolução Mensal">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={resumo.mensal}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="mes" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Legend />
            <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
            <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
            <Bar dataKey="fixas" fill="#facc15" name="Fixas" />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* ==========================
          ÚLTIMOS LANÇAMENTOS
      ========================== */}
      <Section titulo="📅 Últimos Lançamentos do Mês">
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

/* ==========================
    COMPONENTES AUXILIARES
========================== */

function Card({ cor, titulo, valor, Icon }) {
  const corTexto = {
    green: "text-green-400",
    red: "text-red-400",
    yellow: "text-yellow-400",
    blue: "text-blue-400",
  }[cor];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 shadow-lg rounded-2xl p-6 flex items-center space-x-4">
      <Icon className={`h-10 w-10 ${corTexto}`} />
      <div>
        <p className="text-sm text-gray-400 uppercase tracking-wide">{titulo}</p>
        <p className={`text-2xl font-semibold ${corTexto}`}>
          R$ {Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}

function Section({ titulo, children }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 shadow-lg rounded-2xl p-6 transition-all duration-300">
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
    <div className="mb-4">
      <h3 className="text-sm text-gray-400 font-semibold mb-2 border-b border-gray-800 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {titulo.includes("Débito") && <span className="text-amber-400">💰</span>}
          {titulo.includes("Crédito") && <span className="text-blue-400">💳</span>}
          <span>{titulo}</span>
        </div>
        <span className="text-gray-300 text-sm font-medium">
          {formatCurrency(total)}
        </span>
      </h3>

      <div className={`space-y-1 ${lista.length > 8 ? "overflow-y-auto max-h-[360px]" : "overflow-y-visible"}`}>
        {lista.length === 0 ? (
          <p className="text-gray-500 text-xs italic">Nenhum lançamento encontrado.</p>
        ) : (
          lista.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.pago}
                  onChange={() => togglePago(item.id)}
                  className="form-checkbox text-green-500 rounded-md h-5 w-5"
                />
                <span className={`truncate ${item.pago ? "text-green-400 line-through" : "text-gray-200"}`}>
                  {item.descricao}
                </span>
              </label>
              <div className="text-right">
                <p className="text-sm text-gray-400">{dayjs(item.data).format("DD/MM")}</p>
                <p className="text-sm font-medium">{formatCurrency(item.valor)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
