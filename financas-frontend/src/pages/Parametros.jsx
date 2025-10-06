import { Link } from "react-router-dom";
import {
  Squares2X2Icon,
  BanknotesIcon,
  UserGroupIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";

export default function Parametros() {
  const cards = [
    {
      path: "/parametros/categorias",
      label: "Categorias",
      description: "Gerencie suas categorias de receitas e despesas",
      icon: <Squares2X2Icon className="h-10 w-10 text-blue-400" />,
    },
    {
      path: "/parametros/contas",
      label: "Contas / Cartões",
      description: "Cadastre e gerencie suas contas bancárias e cartões",
      icon: <BanknotesIcon className="h-10 w-10 text-green-400" />,
    },
    {
      path: "/parametros/responsaveis",
      label: "Responsáveis",
      description: "Defina quem é responsável por cada lançamento",
      icon: <UserGroupIcon className="h-10 w-10 text-purple-400" />,
    },
    {
      path: "/parametros/despesas-fixas",
      label: "Despesas Fixas",
      description: "Cadastre suas despesas recorrentes mensais",
      icon: <CalendarDaysIcon className="h-10 w-10 text-red-400" />,
    },
  ];

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-gray-100">
      <h1 className="text-3xl font-bold mb-8">⚙️ Parâmetros</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((c) => (
          <Link
            key={c.path}
            to={c.path}
            className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center hover:bg-gray-700 transition"
          >
            {c.icon}
            <h2 className="text-xl font-semibold mt-4">{c.label}</h2>
            <p className="text-gray-400 text-center text-sm mt-2">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
