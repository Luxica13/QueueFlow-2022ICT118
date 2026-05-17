import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../api/client";
import Alert from "../../components/Alert";
import StatusBadge from "../../components/StatusBadge";

export default function JoinQueuePage() {
  const navigate = useNavigate();
  const [queues, setQueues] = useState([]);
  const [queueId, setQueueId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    userApi
      .openQueues()
      .then((list) => {
        setQueues(list);
        if (list[0]) setQueueId(list[0]._id);
      })
      .catch((e) => setError(e.message));
  }, []);

  async function handleJoin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await userApi.join(queueId);
      setSuccess(res.message);
      localStorage.setItem("lastTokenId", res.token._id);
      setTimeout(
        () => navigate("/app/my-token", { state: { tokenId: res.token._id } }),
        600
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="page-header">
        <section>
          <h2>Join a queue</h2>
          <p>Select an open service queue. You will receive the next token number.</p>
        </section>
      </section>
      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}
      <article className="card card-body" style={{ maxWidth: 480 }}>
        <form onSubmit={handleJoin}>
          <label className="form-group">
            Queue
            <select required value={queueId} onChange={(e) => setQueueId(e.target.value)}>
              <option value="">Select…</option>
              {queues.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.name} — {q.serviceProvider}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}
            disabled={loading || !queueId}
          >
            {loading ? "Joining…" : "Get my token"}
          </button>
        </form>
      </article>
      {queues.length > 0 && (
        <article className="card table-wrap" style={{ marginTop: "1rem" }}>
          <table>
            <thead>
              <tr>
                <th>Queue</th>
                <th>Provider</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {queues.map((q) => (
                <tr key={q._id}>
                  <td>{q.name}</td>
                  <td>{q.serviceProvider}</td>
                  <td>
                    <StatusBadge status={q.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}
    </>
  );
}
