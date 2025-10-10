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
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo: "",
    categoriaId: "",
    responsavelId: "",
    contaId: "",
  });

  const [categorias, setCategorias] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [contas, setContas] = useState([]);

  useEffect(() => {
    carregarResumo();
  }, [mes, ano]);

  const carregarResumo = () => {
    setResumo({
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

    api
      .get(`/dashboard?ano=${ano}&mes=${mes}`)
      .then((res) => setResumo(res.data))
      .catch((err) => console.error("Erro ao carregar resumo:", err));
  };

  const abrirModalFiltros = async () => {
    setShowFiltros(true);
    if (categorias.length && responsaveis.length && contas.length) return;

    try {
      const [catRes, respRes, contRes] = await Promise.all([
        api.get("/categorias"),
        api.get("/parametros/responsaveis"),
        api.get("/parametros/contas"),
      ]);
      setCategorias(catRes.data || []);
      setResponsaveis(respRes.data || []);
      setContas(contRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar listas de filtros:", error);
    }
  };

  const exportarRelatorio = async () => {
    try {
      const params = new URLSearchParams();
      params.append("mes", mes);
      params.append("ano", ano);
      if (filtros.tipo) params.append("tipo", filtros.tipo);
      if (filtros.categoriaId) params.append("categoriaId", filtros.categoriaId);
      if (filtros.responsavelId) params.append("responsavelId", filtros.responsavelId);
      if (filtros.contaId) params.append("contaId", filtros.contaId);

      const response = await api.get(`/relatorios/exportar?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `relatorio-lancamentos-${mes}-${ano}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowFiltros(false);
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      alert("Falha ao gerar o relatório. Verifique o backend.");
    }
  };

  const COLORS_RECEITAS = ["#34d399", "#10b981", "#059669", "#047857"];
  const COLORS_DESPESAS = ["#f87171", "#ef4444", "#dc2626", "#b91c1c"];
  const COLORS_FIXAS = ["#facc15", "#eab308", "#ca8a04", "#a16207"];

  const formatCurrency = (value) =>
    `R$ ${Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8">

      {/* 🔹 Cabeçalho */}
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

            <button
              onClick={abrirModalFiltros}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow transition-all duration-200"
            >
              📊 Exportar
            </button>
          </div>
        </div>
      </header>

      {/* 🔹 Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card cor="green" titulo="Receitas" valor={resumo.totalReceitas} Icon={ArrowUpCircleIcon} />
        <Card cor="red" titulo="Despesas Variáveis" valor={resumo.totalDespesas} Icon={ArrowDownCircleIcon} />
        <Card cor="yellow" titulo="Despesas Fixas" valor={resumo.totalFixas} Icon={ExclamationTriangleIcon} />
        <Card cor="blue" titulo="Saldo" valor={resumo.saldo} Icon={CurrencyDollarIcon} />
      </div>

      {/* 🔹 Gráficos responsivos */}
      <div className="md:grid md:grid-cols-2 gap-6 flex overflow-x-auto space-x-4 md:space-x-0 snap-x snap-mandatory md:overflow-visible pb-4">
        <Section titulo="Despesas Variáveis por Categoria">
          <PieBox data={resumo.categorias} colors={COLORS_DESPESAS} formatCurrency={formatCurrency} />
        </Section>

        <Section titulo="Despesas Variáveis por Responsável">
          <PieBox data={resumo.responsaveis} colors={COLORS_DESPESAS} formatCurrency={formatCurrency} />
        </Section>

        <Section titulo="Despesas Fixas por Categoria">
          <PieBox data={resumo.fixasCategorias} colors={COLORS_FIXAS} formatCurrency={formatCurrency} />
        </Section>

        <Section titulo="Despesas Fixas por Responsável">
          <PieBox data={resumo.fixasResponsaveis} colors={COLORS_FIXAS} formatCurrency={formatCurrency} />
        </Section>

        <Section titulo="Receitas por Categoria">
          <PieBox data={resumo.receitasCategorias} colors={COLORS_RECEITAS} formatCurrency={formatCurrency} />
        </Section>

        <Section titulo="Receitas por Responsável">
          <PieBox data={resumo.receitasResponsaveis} colors={COLORS_RECEITAS} formatCurrency={formatCurrency} />
        </Section>
      </div>

      {/* 🔹 Gráfico Mensal */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-blue-400/20 shadow-lg hover:shadow-blue-500/20 rounded-2xl p-4 sm:p-6 mt-10 transition-all duration-300">
        <h2 className="text-lg font-semibold mb-4 text-gray-100 text-center sm:text-left">
          Receitas vs Despesas (Mensal)
        </h2>
        <div className="w-full h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={resumo.mensal || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="mes" tick={{ fill: "#ccc", fontSize: 12 }} />
              <YAxis tick={{ fill: "#ccc", fontSize: 12 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="receitas" fill="#34d399" name="Receitas" />
              <Bar dataKey="variaveis" fill="#f87171" name="Variáveis" />
              <Bar dataKey="fixas" fill="#facc15" name="Fixas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🔹 Últimos lançamentos */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 shadow-lg hover:shadow-amber-400/10 rounded-2xl p-4 sm:p-6 mt-10 transition-all duration-300">
        <h2 className="text-lg font-semibold mb-4 text-gray-100 text-center sm:text-left">
          Últimos Lançamentos
        </h2>

        {/* 🧾 Layout tabela → cards no mobile */}
        <div className="hidden sm:block">
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
                  <tr key={idx} className="border-b border-gray-700 hover:bg-gray-800/40 transition-colors">
                    <td className="p-2">{dayjs(l.data).format("DD/MM/YYYY")}</td>
                    <td className="p-2">{l.descricao}</td>
                    <td className={`p-2 font-semibold ${l.tipo === "RECEITA" ? "text-green-400" : "text-red-400"}`}>
                      {formatCurrency(l.valor)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="p-4 text-center text-gray-400">Nenhum lançamento encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🪶 Mobile cards */}
        <div className="sm:hidden space-y-3">
          {resumo.ultimosLancamentos?.length > 0 ? (
            resumo.ultimosLancamentos.map((l, idx) => (
              <div key={idx} className="bg-gray-800/60 rounded-xl p-3 border border-gray-700 flex flex-col">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{dayjs(l.data).format("DD/MM/YYYY")}</span>
                  <span className={l.tipo === "RECEITA" ? "text-green-400" : "text-red-400"}>
                    {l.tipo === "RECEITA" ? "Receita" : "Despesa"}
                  </span>
                </div>
                <p className="text-gray-100 text-base font-medium mt-1">{l.descricao}</p>
                <p className={`text-lg font-semibold ${l.tipo === "RECEITA" ? "text-green-400" : "text-red-400"} mt-1`}>
                  {formatCurrency(l.valor)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">Nenhum lançamento encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* 🔹 Subcomponentes */
function Card({ cor, titulo, valor, Icon }) {
  const corBorda = {
    green: "border-green-400/30 hover:shadow-green-500/20",
    red: "border-red-400/30 hover:shadow-red-500/20",
    yellow: "border-yellow-400/30 hover:shadow-yellow-500/20",
    blue: "border-blue-400/30 hover:shadow-blue-500/20",
  }[cor];

  const corTexto = {
    green: "text-green-400",
    red: "text-red-400",
    yellow: "text-yellow-400",
    blue: "text-blue-400",
  }[cor];

  return (
    <div className={`bg-gradient-to-br from-gray-900 to-gray-950 border ${corBorda} shadow-lg rounded-2xl p-6 flex items-center space-x-4 transition-all duration-300`}>
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
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 shadow-lg hover:shadow-amber-400/10 rounded-2xl p-6 transition-all duration-300">
      <h2 className="text-lg font-semibold mb-4 text-gray-100">{titulo}</h2>
      {children}
    </div>
  );
}

/* ✅ PieBox com labels no desktop, legenda ordenada no mobile */
function PieBox({ data, colors, formatCurrency }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const outerRadius = isMobile ? 70 : 100;
  const sortedData = Array.isArray(data)
    ? [...data].sort((a, b) => (b.total || 0) - (a.total || 0))
    : [];
  const totalGeral = sortedData.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={isMobile ? 240 : 280}>
        <PieChart>
          <Pie
            data={sortedData}
            cx="50%"
            cy="50%"
            outerRadius={outerRadius}
            dataKey="total"
            nameKey="nome"
            label={!isMobile ? ({ name, percent, value }) =>
              `${name} - ${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)`
            : false}
          >
            {sortedData.map((entry, i) => (
              <Cell key={`${entry.nome}-${i}`} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatCurrency(v)} />
        </PieChart>
      </ResponsiveContainer>

      {/* 🔹 Legenda fixa e ordenada no mobile */}
      {isMobile && sortedData.length > 0 && (
        <ul className="mt-3 w-full text-sm text-gray-300 space-y-1">
          {sortedData.map((item, i) => {
            const percent = totalGeral ? ((item.total / totalGeral) * 100).toFixed(1) : 0;
            return (
              <li key={i} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                <span className="truncate">{item.nome} — {formatCurrency(item.total)} ({percent}%)</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

{/* 🔹 Modal de Filtros para Exportar Relatório */}
{showFiltros && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 w-[90%] max-w-md animate-fadeIn">
      <h2 className="text-xl font-semibold text-gray-100 mb-4 text-center">
        Exportar Relatório
      </h2>

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Tipo</label>
          <select
            value={filtros.tipo}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-2 rounded-lg"
          >
            <option value="">Todos</option>
            <option value="RECEITA">Receita</option>
            <option value="DESPESA">Despesa</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Categoria</label>
          <select
            value={filtros.categoriaId}
            onChange={(e) =>
              setFiltros({ ...filtros, categoriaId: e.target.value })
            }
            className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-2 rounded-lg"
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Responsável</label>
          <select
            value={filtros.responsavelId}
            onChange={(e) =>
              setFiltros({ ...filtros, responsavelId: e.target.value })
            }
            className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-2 rounded-lg"
          >
            <option value="">Todos</option>
            {responsaveis.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Conta/Cartão</label>
          <select
            value={filtros.contaId}
            onChange={(e) =>
              setFiltros({ ...filtros, contaId: e.target.value })
            }
            className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-2 rounded-lg"
          >
            <option value="">Todas</option>
            {contas.map((conta) => (
              <option key={conta.id} value={conta.id}>
                {conta.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setShowFiltros(false)}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
        >
          Cancelar
        </button>
        <button
          onClick={exportarRelatorio}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Gerar Excel
        </button>
      </div>
    </div>
  </div>
)}
