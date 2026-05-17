import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/Alert";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/app", { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const u = await login(form);
      navigate(u.role === "admin" ? "/admin" : "/app", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="auth-page">
      <article className="auth-card">
        <h2>Sign in to QueueFlow</h2>
        <p className="auth-sub">Smart queue management</p>
        {error && <Alert type="error">{error}</Alert>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-group">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="form-group">
            Password
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <button type="submit" className="btn btn-primary auth-submit">
            Sign in
          </button>
        </form>
        <p className="auth-footer">
          New customer? <Link to="/register">Create account</Link>
        </p>
      </article>
    </section>
  );
}
