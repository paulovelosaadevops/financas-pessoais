import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import InputMask from "react-input-mask";
import api from "../api"; // ✅

dayjs.locale("pt-br");

export default function Lancamentos() {
  const [lancamentos, setLancamentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [contas, setContas] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);

  const [form, setForm] = useState(initialForm());

  function initialForm() {
    return {
      id: null,
      data: "",
      tipo: "DESPESA",
      categoria: null,
      contaOuCartao: null,
      responsavel: null,
      descricao: "",
      valor: "",
      recorrente: false,
      dataFimRecorrencia: "",
      parcelado: false,
      parcelasFaltantes: "",
    };
  }

  // Carregar inicial
  useEffect(() => {
    api.get("/lancamentos").then((res) => setLancamentos(res.data));
    api.get("/parametros/contas").then((res) => setContas(res.data));
    api.get("/parametros/responsaveis").then((res) => setResponsaveis(res.data));
  }, []);

  // Sempre que tipo mudar → buscar categorias
  useEffect(() => {
    if (form.tipo) {
      api.get(`/categorias/tipo/${form.tipo}`).then((res) => setCategorias(res.data));
    }
  }, [form.tipo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (["categoria", "contaOuCartao", "responsavel"].includes(name)) {
      setForm({ ...form, [name]: value ? { id: Number(value) } : null });
    } else {
      setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Converter sempre para ISO (yyyy-MM-dd) para o backend
    const dataFormatada = form.data
      ? dayjs(form.data, ["DD/MM/YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD")
      : null;

    const fimRecorrenciaFormatada =
      form.recorrente && form.dataFimRecorrencia
        ? dayjs(form.dataFimRecorrencia, ["DD/MM/YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD")
        : null;

    const payload = {
      ...form,
      data: dataFormatada,
      dataFimRecorrencia: fimRecorrenciaFormatada,
      valor: form.valor ? Number(form.valor) : 0,
      parcelasFaltantes: form.parcelasFaltantes ? Number(form.parcelasFaltantes) : null,
    };

    if (form.id) {
      api.put(`/lancamentos/${form.id}`, payload).then((res) => {
        setLancamentos(lancamentos.map((l) => (l.id === form.id ? res.data : l)));
        setShowModal(false);
        setForm(initialForm());
        setEditando(false);
      });
    } else {
      api.post("/lancamentos", payload).then((res) => {
        setLancamentos([...lancamentos, res.data]);
        setShowModal(false);
        setForm(initialForm());
      });
    }
  };

  const handleEdit = (l) => {
    setForm({
      ...l,
      categoria: l.categoria ? { id: l.categoria.id } : null,
      contaOuCartao: l.contaOuCartao ? { id: l.contaOuCartao.id } : null,
      responsavel: l.responsavel ? { id: l.responsavel.id } : null,
      data: l.data
        ? dayjs(l.data, ["YYYY-MM-DD", "DD/MM/YYYY"]).format("DD/MM/YYYY")
        : "",
      dataFimRecorrencia: l.dataFimRecorrencia
        ? dayjs(l.dataFimRecorrencia, ["YYYY-MM-DD", "DD/MM/YYYY"]).format("DD/MM/YYYY")
        : "",
    });
    setEditando(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este lançamento?")) {
      api.delete(`/lancamentos/${id}`).then(() => {
        setLancamentos(lancamentos.filter((l) => l.id !== id));
      });
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-gray-100 relative">
      <h1 className="text-2xl font-bold mb-6">📑 Lançamentos</h1>

      {/* 📋 Lista */}
      <div className="overflow-x-auto rounded-xl shadow-lg mb-20">
        <table className="w-full text-left border-collapse bg-gray-800 rounded-xl">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-3">Data</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Conta/Cartão</th>
              <th className="p-3">Responsável</th>
              <th className="p-3">Descrição</th>
              <th className="p-3">Recorrente</th>
              <th className="p-3">Parcelado</th>
              <th className="p-3">Valor</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center p-4 text-gray-400">
                  Nenhum lançamento cadastrado.
                </td>
              </tr>
            ) : (
              lancamentos.map((l, idx) => (
                <tr key={l.id} className={idx % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}>
                  <td className="p-3">
                    {l.data
                      ? dayjs(l.data, ["YYYY-MM-DD", "DD/MM/YYYY"]).format("DD/MM/YYYY")
                      : ""}
                  </td>
                  <td className="p-3">{l.tipo}</td>
                  <td className="p-3">{l.categoria?.nome}</td>
                  <td className="p-3">{l.contaOuCartao?.nome}</td>
                  <td className="p-3">{l.responsavel?.nome}</td>
                  <td className="p-3">{l.descricao}</td>
                  <td className="p-3">
                    {l.recorrente
                      ? l.dataFimRecorrencia
                        ? `Sim até ${dayjs(l.dataFimRecorrencia, [
                            "YYYY-MM-DD",
                            "DD/MM/YYYY",
                          ]).format("DD/MM/YYYY")}`
                        : "Sim (sem fim)"
                      : "Não"}
                  </td>
                  <td className="p-3">
                    {l.parcelado ? `${l.parcelasFaltantes}x` : "Não"}
                  </td>
                  <td className="p-3 font-semibold text-right">
                    R$ {Number(l.valor).toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => handleEdit(l)}
                        className="text-blue-500 hover:text-blue-400 text-lg"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(l.id)}
                        className="text-red-500 hover:text-red-400 text-lg"
                        title="Excluir"
                      >
                        ❌
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ➕ Botão Flutuante */}
      <button
        onClick={() => {
          setForm(initialForm());
          setEditando(false);
          setShowModal(true);
        }}
        className="fixed bottom-20 right-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full w-14 h-14 text-3xl shadow-lg flex items-center justify-center"
      >
        +
      </button>

      {/* 🟦 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-4xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
              {editando ? "✏️ Editar Lançamento" : "➕ Novo Lançamento"}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-6">
              {/* Data */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Data</label>
                <InputMask
                  mask="99/99/9999"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                >
                  {(inputProps) => (
                    <input
                      {...inputProps}
                      name="data"
                      placeholder="dd/mm/aaaa"
                      className="w-full p-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  )}
                </InputMask>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DESPESA">Despesa</option>
                  <option value="RECEITA">Receita</option>
                </select>
              </div>

              {/* Categoria */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Categoria</label>
                <select
                  name="categoria"
                  value={form.categoria?.id || ""}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  name="valor"
                  placeholder="0,00"
                  value={form.valor}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Conta */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Conta/Cartão</label>
                <select
                  name="contaOuCartao"
                  value={form.contaOuCartao?.id || ""}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione</option>
                  {contas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Responsável */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Responsável</label>
                <select
                  name="responsavel"
                  value={form.responsavel?.id || ""}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione</option>
                  {responsaveis.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descrição */}
              <div className="md:col-span-6">
                <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                <input
                  type="text"
                  name="descricao"
                  placeholder="Digite uma descrição"
                  value={form.descricao}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Opções Avançadas */}
              <div className="md:col-span-6 bg-gray-700 p-4 rounded-lg space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="recorrente"
                    checked={form.recorrente}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        recorrente: e.target.checked,
                        dataFimRecorrencia: e.target.checked ? form.dataFimRecorrencia : "",
                      })
                    }
                  />
                  <span>Recorrente</span>
                </label>

                {form.recorrente && (
                  <InputMask
                    mask="99/99/9999"
                    value={form.dataFimRecorrencia}
                    onChange={(e) =>
                      setForm({ ...form, dataFimRecorrencia: e.target.value })
                    }
                  >
                    {(inputProps) => (
                      <input
                        {...inputProps}
                        name="dataFimRecorrencia"
                        placeholder="Fim Recorrência"
                        className="w-full p-2 rounded-lg bg-gray-600 text-white"
                      />
                    )}
                  </InputMask>
                )}

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="parcelado"
                    checked={form.parcelado}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        parcelado: e.target.checked,
                        parcelasFaltantes: e.target.checked ? form.parcelasFaltantes : "",
                      })
                    }
                  />
                  <span>Parcelado</span>
                </label>

                {form.parcelado && (
                  <input
                    type="number"
                    name="parcelasFaltantes"
                    placeholder="Número de parcelas"
                    value={form.parcelasFaltantes}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-gray-600 text-white"
                  />
                )}
              </div>

              {/* Botões */}
              <div className="md:col-span-6 flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-lg text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-white font-semibold"
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
