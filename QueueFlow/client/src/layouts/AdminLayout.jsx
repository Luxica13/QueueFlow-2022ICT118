import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/queues", label: "Queues" },
  { to: "/admin/desk", label: "Service Desk" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <section className="app-shell admin-shell">
      <aside className="sidebar">
        <section className="sidebar-brand">
          <span className="brand-icon">QF</span>
          <section>
            <p className="brand-title">QueueFlow</p>
            <p className="brand-sub">Admin panel</p>
          </section>
        </section>
        <nav>
          <ul className="nav-list">
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `nav-link${isActive ? " active" : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <section className="sidebar-footer">
          <p className="user-chip">{user?.name}</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Log out
          </button>
        </section>
      </aside>
      <section className="main-content">
        <header className="topbar">
          <h1>Administration</h1>
        </header>
        <main className="page">
          <Outlet />
        </main>
      </section>
    </section>
  );
}
