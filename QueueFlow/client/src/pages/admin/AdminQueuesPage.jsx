import { useCallback, useEffect, useState } from "react";
import { adminQueuesApi } from "../../api/client";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";

const empty = {
  name: "",
  serviceProvider: "",
  startTime: "09:00",
  endTime: "17:00",
  reservedLimit: 10,
  waitingLimit: 5,
  status: "open",
};

export default function AdminQueuesPage() {
  const [queues, setQueues] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = useCallback(() => {
    adminQueuesApi.list().then(setQueues).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setModal(true);
  }

  function openEdit(q) {
    setEditing(q);
    setForm({
      name: q.name,
      serviceProvider: q.serviceProvider,
      startTime: q.startTime,
      endTime: q.endTime,
      reservedLimit: q.reservedLimit,
      waitingLimit: q.waitingLimit,
      status: q.status,
    });
    setModal(true);
  }

  async function submit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      reservedLimit: Number(form.reservedLimit),
      waitingLimit: Number(form.waitingLimit),
    };
    try {
      if (editing) {
        await adminQueuesApi.update(editing._id, payload);
        setSuccess("Queue updated");
      } else {
        await adminQueuesApi.create(payload);
        setSuccess("Queue created");
      }
      setModal(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this queue?")) return;
    try {
      await adminQueuesApi.remove(id);
      setSuccess("Queue deleted");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <section className="page-header">
        <section>
          <h2>Queues</h2>
          <p>Create and configure service queues (admin only).</p>
        </section>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add queue
        </button>
      </section>
      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}
      <article className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Provider</th>
              <th>Hours</th>
              <th>Capacity R/W</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {queues.map((q) => (
              <tr key={q._id}>
                <td>{q.name}</td>
                <td>{q.serviceProvider}</td>
                <td>
                  {q.startTime} – {q.endTime}
                </td>
                <td>
                  {q.reservedLimit} / {q.waitingLimit}
                </td>
                <td>
                  <StatusBadge status={q.status} />
                </td>
                <td className="actions-cell">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEdit(q)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => remove(q._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
      {modal && (
        <Modal title={editing ? "Edit queue" : "New queue"} onClose={() => setModal(false)}>
          <form id="qform" onSubmit={submit} className="form-grid">
            <label className="form-group">
              Name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="form-group">
              Provider
              <input
                required
                value={form.serviceProvider}
                onChange={(e) => setForm({ ...form, serviceProvider: e.target.value })}
              />
            </label>
            <label className="form-group">
              Start
              <input value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </label>
            <label className="form-group">
              End
              <input value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </label>
            <label className="form-group">
              Reserved limit
              <input
                type="number"
                min="1"
                value={form.reservedLimit}
                onChange={(e) => setForm({ ...form, reservedLimit: e.target.value })}
              />
            </label>
            <label className="form-group">
              Waiting limit
              <input
                type="number"
                min="0"
                value={form.waitingLimit}
                onChange={(e) => setForm({ ...form, waitingLimit: e.target.value })}
              />
            </label>
            <label className="form-group">
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="upcoming">Upcoming</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          </form>
          <section className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>
              Cancel
            </button>
            <button type="submit" form="qform" className="btn btn-primary">
              Save
            </button>
          </section>
        </Modal>
      )}
    </>
  );
}
