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

  // 🔹 Controle do modal e filtros
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo: "",
    categoriaId: "",
    responsavelId: "",
    contaId: "",
  });

  // 🔹 Listas carregadas apenas quando o modal é aberto
  const [categorias, setCategorias] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [contas, setContas] = useState([]);

  useEffect(() => {
    carregarResumo();
  }, [mes, ano]);

  const carregarResumo = () => {
    // 🔹 limpa antes de buscar novo mês
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

  // 🔹 Quando abrir o modal, carrega listas
  const abrirModalFiltros = async () => {
    setShowFiltros(true);

    // Se já carregou antes, não chama de novo
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

  // ✅ Exportar relatório com filtros
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
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">

    {/* 🔹 Cabeçalho refinado com efeito dourado sutil */}
    <header className="mb-10 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-950 to-black p-6 shadow-lg border border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        {/* Título principal */}
        <div>
          <h1
            className="text-6xl font-assinatura leading-none relative inline-block bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent animate-golden-glow"
            style={{
              textShadow: "0 0 6px rgba(255, 204, 0, 0.3)",
            }}
          >
            Família Bertão
          </h1>

          <p className="text-lg text-gray-100 font-medium mt-1 tracking-wide">
            Painel Financeiro
          </p>
        </div>

        {/* Período à direita */}
        <div className="mt-4 sm:mt-0 text-sm text-gray-400 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
          {meses[mes - 1]} / {ano}
        </div>
      </div>
    </header>


      {/* 🔹 Filtros de mês/ano + botão exportar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
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

        <button
          onClick={abrirModalFiltros}
          className="ml-auto bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow transition-all duration-200"
        >
          📊 Exportar Relatório ({meses[mes - 1]} {ano})
        </button>
      </div>

      {/* 🔹 Modal de filtros */}
      {showFiltros && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-96">
            <h2 className="text-lg font-semibold mb-4 text-gray-100 text-center">
              Filtros do Relatório
            </h2>

            <div className="space-y-3">
              {/* Tipo */}
              <select
                name="tipo"
                value={filtros.tipo}
                onChange={handleFiltroChange}
                className="w-full bg-gray-700 p-2 rounded text-gray-100"
              >
                <option value="">Todos os tipos</option>
                <option value="RECEITA">Receitas</option>
                <option value="DESPESA">Despesas</option>
              </select>

              {/* Categoria */}
              <select
                name="categoriaId"
                value={filtros.categoriaId}
                onChange={handleFiltroChange}
                className="w-full bg-gray-700 p-2 rounded text-gray-100"
              >
                <option value="">Todas as categorias</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>

              {/* Responsável */}
              <select
                name="responsavelId"
                value={filtros.responsavelId}
                onChange={handleFiltroChange}
                className="w-full bg-gray-700 p-2 rounded text-gray-100"
              >
                <option value="">Todos os responsáveis</option>
                {responsaveis.map((r) => (
                  <option key={r.id} value={r.id}>{r.nome}</option>
                ))}
              </select>

              {/* Conta */}
              <select
                name="contaId"
                value={filtros.contaId}
                onChange={handleFiltroChange}
                className="w-full bg-gray-700 p-2 rounded text-gray-100"
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

      {/* 🔹 Cards resumo */}
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

      {/* 🔹 Gráficos Despesas Variáveis */}
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

      {/* 🔹 Despesas Fixas */}
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

      {/* 🔹 Receitas */}
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

      {/* 🔹 Gráfico mensal */}
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

      {/* 🔹 Últimos lançamentos */}
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
