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

  const handleFiltroChange = (e) =>
    setFiltros({ ...filtros, [e.target.name]: e.target.value });

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
  const formatCurrency = (v) =>
    `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const renderLabel = ({ name, percent, value }) =>
    `${name} - ${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)`;
  const meses = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100 p-8 pb-24">
      {/* Cabeçalho */}
      <header className="mb-10 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-950 to-black p-6 shadow-[0_0_25px_rgba(0,0,0,0.7)] border border-gray-800 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-5xl font-bold text-white leading-tight drop-shadow-[0_2px_6px_rgba(255,255,255,0.2)]">
              Painel Financeiro
            </h1>
            <p className="text-3xl font-assinatura text-amber-400 mt-1 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
              Família Bertão
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 mt-6 sm:mt-0">
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-gray-800/70 border border-gray-700 text-gray-100 p-2 rounded-lg focus:ring-2 focus:ring-amber-500 backdrop-blur-sm"
            >
              {meses.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="bg-gray-800/70 border border-gray-700 text-gray-100 p-2 rounded-lg w-24 focus:ring-2 focus:ring-amber-500 backdrop-blur-sm"
            />
            <button
              onClick={abrirModalFiltros}
              className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-300"
            >
              📊 Exportar Relatório
            </button>
          </div>
        </div>
      </header>

      {/* Modal Filtros */}
      {showFiltros && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800/90 p-6 rounded-xl shadow-2xl w-96 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-100 text-center">
              Filtros do Relatório
            </h2>
            <div className="space-y-3">
              {[
                { name: "tipo", options: [
                  {value:"",label:"Todos os tipos"},
                  {value:"RECEITA",label:"Receitas"},
                  {value:"DESPESA",label:"Despesas"}
                ]},
              ].map((s)=>(<select key={s.name} name={s.name} value={filtros[s.name]} onChange={handleFiltroChange}
                className="w-full bg-gray-700/80 p-2 rounded text-gray-100 border border-gray-600 focus:ring-2 focus:ring-amber-500">
                {s.options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>))}
              <select name="categoriaId" value={filtros.categoriaId} onChange={handleFiltroChange}
                className="w-full bg-gray-700/80 p-2 rounded text-gray-100 border border-gray-600">
                <option value="">Todas as categorias</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <select name="responsavelId" value={filtros.responsavelId} onChange={handleFiltroChange}
                className="w-full bg-gray-700/80 p-2 rounded text-gray-100 border border-gray-600">
                <option value="">Todos os responsáveis</option>
                {responsaveis.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
              </select>
              <select name="contaId" value={filtros.contaId} onChange={handleFiltroChange}
                className="w-full bg-gray-700/80 p-2 rounded text-gray-100 border border-gray-600">
                <option value="">Todas as contas</option>
                {contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={exportarRelatorio}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded shadow-md hover:shadow-[0_0_12px_rgba(34,197,94,0.5)] transition-all">Gerar Excel</button>
              <button onClick={() => setShowFiltros(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          {title:"Receitas",value:resumo.totalReceitas,icon:<ArrowUpCircleIcon className="h-10 w-10 text-green-400"/>,color:"green"},
          {title:"Despesas Variáveis",value:resumo.totalDespesas,icon:<ArrowDownCircleIcon className="h-10 w-10 text-red-400"/>,color:"red"},
          {title:"Despesas Fixas",value:resumo.totalFixas,icon:<ExclamationTriangleIcon className="h-10 w-10 text-yellow-400"/>,color:"yellow"},
          {title:"Saldo",value:resumo.saldo,icon:<CurrencyDollarIcon className="h-10 w-10 text-blue-400"/>,color:"blue"},
        ].map((c,i)=>(
          <div key={i} className={`relative overflow-hidden rounded-2xl p-6 flex items-center space-x-4 transition-all duration-300
            bg-gray-900/70 backdrop-blur-sm border border-${c.color}-400/30 shadow-[0_0_25px_rgba(0,0,0,0.5)]
            hover:shadow-${c.color}-500/30 hover:scale-[1.02]`}>
            <div className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{c.icon}</div>
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wide">{c.title}</p>
              <p className={`text-2xl font-semibold text-${c.color}-400`}>
                {formatCurrency(c.value)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos principais e lançamentos mantidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/80 p-6 rounded-xl shadow-lg border border-gray-700 min-h-[350px]">
          <h2 className="text-lg font-semibold mb-4">Despesas Variáveis por Categoria</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={resumo.categorias||[]} cx="50%" cy="50%" outerRadius={100} dataKey="total" nameKey="nome" label={renderLabel}>
                {resumo.categorias?.map((_,i)=><Cell key={i} fill={COLORS_DESPESAS[i%COLORS_DESPESAS.length]}/>)}
              </Pie><Tooltip formatter={(v)=>formatCurrency(v)}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800/80 p-6 rounded-xl shadow-lg border border-gray-700 min-h-[350px]">
          <h2 className="text-lg font-semibold mb-4">Despesas Variáveis por Responsável</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={resumo.responsaveis||[]} cx="50%" cy="50%" outerRadius={100} dataKey="total" nameKey="nome" label={renderLabel}>
                {resumo.responsaveis?.map((_,i)=><Cell key={i} fill={COLORS_DESPESAS[i%COLORS_DESPESAS.length]}/>)}
              </Pie><Tooltip formatter={(v)=>formatCurrency(v)}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico mensal */}
      <div className="bg-gray-800/80 p-6 rounded-xl shadow-lg border border-gray-700 mt-8">
        <h2 className="text-lg font-semibold mb-4">Receitas vs Despesas (Mensal)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={resumo.mensal||[]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="mes" /><YAxis />
            <Tooltip formatter={(v)=>formatCurrency(v)} /><Legend />
            <Bar dataKey="receitas" fill="#34d399" name="Receitas" />
            <Bar dataKey="variaveis" fill="#f87171" name="Variáveis" />
            <Bar dataKey="fixas" fill="#facc15" name="Fixas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Últimos lançamentos */}
      <div className="bg-gray-800/80 p-6 rounded-xl shadow-lg border border-gray-700 mt-8">
        <h2 className="text-lg font-semibold mb-4">Últimos Lançamentos</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700">
              <th className="p-2">Data</th><th className="p-2">Descrição</th><th className="p-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {resumo.ultimosLancamentos?.length>0?(
              resumo.ultimosLancamentos.map((l,idx)=>(
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                  <td className="p-2">{dayjs(l.data).isValid()?dayjs(l.data).format("DD/MM/YYYY"):l.data}</td>
                  <td className="p-2">{l.descricao}</td>
                  <td className={`p-2 font-semibold ${l.tipo==="RECEITA"?"text-green-400":"text-red-400"}`}>
                    {formatCurrency(l.valor)}
                  </td>
                </tr>
              ))
            ):(
              <tr><td colSpan="3" className="p-4 text-center text-gray-400">Nenhum lançamento encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
