import { useEffect, useState } from "react";
import api from "../api"; // ✅

export default function DespesasFixas() {
  const [despesas, setDespesas] = useState([]);
  const [contas, setContas] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);

  const [form, setForm] = useState(initialForm());

  function initialForm() {
    return {
      id: null,
      descricao: "",
      valor: "",
      diaVencimento: "",
      fimRecorrencia: "",   // 🔹 novo campo
      conta: null,
      responsavel: null,
      categoria: null,
    };
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    api.get("/parametros/despesas-fixas").then(res => setDespesas(res.data));
    api.get("/parametros/contas").then(res => setContas(res.data));
    api.get("/parametros/responsaveis").then(res => setResponsaveis(res.data));
    api.get("/categorias").then(res => setCategorias(res.data));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["conta", "responsavel", "categoria"].includes(name)) {
      setForm({ ...form, [name]: value ? { id: Number(value) } : null });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      valor: form.valor ? Number(form.valor) : 0,
      diaVencimento: form.diaVencimento ? Number(form.diaVencimento) : null,
      fimRecorrencia: form.fimRecorrencia || null,
      conta: form.conta ? { id: form.conta.id } : null,
      responsavel: form.responsavel ? { id: form.responsavel.id } : null,
      categoria: form.categoria ? { id: form.categoria.id } : null,
    };

    if (form.id) {
      api.put(`/parametros/despesas-fixas/${form.id}`, payload).then(() => {
        carregarDados();
        setShowModal(false);
        setForm(initialForm());
        setEditando(false);
      });
    } else {
      api.post("/parametros/despesas-fixas", payload).then(() => {
        carregarDados();
        setShowModal(false);
        setForm(initialForm());
      });
    }
  };

  const handleEdit = (d) => {
    setForm({
      ...d,
      fimRecorrencia: d.fimRecorrencia || "",
      conta: d.conta?.id ? { id: d.conta.id } : (d.contaId ? { id: d.contaId } : null),
      responsavel: d.responsavel?.id ? { id: d.responsavel.id } : (d.responsavelId ? { id: d.responsavelId } : null),
      categoria: d.categoria?.id ? { id: d.categoria.id } : (d.categoriaId ? { id: d.categoriaId } : null),
    });
    setEditando(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta despesa fixa?")) {
      api.delete(`/parametros/despesas-fixas/${id}`).then(() => carregarDados());
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-gray-100 relative">
      <h1 className="text-2xl font-bold mb-6">📌 Despesas Fixas</h1>

      <div className="overflow-x-auto rounded-xl shadow-lg mb-20">
        <table className="w-full text-left border-collapse bg-gray-800 rounded-xl">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-3">Descrição</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Dia Venc.</th>
              <th className="p-3">Fim Vigência</th>
              <th className="p-3">Conta</th>
              <th className="p-3">Responsável</th>
              <th className="p-3">Categoria</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {despesas.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-400">
                  Nenhuma despesa fixa cadastrada.
                </td>
              </tr>
            ) : (
              despesas.map((d, idx) => (
                <tr key={d.id} className={idx % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}>
                  <td className="p-3">{d.descricao}</td>
                  <td className="p-3">R$ {d.valor ? Number(d.valor).toFixed(2) : "0,00"}</td>
                  <td className="p-3">{d.diaVencimento || "-"}</td>
                  <td className="p-3">{d.fimRecorrencia || "—"}</td>
                  <td className="p-3">{d.conta?.nome ?? d.contaNome ?? "-"}</td>
                  <td className="p-3">{d.responsavel?.nome ?? d.responsavelNome ?? "-"}</td>
                  <td className="p-3">{d.categoria?.nome ?? d.categoriaNome ?? "-"}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button onClick={() => handleEdit(d)} className="text-blue-500 hover:text-blue-400">✏️</button>
                      <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-400">❌</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => { setForm(initialForm()); setEditando(false); setShowModal(true); }}
        className="fixed bottom-20 right-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full w-14 h-14 text-3xl shadow-lg flex items-center justify-center"
      >
        +
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-6">
              {editando ? "✏️ Editar Despesa Fixa" : "➕ Nova Despesa Fixa"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="descricao"
                placeholder="Descrição"
                value={form.descricao}
                onChange={handleChange}
                className="p-2 rounded-lg bg-gray-700 text-white"
                required
              />

              <input
                type="number"
                step="0.01"
                name="valor"
                placeholder="Valor"
                value={form.valor}
                onChange={handleChange}
                className="p-2 rounded-lg bg-gray-700 text-white"
                required
              />

              <input
                type="number"
                name="diaVencimento"
                placeholder="Dia Vencimento"
                value={form.diaVencimento}
                onChange={handleChange}
                min="1"
                max="31"
                className="p-2 rounded-lg bg-gray-700 text-white"
                required
              />

              {/* 🔹 Novo campo: Fim da recorrência/vigência */}
              <input
                type="date"
                name="fimRecorrencia"
                value={form.fimRecorrencia}
                onChange={handleChange}
                className="p-2 rounded-lg bg-gray-700 text-white col-span-2"
              />

              <select
                name="conta"
                value={form.conta?.id || ""}
                onChange={handleChange}
                className="p-2 rounded-lg bg-gray-700 text-white"
              >
                <option value="">Conta/Cartão</option>
                {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>

              <select
                name="responsavel"
                value={form.responsavel?.id || ""}
                onChange={handleChange}
                className="p-2 rounded-lg bg-gray-700 text-white"
              >
                <option value="">Responsável</option>
                {responsaveis.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
              </select>

              <select
                name="categoria"
                value={form.categoria?.id || ""}
                onChange={handleChange}
                className="p-2 rounded-lg bg-gray-700 text-white"
              >
                <option value="">Categoria</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>

              <div className="md:col-span-2 flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(initialForm()); }}
                  className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white"
                >
                  {editando ? "Salvar Alterações" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
