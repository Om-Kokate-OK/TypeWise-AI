import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ---------------- THEME LOGIC ---------------- */
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    
    if (isDarkMode) {
      root.style.setProperty("--bg", "#0d1117");
      root.style.setProperty("--acc-bg", "#161b22");
      root.style.setProperty("--text", "#e6edf3");
      root.style.setProperty("--text-dim", "#484f58");
      root.style.setProperty("--accent", "#f59e0b");
      root.style.setProperty("--border", "#30363d");
    } else {
      root.style.setProperty("--bg", "#ffffff");
      root.style.setProperty("--acc-bg", "#f6f8fa");
      root.style.setProperty("--text", "#1f2328");
      root.style.setProperty("--text-dim", "#8c959f");
      root.style.setProperty("--accent", "#0969da");
      root.style.setProperty("--border", "#d0d7de");
    }
  }, [isDarkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await API.post("/auth/login", form);
      login(data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    background: "var(--acc-bg)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--text)",
    fontFamily: "var(--font-mono)",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "var(--bg)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      transition: "background 0.3s ease" 
    }}>
      {/* Theme Toggle in corner for Login page */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={{
          position: "absolute", top: 20, right: 20,
          background: "none", border: "none", cursor: "pointer", fontSize: "20px"
        }}
      >
        {isDarkMode ? "☀️" : "🌙"}
      </button>

      <div style={{ width: "100%", maxWidth: 400, padding: "40px", background: "var(--bg)", borderRadius: "16px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>
            // authentication_required
          </div>
          <h1 style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 800, letterSpacing: "-1.5px", color: "var(--text)" }}>
            Welcome <span style={{ color: "var(--accent)" }}>Back</span>
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div style={{ 
            background: "rgba(239,68,68,0.1)", 
            border: "1px solid rgba(239,68,68,0.2)", 
            borderRadius: "8px", 
            padding: "12px", 
            marginBottom: 24, 
            fontFamily: "var(--font-mono)", 
            fontSize: 12, 
            color: "#ef4444",
            textAlign: "center" 
          }}>
            {error.toLowerCase()}_
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>Email Address</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
              required
            />
          </div>

          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 10,
              padding: "14px",
              background: "var(--accent)",
              color: isDarkMode ? "#0d1117" : "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 800,
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.1em",
              cursor: loading ? "wait" : "pointer",
              transition: "transform 0.1s, opacity 0.2s",
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => e.target.style.opacity = "0.9"}
            onMouseLeave={(e) => e.target.style.opacity = "1"}
          >
            {loading ? "AUTHENTICATING..." : "SIGN IN"}
          </button>
        </form>

        {/* Footer Links */}
        <div style={{ marginTop: 32, textAlign: "center", borderTop: "1px solid var(--border)", paddingTop: 24 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-dim)" }}>
            New to TypeWise?{" "}
            <Link to="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>Register</Link>
          </div>
          
          <div style={{ marginTop: 16 }}>
            <Link to="/" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", textDecoration: "none" }}>
              &larr; return_to_practice
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}