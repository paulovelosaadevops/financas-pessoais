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
import api from "../api"; // ✅ usa configuração global de axios

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

  const COLORS_RECEITAS = ["#34d399", "#10b981", "#059669", "#047857"];
  const COLORS_DESPESAS = ["#f87171", "#ef4444", "#dc2626", "#b91c1c"];
  const COLORS_FIXAS = ["#facc15", "#eab308", "#ca8a04", "#a16207"];

  const formatCurrency = (value) =>
    `R$ ${Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const renderLabel = ({ name, percent, value }) =>
    `${name} - ${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)`;

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="min-h-screen bg-[#0b0e17] text-gray-100 p-8">
      {/* 🔹 Cabeçalho */}
      <header className="mb-10 rounded-xl bg-gradient-to-r from-[#0d0f1a] via-[#0b0d17] to-black p-6 shadow-lg border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Painel Financeiro
            </h1>
            <p className="text-2xl font-assinatura text-amber-400 mt-1 italic">
              Família Bertão
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 mt-6 sm:mt-0">
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-[#161a25] border border-gray-700 text-gray-100 p-2 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              {meses.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>

            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="bg-[#161a25] border border-gray-700 text-gray-100 p-2 rounded-lg w-24 focus:ring-2 focus:ring-amber-500"
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

      {/* 🔹 Modal Filtros */}
      {showFiltros && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#161a25] p-6 rounded-xl shadow-xl w-96 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-100 text-center">
              Filtros do Relatório
            </h2>

            <div className="space-y-3">
              <select
                name="tipo"
                value={filtros.tipo}
                onChange={handleFiltroChange}
                className="w-full bg-[#1b1f2c] p-2 rounded text-gray-100 border border-gray-600"
              >
                <option value="">Todos os tipos</option>
                <option value="RECEITA">Receitas</option>
                <option value="DESPESA">Despesas</option>
              </select>

              <select
                name="categoriaId"
                value={filtros.categoriaId}
                onChange={handleFiltroChange}
                className="w-full bg-[#1b1f2c] p-2 rounded text-gray-100 border border-gray-600"
              >
                <option value="">Todas as categorias</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>

              <select
                name="responsavelId"
                value={filtros.responsavelId}
                onChange={handleFiltroChange}
                className="w-full bg-[#1b1f2c] p-2 rounded text-gray-100 border border-gray-600"
              >
                <option value="">Todos os responsáveis</option>
                {responsaveis.map((r) => (
                  <option key={r.id} value={r.id}>{r.nome}</option>
                ))}
              </select>

              <select
                name="contaId"
                value={filtros.contaId}
                onChange={handleFiltroChange}
                className="w-full bg-[#1b1f2c] p-2 rounded text-gray-100 border border-gray-600"
              >
                <option value="">Todas as contas</option>
                {contas.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={exportarRelatorio}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
              >
                Gerar Excel
              </button>
              <button
                onClick={() => setShowFiltros(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Cards Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          {
            title: "Receitas",
            value: resumo.totalReceitas,
            color: "green",
            icon: <ArrowUpCircleIcon className="h-8 w-8 text-green-400" />,
          },
          {
            title: "Despesas Variáveis",
            value: resumo.totalDespesas,
            color: "red",
            icon: <ArrowDownCircleIcon className="h-8 w-8 text-red-400" />,
          },
          {
            title: "Despesas Fixas",
            value: resumo.totalFixas,
            color: "yellow",
            icon: <ExclamationTriangleIcon className="h-8 w-8 text-yellow-400" />,
          },
          {
            title: "Saldo",
            value: resumo.saldo,
            color: "blue",
            icon: <CurrencyDollarIcon className="h-8 w-8 text-blue-400" />,
          },
        ].map((card, i) => (
          <div
            key={i}
            className={`bg-[#10141f] border border-${card.color}-400/30 rounded-xl p-5 flex items-center space-x-4 shadow-md hover:shadow-${card.color}-500/30 transition-all duration-300`}
          >
            <div className="flex-shrink-0 bg-[#0c0f18] rounded-full p-2">
              {card.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                {card.title}
              </p>
              <p className={`text-xl font-semibold text-${card.color}-400`}>
                {formatCurrency(card.value)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartBox title="Despesas Variáveis por Categoria" data={resumo.categorias} colors={COLORS_DESPESAS} renderLabel={renderLabel} formatCurrency={formatCurrency} />
        <ChartBox title="Despesas Variáveis por Responsável" data={resumo.responsaveis} colors={COLORS_DESPESAS} renderLabel={renderLabel} formatCurrency={formatCurrency} />
        <ChartBox title="Despesas Fixas por Categoria" data={resumo.fixasCategorias} colors={COLORS_FIXAS} renderLabel={renderLabel} formatCurrency={formatCurrency} />
        <ChartBox title="Despesas Fixas por Responsável" data={resumo.fixasResponsaveis} colors={COLORS_FIXAS} renderLabel={renderLabel} formatCurrency={formatCurrency} />
        <ChartBox title="Receitas por Categoria" data={resumo.receitasCategorias} colors={COLORS_RECEITAS} renderLabel={renderLabel} formatCurrency={formatCurrency} />
        <ChartBox title="Receitas por Responsável" data={resumo.receitasResponsaveis} colors={COLORS_RECEITAS} renderLabel={renderLabel} formatCurrency={formatCurrency} />
      </div>

      {/* 🔹 Gráfico Mensal */}
      <div className="bg-[#10141f] p-6 rounded-xl shadow-md border border-gray-800 mt-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-100">Receitas vs Despesas (Mensal)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={resumo.mensal || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
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

      {/* 🔹 Últimos Lançamentos */}
      <div className="bg-[#10141f] p-6 rounded-xl shadow-md border border-gray-800 mt-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-100">Últimos Lançamentos</h2>
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
                <tr key={idx} className="border-b border-gray-700 hover:bg-[#161a25] transition-colors">
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

/* 🔹 Componente reutilizável para gráficos */
function ChartBox({ title, data, colors, renderLabel, formatCurrency }) {
  return (
    <div className="bg-[#10141f] p-6 rounded-xl shadow-md border border-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-100">{title}</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data || []}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="total"
            nameKey="nome"
            label={renderLabel}
          >
            {data?.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatCurrency(v)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
