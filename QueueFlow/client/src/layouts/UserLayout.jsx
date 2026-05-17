import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/app", label: "Home", end: true },
  { to: "/app/join", label: "Join Queue" },
  { to: "/app/my-token", label: "My Token" },
];

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <section className="app-shell user-shell">
      <aside className="sidebar user-sidebar">
        <section className="sidebar-brand">
          <span className="brand-icon user-brand">QF</span>
          <section>
            <p className="brand-title">QueueFlow</p>
            <p className="brand-sub">Customer portal</p>
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
        <header className="topbar user-topbar">
          <h1>My queue</h1>
        </header>
        <main className="page">
          <Outlet />
        </main>
      </section>
    </section>
  );
}
