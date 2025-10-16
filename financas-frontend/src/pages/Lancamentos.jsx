import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import InputMask from "react-input-mask";
import api from "../api";

dayjs.locale("pt-br");

export default function Lancamentos() {
  const [lancamentos, setLancamentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [contas, setContas] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [metas, setMetas] = useState([]);

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
      meta: null,
    };
  }

  useEffect(() => {
    api.get("/lancamentos").then((res) => setLancamentos(res.data));
    api.get("/parametros/contas").then((res) => setContas(res.data));
    api.get("/parametros/responsaveis").then((res) => setResponsaveis(res.data));
    api.get("/metas").then((res) => setMetas(res.data));
  }, []);

  useEffect(() => {
    if (form.tipo === "DESPESA" || form.tipo === "RECEITA") {
      api.get(`/categorias/tipo/${form.tipo}`).then((res) => setCategorias(res.data));
    } else {
      setCategorias([]);
    }
  }, [form.tipo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (["categoria", "contaOuCartao", "responsavel", "meta"].includes(name)) {
      setForm({ ...form, [name]: value ? { id: Number(value) } : null });
    } else {
      setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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
      meta: l.meta ? { id: l.meta.id } : null,
      data: l.data ? dayjs(l.data).format("DD/MM/YYYY") : "",
      dataFimRecorrencia: l.dataFimRecorrencia ? dayjs(l.dataFimRecorrencia).format("DD/MM/YYYY") : "",
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
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      {/* 🔹 Cabeçalho */}
      <header className="mb-10 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-950 to-black p-6 shadow-lg border border-gray-800 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight">📑 Lançamentos</h1>
          <p className="text-amber-400 text-xl font-assinatura mt-1">Família Bertão</p>
        </div>
        <button
          onClick={() => {
            setForm(initialForm());
            setEditando(false);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all duration-200"
        >
          ➕ Novo Lançamento
        </button>
      </header>

      {/* 📋 Tabela */}
      <div className="overflow-x-auto rounded-2xl border border-gray-800 shadow-lg">
        <table className="w-full text-left border-collapse bg-gray-800 rounded-2xl">
          <thead className="bg-gray-700 text-gray-300 text-sm uppercase tracking-wide">
            <tr>
              <th className="p-3">Data</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Conta/Cartão</th>
              <th className="p-3">Responsável</th>
              <th className="p-3">Descrição</th>
              <th className="p-3">Recorrente</th>
              <th className="p-3">Parcelado</th>
              <th className="p-3 text-right">Valor</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center p-6 text-gray-400">
                  Nenhum lançamento cadastrado.
                </td>
              </tr>
            ) : (
              lancamentos.map((l, idx) => (
                <tr
                  key={l.id}
                  className={`transition-colors duration-200 ${
                    idx % 2 === 0 ? "bg-gray-800 hover:bg-gray-750" : "bg-gray-900 hover:bg-gray-800"
                  }`}
                >
                  <td className="p-3">{dayjs(l.data).format("DD/MM/YYYY")}</td>
                  <td
                    className={`p-3 font-semibold ${
                      l.tipo === "RECEITA"
                        ? "text-emerald-400"
                        : l.tipo === "TRANSFERENCIA_META"
                        ? "text-blue-400"
                        : l.tipo === "RESGATE_META"
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {l.tipo}
                  </td>
                  <td className="p-3">{l.categoria?.nome || "-"}</td>
                  <td className="p-3">{l.contaOuCartao?.nome || "-"}</td>
                  <td className="p-3">{l.responsavel?.nome || "-"}</td>
                  <td className="p-3">{l.descricao}</td>
                  <td className="p-3">
                    {l.recorrente
                      ? l.dataFimRecorrencia
                        ? `Sim até ${dayjs(l.dataFimRecorrencia).format("DD/MM/YYYY")}`
                        : "Sim (sem fim)"
                      : "Não"}
                  </td>
                  <td className="p-3">{l.parcelado ? `${l.parcelasFaltantes}x` : "Não"}</td>
                  <td className="p-3 text-right font-semibold">
                    R$ {Number(l.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => handleEdit(l)}
                        className="text-blue-400 hover:text-blue-300"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(l.id)}
                        className="text-red-500 hover:text-red-400"
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

      {/* 🟦 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-700 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
              {editando ? "✏️ Editar Lançamento" : "➕ Novo Lançamento"}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <CampoData form={form} setForm={setForm} />
              <CampoTipo form={form} handleChange={handleChange} />

              {(form.tipo === "DESPESA" || form.tipo === "RECEITA") && (
                <>
                  <CampoSelect label="Categoria" name="categoria" value={form.categoria?.id} onChange={handleChange} options={categorias} />
                  <CampoValor form={form} handleChange={handleChange} />
                  <CampoSelect label="Conta/Cartão" name="contaOuCartao" value={form.contaOuCartao?.id} onChange={handleChange} options={contas} />
                  <CampoSelect label="Responsável" name="responsavel" value={form.responsavel?.id} onChange={handleChange} options={responsaveis} />
                  <CampoDescricao form={form} handleChange={handleChange} />
                  <OpcoesAvancadas form={form} setForm={setForm} handleChange={handleChange} />
                </>
              )}

              {(form.tipo === "TRANSFERENCIA_META" || form.tipo === "RESGATE_META") && (
                <>
                  <CampoSelect
                    label="Meta Financeira"
                    name="meta"
                    value={form.meta?.id}
                    onChange={(e) => {
                      const id = e.target.value ? Number(e.target.value) : null;
                      setForm({ ...form, meta: id ? { id } : null });
                    }}
                    options={metas}
                  />
                  <CampoValor form={form} handleChange={handleChange} />
                  <CampoDescricao form={form} handleChange={handleChange} />
                </>
              )}

              <div className="md:col-span-6 flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-lg text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-white font-semibold shadow"
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

/* 🔹 Componentes auxiliares */
const CampoData = ({ form, setForm }) => (
  <div className="md:col-span-2">
    <label className="block text-sm text-gray-400 mb-1">Data</label>
    <InputMask mask="99/99/9999" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })}>
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
);

const CampoTipo = ({ form, handleChange }) => (
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
      <option value="TRANSFERENCIA_META">Transferência para Meta</option>
      <option value="RESGATE_META">Resgate de Meta</option>
    </select>
  </div>
);

const CampoSelect = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm text-gray-400 mb-1">{label}</label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full p-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Selecione</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.nome || opt.descricao}
        </option>
      ))}
    </select>
  </div>
);

const CampoValor = ({ form, handleChange }) => (
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
      required
    />
  </div>
);

const CampoDescricao = ({ form, handleChange }) => (
  <div className="md:col-span-6">
    <label className="block text-sm text-gray-400 mb-1">Descrição</label>
    <input
      type="text"
      name="descricao"
      placeholder="Digite uma descrição"
      value={form.descricao}
      onChange={handleChange}
      className="w-full p-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
      required
    />
  </div>
);

const OpcoesAvancadas = ({ form, setForm, handleChange }) => (
  <div className="md:col-span-6 bg-gray-700/40 p-4 rounded-lg space-y-3 border border-gray-600">
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
      <InputMask mask="99/99/9999" value={form.dataFimRecorrencia} onChange={(e) => setForm({ ...form, dataFimRecorrencia: e.target.value })}>
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
);
