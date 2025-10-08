import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
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

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
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

  const formatCurrency = (value) =>
    `R$ ${Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      {/* 🔹 Cabeçalho */}
      <header className="mb-10 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-950 to-black p-6 shadow-lg border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-5xl font-bold text-white leading-tight">Painel Financeiro</h1>
            <p className="text-3xl font-assinatura text-amber-400 mt-1">Família Bertão</p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 mt-6 sm:mt-0">
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
              📊 Exportar Relatório
            </button>
          </div>
        </div>
      </header>

      {/* 🔹 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-green-400/30 shadow-lg rounded-2xl p-6 flex items-center space-x-4">
          <ArrowUpCircleIcon className="h-10 w-10 text-green-400" />
          <div>
            <p className="text-sm text-gray-400 uppercase">Receitas</p>
            <p className="text-2xl font-semibold text-green-400">{formatCurrency(resumo.totalReceitas)}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-red-400/30 shadow-lg rounded-2xl p-6 flex items-center space-x-4">
          <ArrowDownCircleIcon className="h-10 w-10 text-red-400" />
          <div>
            <p className="text-sm text-gray-400 uppercase">Despesas Variáveis</p>
            <p className="text-2xl font-semibold text-red-400">{formatCurrency(resumo.totalDespesas)}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-yellow-400/30 shadow-lg rounded-2xl p-6 flex items-center space-x-4">
          <ExclamationTriangleIcon className="h-10 w-10 text-yellow-400" />
          <div>
            <p className="text-sm text-gray-400 uppercase">Despesas Fixas</p>
            <p className="text-2xl font-semibold text-yellow-400">{formatCurrency(resumo.totalFixas)}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-blue-400/30 shadow-lg rounded-2xl p-6 flex items-center space-x-4">
          <CurrencyDollarIcon className="h-10 w-10 text-blue-400" />
          <div>
            <p className="text-sm text-gray-400 uppercase">Saldo</p>
            <p className="text-2xl font-semibold text-blue-400">{formatCurrency(resumo.saldo)}</p>
          </div>
        </div>
      </div>

      {/* 🔹 Gráficos (Variáveis / Fixas / Receitas / Comparativo) */}
      {/* --- Despesas Variáveis --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GraficoPizza titulo="Despesas Variáveis por Categoria" cor="red" data={resumo.categorias} />
        <GraficoPizza titulo="Despesas Variáveis por Responsável" cor="red" data={resumo.responsaveis} />
      </div>

      {/* --- Despesas Fixas --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <GraficoPizza titulo="Despesas Fixas por Categoria" cor="yellow" data={resumo.fixasCategorias} />
        <GraficoPizza titulo="Despesas Fixas por Responsável" cor="yellow" data={resumo.fixasResponsaveis} />
      </div>

      {/* --- Receitas --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <GraficoPizza titulo="Receitas por Categoria" cor="green" data={resumo.receitasCategorias} />
        <GraficoPizza titulo="Receitas por Responsável" cor="green" data={resumo.receitasResponsaveis} />
      </div>

      {/* --- Gráfico Mensal --- */}
      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-blue-400/20 mt-8">
        <h2 className="text-lg font-semibold mb-4 text-blue-400">Receitas vs Despesas (Mensal)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={resumo.mensal || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="mes" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
              formatter={(v) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            />
            <Legend />
            <Bar dataKey="receitas" fill="#34d399" name="Receitas" radius={[6, 6, 0, 0]} />
            <Bar dataKey="variaveis" fill="#f87171" name="Variáveis" radius={[6, 6, 0, 0]} />
            <Bar dataKey="fixas" fill="#facc15" name="Fixas" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* --- Últimos Lançamentos --- */}
      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700 mt-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Últimos Lançamentos</h2>
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
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-800 transition">
                  <td className="p-2">{dayjs(l.data).format("DD/MM/YYYY")}</td>
                  <td className="p-2">{l.descricao}</td>
                  <td
                    className={`p-2 font-semibold ${
                      l.tipo === "RECEITA" ? "text-emerald-400" : "text-red-400"
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

/* 🔹 Componente auxiliar de gráfico de pizza */
function GraficoPizza({ titulo, cor, data }) {
  const cores = {
    red: ["#b91c1c", "#dc2626", "#ef4444", "#f87171"],
    yellow: ["#ca8a04", "#facc15", "#eab308", "#fcd34d"],
    green: ["#10b981", "#34d399", "#059669", "#047857"],
  };

  return (
    <div
      className={`bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 p-6 rounded-2xl shadow-lg border border-${cor}-500/10 hover:border-${cor}-500/30 transition-all duration-300`}
    >
      <h2 className={`text-lg font-semibold mb-4 text-${cor}-400`}>
        {titulo}
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data || []}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="total"
            nameKey="nome"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            labelLine={false}
          >
            {data?.map((_, i) => <Cell key={i} fill={cores[cor][i % 4]} />)}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
            formatter={(v) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
