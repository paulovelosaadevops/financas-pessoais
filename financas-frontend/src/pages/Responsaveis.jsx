import { useEffect, useState } from "react";
import api from "../api"; // ✅

export default function Responsaveis() {
  const [responsaveis, setResponsaveis] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(initialForm());

  function initialForm() {
    return { id: null, nome: "" };
  }

  useEffect(() => {
    api.get("/parametros/responsaveis")
      .then(res => setResponsaveis(res.data))
      .catch(err => console.error("Erro ao carregar responsáveis:", err));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.id) {
      api.put(`/parametros/responsaveis/${form.id}`, form)
        .then(res => {
          setResponsaveis(responsaveis.map(r => r.id === form.id ? res.data : r));
          setShowModal(false);
          setForm(initialForm());
          setEditando(false);
        })
        .catch(err => console.error("Erro ao editar responsável:", err));
    } else {
      api.post("/parametros/responsaveis", form)
        .then(res => {
          setResponsaveis([...responsaveis, res.data]);
          setShowModal(false);
          setForm(initialForm());
        })
        .catch(err => console.error("Erro ao criar responsável:", err));
    }
  };

  const handleEdit = (r) => { setForm(r); setEditando(true); setShowModal(true); };

  const handleDelete = (id) => {
    if (window.confirm("Deseja excluir este responsável?")) {
      api.delete(`/parametros/responsaveis/${id}`)
        .then(() => setResponsaveis(responsaveis.filter(r => r.id !== id)))
        .catch(err => console.error("Erro ao excluir responsável:", err));
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-gray-100 relative">
      <h1 className="text-2xl font-bold mb-6">👤 Responsáveis</h1>
      <div className="overflow-x-auto rounded-xl shadow-lg mb-20">
        <table className="w-full text-left border-collapse bg-gray-800 rounded-xl">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-3">Nome</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {responsaveis.length === 0 ? (
              <tr>
                <td colSpan="2" className="text-center p-4 text-gray-400">
                  Nenhum responsável cadastrado.
                </td>
              </tr>
            ) : (
              responsaveis.map((r, idx) => (
                <tr key={r.id} className={idx % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}>
                  <td className="p-3">{r.nome}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => handleEdit(r)}
                        className="text-blue-500 hover:text-blue-400"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-500 hover:text-red-400"
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
      <button
        onClick={() => { setForm(initialForm()); setEditando(false); setShowModal(true); }}
        className="fixed bottom-20 right-6 bg-purple-600 hover:bg-purple-500 text-white rounded-full w-14 h-14 text-3xl shadow-lg flex items-center justify-center"
      >
        +
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6">
              {editando ? "✏️ Editar Responsável" : "➕ Novo Responsável"}
            </h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <input
                type="text"
                name="nome"
                placeholder="Nome"
                value={form.nome}
                onChange={handleChange}
                className="p-2 rounded-lg bg-gray-700 text-white"
                required
              />
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-white"
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
