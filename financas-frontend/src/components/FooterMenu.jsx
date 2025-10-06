import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

export default function FooterMenu() {
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Dashboard", icon: <HomeIcon className="h-6 w-6" /> },
    {
      path: "/lancamentos",
      label: "Lançamentos",
      icon: <ClipboardDocumentListIcon className="h-6 w-6" />,
    },
    {
      path: "/parametros",
      label: "Parâmetros",
      icon: <Cog6ToothIcon className="h-6 w-6" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-800 text-gray-200 flex justify-around py-3 border-t border-gray-700">
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center text-sm ${
            location.pathname === item.path
              ? "text-blue-400 font-semibold"
              : "text-gray-400"
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
