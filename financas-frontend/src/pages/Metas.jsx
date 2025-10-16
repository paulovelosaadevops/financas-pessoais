import { useEffect, useState } from "react";
import api from "../api";

export default function Metas() {
  const [metas, setMetas] = useState([]);
  const [novaMeta, setNovaMeta] = useState({
    descricao: "",
    tipo: "ECONOMIA",
    valorMeta: "",
    mesReferencia: new Date().getMonth() + 1,
    anoReferencia: new Date().getFullYear(),
  });

  useEffect(() => {
    carregarMetas();
  }, []);

  const carregarMetas = async () => {
    try {
      const res = await api.get("/metas/progresso");
      setMetas(res.data);
    } catch (err) {
      console.error("Erro ao carregar metas:", err);
    }
  };

  const criarMeta = async (e) => {
    e.preventDefault();
    if (!novaMeta.descricao || !novaMeta.valorMeta) return;

    try {
      await api.post("/metas", novaMeta);
      setNovaMeta({
        descricao: "",
        tipo: "ECONOMIA",
        valorMeta: "",
        mesReferencia: new Date().getMonth() + 1,
        anoReferencia: new Date().getFullYear(),
      });
      await carregarMetas();
    } catch (err) {
      console.error("Erro ao criar meta:", err);
    }
  };

  const excluirMeta = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta meta?")) return;
    try {
      await api.delete(`/metas/${id}`);
      await carregarMetas();
    } catch (err) {
      console.error("Erro ao excluir meta:", err);
    }
  };

  const formatCurrency = (value) =>
    `R$ ${Number(value || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8">
      {/* Cabeçalho */}
      <header className="mb-10 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-950 to-black p-6 shadow-lg border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Metas Financeiras
            </h1>
            <p className="text-2xl sm:text-3xl font-assinatura text-amber-400 mt-1">
              Família Bertão
            </p>
          </div>
        </div>
      </header>

      {/* Formulário de nova meta */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 shadow-lg rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-100">
          Criar nova meta
        </h2>
        <form onSubmit={criarMeta} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Descrição"
            value={novaMeta.descricao}
            onChange={(e) =>
              setNovaMeta({ ...novaMeta, descricao: e.target.value })
            }
            className="bg-gray-800 border border-gray-700 text-gray-100 p-2 rounded-lg focus:ring-2 focus:ring-amber-500"
            required
          />
          <select
            value={novaMeta.tipo}
            onChange={(e) => setNovaMeta({ ...novaMeta, tipo: e.target.value })}
            className="bg-gray-800 border border-gray-700 text-gray-100 p-2 rounded-lg focus:ring-2 focus:ring-amber-500"
          >
            <option value="ECONOMIA">Economia</option>
            <option value="INVESTIMENTO">Investimento</option>
            <option value="REDUCAO_GASTOS">Redução de Gastos</option>
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Valor Meta (R$)"
            value={novaMeta.valorMeta}
            onChange={(e) =>
              setNovaMeta({ ...novaMeta, valorMeta: e.target.value })
            }
            className="bg-gray-800 border border-gray-700 text-gray-100 p-2 rounded-lg focus:ring-2 focus:ring-amber-500"
            required
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={novaMeta.mesReferencia}
              onChange={(e) =>
                setNovaMeta({ ...novaMeta, mesReferencia: e.target.value })
              }
              className="bg-gray-800 border border-gray-700 text-gray-100 p-2 rounded-lg w-20 focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="number"
              value={novaMeta.anoReferencia}
              onChange={(e) =>
                setNovaMeta({ ...novaMeta, anoReferencia: e.target.value })
              }
              className="bg-gray-800 border border-gray-700 text-gray-100 p-2 rounded-lg w-28 focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            className="col-span-full bg-amber-500 text-black font-semibold py-2 rounded-lg hover:bg-amber-400 transition"
          >
            + Adicionar Meta
          </button>
        </form>
      </section>

      {/* Lista de metas */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-gray-100">
          Metas registradas
        </h2>

        {metas.length === 0 ? (
          <p className="text-gray-500 italic">Nenhuma meta registrada.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {metas.map((m) => (
              <div
                key={m.id}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 shadow-lg rounded-2xl p-5 relative"
              >
                <button
                  onClick={() => excluirMeta(m.id)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-300 text-sm"
                >
                  ✕
                </button>
                <h3 className="text-lg font-semibold mb-2">{m.descricao}</h3>
                <div className="w-full bg-gray-800 rounded-full h-2.5 mb-2">
                  <div
                    className={`h-2.5 rounded-full ${
                      m.percentual >= 90
                        ? "bg-green-500"
                        : m.percentual >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${m.percentual || 0}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400">
                  {formatCurrency(m.atingido)} / {formatCurrency(m.valorMeta)}
                </p>
                <p className="text-xs text-gray-500 mt-1 italic">
                  {m.percentual?.toFixed(1) || 0}% atingido
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
