import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
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
  const [categorias, setCategorias] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);

  useEffect(() => {
    carregarCategorias();
  }, []);

  useEffect(() => {
    carregarResumo();
    carregarPagamentosFixos();
  }, [mes, ano, categorias]);

  const carregarCategorias = async () => {
    try {
      const res = await api.get("/categorias");
      setCategorias(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
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

        setPagamentos(fixas.sort((a, b) => dayjs(a.data).date() - dayjs(b.data).date()));
      } else {
        setPagamentos([]);
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

  const COLORS_RECEITAS = ["#34d399", "#10b981", "#059669", "#047857"];
  const COLORS_DESPESAS = ["#f87171", "#ef4444", "#dc2626", "#b91c1c"];
  const COLORS_FIXAS = ["#facc15", "#eab308", "#ca8a04", "#a16207"];
  const formatCurrency = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8">
      {/* Cabeçalho */}
      <header className="mb-10 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-950 to-black p-6 shadow-lg border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">Painel Financeiro</h1>
            <p className="text-2xl sm:text-3xl font-assinatura text-amber-400 mt-1">Família Bertão</p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 mt-6 sm:mt-0 justify-center">
            <select value={mes} onChange={(e) => setMes(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 text-gray-100 p-2 rounded-lg focus:ring-2 focus:ring-amber-500">
              {meses.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
            <input type="number" value={ano} onChange={(e) => setAno(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 text-gray-100 p-2 rounded-lg w-24 focus:ring-2 focus:ring-amber-500"/>
          </div>
        </div>
      </header>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card cor="green" titulo="Receitas" valor={resumo.totalReceitas} Icon={ArrowUpCircleIcon} />
        <Card cor="red" titulo="Despesas Variáveis" valor={resumo.totalDespesas} Icon={ArrowDownCircleIcon} />
        <Card cor="yellow" titulo="Despesas Fixas" valor={resumo.totalFixas} Icon={ExclamationTriangleIcon} />
        <Card cor="blue" titulo="Saldo" valor={resumo.saldo} Icon={CurrencyDollarIcon} />
      </div>

      {/* Gráficos de despesas + checklist lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Gráficos */}
        <div className="lg:col-span-2 space-y-6">
          <Section titulo="Despesas Variáveis por Categoria">
            <PieBox data={resumo.categorias} colors={COLORS_DESPESAS} formatCurrency={formatCurrency} />
          </Section>
          <Section titulo="Despesas Variáveis por Responsável">
            <PieBox data={resumo.responsaveis} colors={COLORS_DESPESAS} formatCurrency={formatCurrency} />
          </Section>
        </div>

        {/* Checklist */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 shadow-lg rounded-2xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-3 text-gray-100">📋 Pagamentos do Mês</h2>
          {(() => {
            const normalize = (str) => (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
            const fixasCredito = pagamentos.filter((p) => {
              const cat = normalize(p.categoriaNome);
              const conta = normalize(p.conta?.nome);
              return cat.includes("CARTAO DE CREDITO") || conta.includes("CREDITO");
            });
            const fixasDebito = pagamentos.filter((p) => {
              const cat = normalize(p.categoriaNome);
              const conta = normalize(p.conta?.nome);
              return !cat.includes("CARTAO DE CREDITO") && !conta.includes("CREDITO");
            });
            const totalDebito = fixasDebito.reduce((s, i) => s + (i.valor || 0), 0);
            const totalCredito = fixasCredito.reduce((s, i) => s + (i.valor || 0), 0);

            const renderGrupo = (titulo, lista, total) => (
              <div className="mb-4">
                <h3 className="text-sm text-gray-400 font-semibold mb-2 border-b border-gray-800 pb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {titulo.includes("Débito") && <span className="text-amber-400">💰</span>}
                    {titulo.includes("Crédito") && <span className="text-blue-400">💳</span>}
                    <span>{titulo}</span>
                  </div>
                  <span className="text-gray-300 text-sm font-medium">{formatCurrency(total)}</span>
                </h3>
                {lista.length === 0 ? (
                  <p className="text-gray-500 text-xs italic">Nenhum lançamento encontrado.</p>
                ) : (
                  <div className={`space-y-1 ${lista.length > 8 ? "overflow-y-auto max-h-[360px]" : "overflow-y-visible"}`}>
                    {lista.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={item.pago} onChange={() => togglePago(item.id)}
                            className="form-checkbox text-green-500 rounded-md h-5 w-5" />
                          <span className={`truncate ${item.pago ? "text-green-400 line-through" : "text-gray-200"}`}>
                            {item.descricao}
                          </span>
                        </label>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">{dayjs(item.data).format("DD/MM")}</p>
                          <p className="text-sm font-medium">{formatCurrency(item.valor)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );

            return (
              <>
                {renderGrupo("💰 Débito / Conta", fixasDebito, totalDebito)}
                {renderGrupo("💳 Cartão de Crédito", fixasCredito, totalCredito)}
              </>
            );
          })()}
        </div>
      </div>

      {/* Gráficos restantes */}
      <div className="space-y-6 mb-10">
        <Section titulo="Receitas por Categoria">
          <PieBox data={resumo.receitasCategorias} colors={COLORS_RECEITAS} formatCurrency={formatCurrency} />
        </Section>
        <Section titulo="Receitas por Responsável">
          <PieBox data={resumo.receitasResponsaveis} colors={COLORS_RECEITAS} formatCurrency={formatCurrency} />
        </Section>
        <Section titulo="Receitas por Banco">
          <PieBox data={resumo.receitasBancos} colors={COLORS_RECEITAS} formatCurrency={formatCurrency} />
        </Section>
        <Section titulo="Despesas Fixas por Categoria">
          <PieBox data={resumo.fixasCategorias} colors={COLORS_FIXAS} formatCurrency={formatCurrency} />
        </Section>
        <Section titulo="Despesas Fixas por Responsável">
          <PieBox data={resumo.fixasResponsaveis} colors={COLORS_FIXAS} formatCurrency={formatCurrency} />
        </Section>
      </div>

      {/* Últimos lançamentos */}
      <Section titulo="Últimos Lançamentos do Mês">
        <div className="overflow-x-auto">
          {resumo.ultimosLancamentos.length === 0 ? (
            <p className="text-gray-500 italic">Nenhum lançamento encontrado para este mês.</p>
          ) : (
            <table className="min-w-full text-sm text-left border-collapse">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="p-2">Data</th>
                  <th className="p-2">Descrição</th>
                  <th className="p-2">Categoria</th>
                  <th className="p-2">Responsável</th>
                  <th className="p-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {resumo.ultimosLancamentos.map((l, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/40 transition">
                    <td className="p-2 text-gray-400">{dayjs(l.data).format("DD/MM")}</td>
                    <td className="p-2">{l.descricao}</td>
                    <td className="p-2 text-gray-400">{l.categoria}</td>
                    <td className="p-2 text-gray-400">{l.responsavel}</td>
                    <td className={`p-2 text-right font-medium ${
                      l.tipo === "RECEITA" ? "text-green-400" : "text-red-400"
                    }`}>
                      {formatCurrency(l.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Section>
    </div>
  );
}

/* Componentes */
function Card({ cor, titulo, valor, Icon }) {
  const corTexto = {
    green: "text-green-400",
    red: "text-red-400",
    yellow: "text-yellow-400",
    blue: "text-blue-400",
  }[cor];

  const corBorda = {
    green: "border-green-400/30",
    red: "border-red-400/30",
    yellow: "border-yellow-400/30",
    blue: "border-blue-400/30",
  }[cor];

  return (
    <div className={`bg-gradient-to-br from-gray-900 to-gray-950 border ${corBorda} shadow-lg rounded-2xl p-6 flex items-center space-x-4`}>
      <Icon className={`h-10 w-10 ${corTexto}`} />
      <div>
        <p className="text-sm text-gray-400 uppercase tracking-wide">{titulo}</p>
        <p className={`text-2xl font-semibold ${corTexto}`}>{`R$ ${Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}</p>
      </div>
    </div>
  );
}

function Section({ titulo, children }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 shadow-lg rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-100">{titulo}</h2>
      {children}
    </div>
  );
}

function PieBox({ data, colors, formatCurrency }) {
  const sorted = Array.isArray(data) ? [...data].sort((a,b)=> (b.total||0)-(a.total||0)) : [];
  const total = sorted.reduce((s,i)=>s+(i.total||0),0);

  return (
    <div className="flex flex-col items-center w-full">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={sorted} cx="50%" cy="50%" outerRadius={100} dataKey="total" nameKey="nome"
            label={({ name, percent, value }) => `${name} - ${formatCurrency(value)} (${(percent*100).toFixed(1)}%)`}>
            {sorted.map((entry,i)=>(<Cell key={i} fill={colors[i%colors.length]} />))}
          </Pie>
          <Tooltip formatter={(v)=>formatCurrency(v)} />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-2">Total: {formatCurrency(total)}</p>
    </div>
  );
}
