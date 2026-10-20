import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { resources } from "../pages/ResourcePage";

const menuTop = [
  { path: "/", label: "Dashboard" },
  { path: "/leads", label: "Leads" },
];
const menuBottom = [
  { path: "/company-info", label: "Info Perusahaan" },
  { path: "/media", label: "Media Library" },
  { path: "/users", label: "User (superadmin)" },
];

export default function Layout() {
  const nav = useNavigate();
  const logout = () => {
    localStorage.clear();
    nav("/login");
  };
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-sm ${
      isActive ? "bg-brand text-white" : "text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-4 py-4 border-b">
          <div className="font-bold text-brand">CV. Restu Bumi Bersama</div>
          <div className="text-xs text-slate-500">Admin Panel</div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {menuTop.map((m) => (
            <NavLink key={m.path} to={m.path} end className={linkCls}>
              {m.label}
            </NavLink>
          ))}
          <div className="pt-3 text-xs uppercase text-slate-400 px-3">Konten</div>
          {resources.map((r) => (
            <NavLink key={r.path} to={`/${r.path}`} className={linkCls}>
              {r.label}
            </NavLink>
          ))}
          <div className="pt-3 text-xs uppercase text-slate-400 px-3">Pengaturan</div>
          {menuBottom.map((m) => (
            <NavLink key={m.path} to={m.path} className={linkCls}>
              {m.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="m-2 btn-outline">
          Logout
        </button>
      </aside>
      <main className="flex-1 p-6 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
