import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { adminQueuesApi, adminDeskApi } from "../../api/client";
import Alert from "../../components/Alert";
import StatusBadge from "../../components/StatusBadge";
import TokenRow from "../../components/TokenRow";

function QueueSection({ title, tokens, emptyText, renderActions }) {
  return (
    <article className="card desk-section">
      <header className="desk-section-header">
        <h3>{title}</h3>
        <span className="desk-count">{tokens.length}</span>
      </header>
      {tokens.length === 0 ? (
        <p className="desk-empty">{emptyText}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Position</th>
              <th>Est. wait</th>
              {renderActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <TokenRow
                key={token._id}
                token={token}
                actions={renderActions?.(token)}
              />
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
}

export default function AdminDeskPage() {
  const location = useLocation();
  const [queues, setQueues] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [queueId, setQueueId] = useState(location.state?.queueId || "");
  const [board, setBoard] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [joinUserId, setJoinUserId] = useState("");

  useEffect(() => {
    adminQueuesApi.list().then(setQueues).catch((e) => setError(e.message));
    adminDeskApi.customers().then(setCustomers).catch(() => {});
  }, []);

  const loadBoard = useCallback(async () => {
    if (!queueId) return;
    try {
      const data = await adminDeskApi.board(queueId);
      setBoard(data);
    } catch (err) {
      setError(err.message);
    }
  }, [queueId]);

  useEffect(() => {
    loadBoard();
    const id = setInterval(loadBoard, 5000);
    return () => clearInterval(id);
  }, [loadBoard]);

  async function run(action) {
    setError("");
    setInfo("");
    try {
      const res = await action();
      setInfo(res.message || "Done");
      loadBoard();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAdminJoin(e) {
    e.preventDefault();
    if (!joinUserId || !queueId) return;
    await run(() => adminDeskApi.joinForUser(queueId, joinUserId));
  }

  const servingActions = (token) => (
    <>
      <button
        type="button"
        className="btn btn-success btn-sm"
        onClick={() => run(() => adminDeskApi.complete(token._id))}
      >
        Complete
      </button>
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={() => run(() => adminDeskApi.remove(token._id))}
      >
        Remove
      </button>
    </>
  );

  const lineActions = (token) => (
    <button
      type="button"
      className="btn btn-danger btn-sm"
      onClick={() => run(() => adminDeskApi.remove(token._id))}
    >
      Remove
    </button>
  );

  return (
    <>
      <section className="page-header">
        <section>
          <h2>Service desk</h2>
          <p>Queue ordered by token number. First joined, first served.</p>
        </section>
      </section>

      {error && <Alert type="error">{error}</Alert>}
      {info && <Alert type="info">{info}</Alert>}

      <article className="card card-body desk-controls">
        <label className="form-group">
          Active queue
          <select value={queueId} onChange={(e) => setQueueId(e.target.value)}>
            <option value="">Select queue</option>
            {queues.map((q) => (
              <option key={q._id} value={q._id}>
                {q.name} ({q.status})
              </option>
            ))}
          </select>
        </label>
        {queueId && (
          <section className="desk-toolbar">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => run(() => adminDeskApi.callNext(queueId))}
            >
              Call next
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => run(() => adminDeskApi.promoteWaiting(queueId))}
            >
              Reserve next waiting
            </button>
            <button type="button" className="btn btn-secondary" onClick={loadBoard}>
              Refresh
            </button>
          </section>
        )}
        {queueId && (
          <form onSubmit={handleAdminJoin} className="admin-join-row">
            <select value={joinUserId} onChange={(e) => setJoinUserId(e.target.value)}>
              <option value="">Add customer to queue…</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-secondary btn-sm" disabled={!joinUserId}>
              Add to queue
            </button>
          </form>
        )}
      </article>

      {board && (
        <section className="desk-grid">
          <article className="card serving-now">
            <h3>Now serving</h3>
            {board.serving ? (
              <>
                <p className="serving-token">
                  {board.serving.tokenLabel}
                </p>
                <p>{board.serving.userId?.name}</p>
                <StatusBadge status={board.serving.status} />
                <section className="actions-cell" style={{ marginTop: "1rem" }}>
                  {servingActions(board.serving)}
                </section>
              </>
            ) : (
              <p className="desk-empty">No one is being served</p>
            )}
          </article>

          <QueueSection
            title="Reserved (in order)"
            tokens={board.reserved}
            emptyText="No reserved customers"
            renderActions={lineActions}
          />
          <QueueSection
            title="Waiting (in order)"
            tokens={board.waiting}
            emptyText="No waiting customers"
            renderActions={lineActions}
          />
          <QueueSection
            title="Completed today"
            tokens={board.completed.slice(-15).reverse()}
            emptyText="No completed visits yet"
          />
        </section>
      )}
    </>
  );
}
