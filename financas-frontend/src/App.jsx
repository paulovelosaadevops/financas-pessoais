import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Lancamentos from "./pages/Lancamentos";
import Parametros from "./pages/Parametros";
import FooterMenu from "./components/FooterMenu";

// 👇 subpáginas de parâmetros
import Categorias from "./pages/Categorias";
import Contas from "./pages/Contas";
import Responsaveis from "./pages/Responsaveis";
import DespesasFixas from "./pages/DespesasFixas";
import Metas from "./pages/Metas";

export default function App() {
  return (
    <Router>
      <div className="pb-20 min-h-screen bg-gray-900 text-gray-100">
        <Routes>
          {/* Telas principais */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/lancamentos" element={<Lancamentos />} />

          {/* Parâmetros e subpáginas */}
          <Route path="/parametros" element={<Parametros />} />
          <Route path="/parametros/categorias" element={<Categorias />} />
          <Route path="/parametros/contas" element={<Contas />} />
          <Route path="/parametros/responsaveis" element={<Responsaveis />} />
          <Route path="/parametros/despesas-fixas" element={<DespesasFixas />} />
          <Route path="/parametros/metas" element={<Metas />} />
        </Routes>

        <FooterMenu />
      </div>
    </Router>
  );
}
