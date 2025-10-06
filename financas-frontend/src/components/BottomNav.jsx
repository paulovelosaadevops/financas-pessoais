import { Link, useLocation } from "react-router-dom";
import { HomeIcon, ListBulletIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

export default function BottomNav() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Dashboard", icon: <HomeIcon className="h-6 w-6" /> },
    { to: "/lancamentos", label: "Lançamentos", icon: <ListBulletIcon className="h-6 w-6" /> },
    { to: "/parametros", label: "Parâmetros", icon: <Cog6ToothIcon className="h-6 w-6" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-gray-800 text-gray-300 border-t border-gray-700">
      <ul className="flex justify-around">
        {links.map((link) => (
          <li key={link.to} className={`flex flex-col items-center py-2 ${location.pathname === link.to ? "text-blue-400" : ""}`}>
            <Link to={link.to} className="flex flex-col items-center">
              {link.icon}
              <span className="text-xs">{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
