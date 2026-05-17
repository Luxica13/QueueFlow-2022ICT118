import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { userApi } from "../../api/client";
import Alert from "../../components/Alert";
import StatusBadge from "../../components/StatusBadge";

export default function UserHomePage() {
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () =>
      userApi
        .myTokens()
        .then(setTokens)
        .catch((e) => setError(e.message));
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <section className="page-header">
        <section>
          <h2>Welcome back</h2>
          <p>Your active queue entries update automatically.</p>
        </section>
        <Link to="/app/join" className="btn btn-primary">
          Join a queue
        </Link>
      </section>
      {error && <Alert type="error">{error}</Alert>}
      {tokens.length === 0 ? (
        <article className="card card-body empty-state">
          <p>You are not in any queue right now.</p>
          <Link to="/app/join" className="btn btn-primary">
            Join a queue
          </Link>
        </article>
      ) : (
        <section className="token-cards">
          {tokens.map((t) => (
            <article key={t._id} className="card card-body token-card">
              <p className="token-label-display">{t.tokenLabel}</p>
              <StatusBadge status={t.status} />
              <p>{t.queueId?.name}</p>
              <p>
                Position: <strong>{t.positionInQueue}</strong>
                {t.estimatedWaitMinutes != null &&
                  ` · ~${t.estimatedWaitMinutes} min wait`}
              </p>
              <Link to="/app/my-token" state={{ tokenId: t._id }} className="btn btn-secondary btn-sm">
                View details
              </Link>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
