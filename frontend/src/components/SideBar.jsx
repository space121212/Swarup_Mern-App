
import { NavLink } from "react-router-dom";

const SideBar = () => {
  const links = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Projects", path: "/projects" },
    { name: "My Tasks", path: "/tasks" },
    { name: "Profile", path: "/profile" },
    { name: "Members", path: "/members" },
  ];

  return (
    <aside className="hidden md:flex w-64 shrink-0 min-h-screen">
      <nav className="flex w-full flex-col gap-6 rounded-r-2xl bg-linear-to-b from-gray-700 to-blue-500 px-2 py-4 shadow-lg">
        <h2 className="px-4 py-2 font-bold text-gray-100">
          WorkSpace
        </h2>

        <div className="flex flex-col gap-3">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center rounded-2xl px-4 py-3 transition-colors ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-gray-100 hover:bg-white/10"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default SideBar;
