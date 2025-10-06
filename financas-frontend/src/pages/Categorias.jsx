import { useEffect, useState } from "react";
import api from "../api"; // ✅

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(initialForm());

  function initialForm() {
    return { id: null, nome: "", tipo: "DESPESA" };
  }

  useEffect(() => {
    api.get("/categorias")
      .then(res => setCategorias(res.data))
      .catch(err => console.error("Erro ao buscar categorias:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.id) {
      api.put(`/categorias/${form.id}`, form)
        .then(res => {
          setCategorias(categorias.map(c => c.id === form.id ? res.data : c));
          setShowModal(false); setForm(initialForm()); setEditando(false);
        })
        .catch(err => console.error("Erro ao editar categoria:", err));
    } else {
      api.post("/categorias", form)
        .then(res => {
          setCategorias([...categorias, res.data]);
          setShowModal(false); setForm(initialForm());
        })
        .catch(err => console.error("Erro ao criar categoria:", err));
    }
  };

  const handleEdit = (c) => { setForm(c); setEditando(true); setShowModal(true); };

  const handleDelete = (id) => {
    if (window.confirm("Deseja excluir esta categoria?")) {
      api.delete(`/categorias/${id}`)
        .then(() => setCategorias(categorias.filter(c => c.id !== id)))
        .catch(err => console.error("Erro ao excluir categoria:", err));
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-gray-100 relative">
      <h1 className="text-2xl font-bold mb-6">📂 Categorias</h1>
      <div className="overflow-x-auto rounded-xl shadow-lg mb-20">
        <table className="w-full text-left border-collapse bg-gray-800 rounded-xl">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-3">Nome</th>
              <th className="p-3">Tipo</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-400">
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            ) : (
              categorias.map((c, idx) => (
                <tr key={c.id} className={idx % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}>
                  <td className="p-3">{c.nome}</td>
                  <td className="p-3">{c.tipo}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => handleEdit(c)}
                        className="text-blue-500 hover:text-blue-400"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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
        className="fixed bottom-20 right-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full w-14 h-14 text-3xl shadow-lg flex items-center justify-center"
      >
        +
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6">
              {editando ? "✏️ Editar Categoria" : "➕ Nova Categoria"}
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
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                className="p-2 rounded-lg bg-gray-700 text-white"
              >
                <option value="DESPESA">Despesa</option>
                <option value="RECEITA">Receita</option>
              </select>
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
