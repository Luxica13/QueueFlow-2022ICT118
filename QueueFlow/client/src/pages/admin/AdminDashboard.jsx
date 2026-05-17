import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminQueuesApi } from "../../api/client";
import Alert from "../../components/Alert";

export default function AdminDashboard() {
  const [queues, setQueues] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    adminQueuesApi
      .list()
      .then(setQueues)
      .catch((err) => setError(err.message));
  }, []);

  const open = queues.filter((q) => q.status === "open").length;

  return (
    <>
      <section className="page-header">
        <section>
          <h2>Admin dashboard</h2>
          <p>Overview of queues and quick access to the service desk.</p>
        </section>
      </section>
      {error && <Alert type="error">{error}</Alert>}
      <section className="stats-grid">
        <article className="card stat-card">
          <span className="stat-label">Total queues</span>
          <p className="stat-value">{queues.length}</p>
        </article>
        <article className="card stat-card">
          <span className="stat-label">Open queues</span>
          <p className="stat-value">{open}</p>
        </article>
      </section>
      <article className="card card-body">
        <h3>Quick actions</h3>
        <section className="quick-actions">
          <Link to="/admin/queues" className="btn btn-primary">
            Manage queues
          </Link>
          <Link to="/admin/desk" className="btn btn-secondary">
            Open service desk
          </Link>
        </section>
      </article>
    </>
  );
}
