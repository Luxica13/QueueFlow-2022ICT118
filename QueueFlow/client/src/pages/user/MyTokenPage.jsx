import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { userApi } from "../../api/client";
import Alert from "../../components/Alert";
import StatusBadge from "../../components/StatusBadge";

export default function MyTokenPage() {
  const location = useLocation();
  const [tokenId, setTokenId] = useState(
    location.state?.tokenId || localStorage.getItem("lastTokenId") || ""
  );
  const [token, setToken] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const load = useCallback(async (id) => {
    if (!id) return;
    try {
      const data = await userApi.getToken(id);
      setToken(data);
      setError("");
    } catch (err) {
      setError(err.message);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    if (tokenId) {
      load(tokenId);
      const interval = setInterval(() => load(tokenId), 5000);
      return () => clearInterval(interval);
    }
  }, [tokenId, load]);

  async function handleCancel() {
    if (!token || !confirm("Cancel your queue entry?")) return;
    try {
      const res = await userApi.cancel(token._id);
      setInfo(res.message);
      load(token._id);
    } catch (err) {
      setError(err.message);
    }
  }

  const canCancel =
    token && ["WAITING", "RESERVED"].includes(token.status);

  return (
    <>
      <section className="page-header">
        <section>
          <h2>My token</h2>
          <p>Live position and status — refreshes every 5 seconds.</p>
        </section>
      </section>

      <article className="card card-body" style={{ maxWidth: 480, marginBottom: "1rem" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(tokenId);
          }}
          className="search-row"
        >
          <input
            placeholder="Token ID (optional)"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            Load
          </button>
        </form>
      </article>

      {error && <Alert type="error">{error}</Alert>}
      {info && <Alert type="success">{info}</Alert>}

      {token && (
        <article className="card token-hero">
          <p className="token-label-display">{token.tokenLabel}</p>
          <StatusBadge status={token.status} />
          <section className="token-meta">
            <article className="meta-item">
              <span>Queue</span>
              <strong>{token.queueId?.name}</strong>
            </article>
            <article className="meta-item">
              <span>Your position</span>
              <strong>{token.positionInQueue}</strong>
            </article>
            <article className="meta-item">
              <span>Status</span>
              <strong>{token.status}</strong>
            </article>
            <article className="meta-item">
              <span>Est. wait</span>
              <strong>
                {token.estimatedWaitMinutes != null
                  ? `${token.estimatedWaitMinutes} min`
                  : token.status === "WAITING"
                    ? "When promoted"
                    : "—"}
              </strong>
            </article>
          </section>
          {canCancel && (
            <button
              type="button"
              className="btn btn-danger"
              style={{ marginTop: "1.5rem" }}
              onClick={handleCancel}
            >
              Cancel my entry
            </button>
          )}
          {token.status === "SERVING" && (
            <p className="auth-sub" style={{ marginTop: "1rem" }}>
              You are being served now. Please proceed to the counter.
            </p>
          )}
        </article>
      )}
    </>
  );
}
