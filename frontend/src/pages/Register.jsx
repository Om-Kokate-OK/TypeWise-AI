import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await API.post("/auth/register", form);
      login(data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 380, padding: "0 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 12 }}>
            // create account
          </div>
          <h1 style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 700, letterSpacing: "-1px" }}>
            Sign <span style={{ color: "var(--accent)" }}>up</span>
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "var(--radius)", padding: "10px 14px", marginBottom: 20, fontFamily: "var(--font-mono)", fontSize: 12, color: "#ef4444" }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 6, display: "block" }}>Name</label>
            <input
              type="text"
              placeholder="your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 6, display: "block" }}>Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 6, display: "block" }}>Password</label>
            <input
              type="password"
              placeholder="********"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: "12px",
              background: "var(--accent)",
              color: "#0d1117",
              border: "none",
              borderRadius: "var(--radius)",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.1em",
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 28, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-dim)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Sign in</Link>
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Link to="/" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)" }}>
            &larr; back to typing
          </Link>
        </div>
      </div>
    </div>
  );
}