import { useEffect, useState } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- THEME STATE ---------------- */
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  /* ---------------- THEME EFFECT ---------------- */
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
      root.style.setProperty("--success", "#3fb950");
      root.style.setProperty("--error", "#f85149");
    } else {
      root.style.setProperty("--bg", "#ffffff");
      root.style.setProperty("--acc-bg", "#f6f8fa");
      root.style.setProperty("--text", "#1f2328");
      root.style.setProperty("--text-dim", "#8c959f");
      root.style.setProperty("--accent", "#0969da");
      root.style.setProperty("--border", "#d0d7de");
      root.style.setProperty("--success", "#1a7f37");
      root.style.setProperty("--error", "#cf222e");
    }
  }, [isDarkMode]);

  /* ---------------- DATA FETCHING ---------------- */
  useEffect(() => {
    async function fetchSessions() {
      try {
        const { data } = await API.get("/sessions");
        // Sort sessions by date (newest first)
        setSessions(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  /* ── Stats summary from all sessions ── */
  const totalTests = sessions.length;
  const avgWPM = totalTests
    ? Math.round(sessions.reduce((s, t) => s + (t.netWPM || 0), 0) / totalTests)
    : 0;
  const avgAcc = totalTests
    ? (sessions.reduce((s, t) => s + (t.accuracy || 0), 0) / totalTests).toFixed(1)
    : "0.0";
  const bestWPM = totalTests
    ? Math.max(...sessions.map((s) => s.netWPM || 0))
    : 0;

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "var(--bg)", 
      color: "var(--text)",
      display: "flex", 
      flexDirection: "column",
      transition: "background 0.3s ease"
    }}>
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px", width: "100%" }}>
        
        {/* Page Title */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>
            // personal_archives
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, letterSpacing: "-1.5px" }}>
            Typing <span style={{ color: "var(--accent)" }}>History</span>
          </h1>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 48 }}>
          <StatBox label="Total Tests" value={totalTests} />
          <StatBox label="Avg Speed" value={avgWPM} suffix=" WPM" color="var(--accent)" />
          <StatBox label="Avg Accuracy" value={avgAcc} suffix="%" color="var(--success)" />
          <StatBox label="Best Speed" value={bestWPM} suffix=" WPM" color="var(--accent)" />
        </div>

        {/* Main Content Area */}
        <div style={{ 
            background: "var(--acc-bg)", 
            borderRadius: "16px", 
            border: "1px solid var(--border)",
            overflow: "hidden"
        }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
              fetching_data...
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: 80 }}>
              <div style={{ fontSize: 16, color: "var(--text-dim)", marginBottom: 24 }}>Your history is empty.</div>
              <Link to="/">
                <button style={{ 
                    background: "var(--accent)", 
                    border: "none", 
                    color: isDarkMode ? "#000" : "#fff", 
                    padding: "12px 32px", 
                    borderRadius: "8px", 
                    fontWeight: "bold", 
                    cursor: "pointer" 
                }}>
                  START FIRST TEST
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.05)" }}>
                    {["Date", "Mode", "Net WPM", "Raw", "Accuracy", "Stability", ""].map((h) => (
                      <th key={h} style={{ padding: "16px", textAlign: "left", fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "1px" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, idx) => (
                    <tr
                      key={s._id}
                      className="history-row"
                      style={{
                        borderBottom: "1px solid var(--border)",
                        transition: "background 0.2s",
                      }}
                    >
                      <td style={{ padding: "16px", color: "var(--text-dim)", fontSize: 13 }}>
                        {new Date(s.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          border: "1px solid var(--border)",
                          textTransform: "uppercase",
                          color: "var(--text-dim)"
                        }}>
                          {s.mode} {s.mode === "words" ? s.wordLimit : `${s.timeLimit}s`}
                        </span>
                      </td>
                      <td style={{ padding: "16px", fontWeight: 800, fontSize: 18 }}>{s.netWPM}</td>
                      <td style={{ padding: "16px", color: "var(--text-dim)" }}>{s.rawWPM}</td>
                      <td style={{ padding: "16px", fontWeight: 700, color: s.accuracy >= 95 ? "var(--success)" : "var(--accent)" }}>
                        {s.accuracy}%
                      </td>
                      <td style={{ padding: "16px", color: "var(--text-dim)" }}>
                        {s.stabilityScore ?? "—"}
                      </td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <Link to={`/results/${s._id}`} style={{ textDecoration: "none" }}>
                          <button style={{ 
                            fontSize: 10, 
                            padding: "6px 12px", 
                            color: "var(--accent)", 
                            background: "transparent", 
                            border: "1px solid var(--border)",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold"
                          }}>
                            DETAILS
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .history-row:hover {
          background-color: var(--accent-glow) !important;
        }
      `}</style>
    </div>
  );
}

/* ── Helper Component ── */
function StatBox({ label, value, suffix = "", color = "var(--text)" }) {
  return (
    <div style={{ background: "var(--acc-bg)", border: "1px solid var(--border)", padding: "20px", borderRadius: "12px" }}>
      <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginBottom: 8, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>
        {value}<span style={{ fontSize: 14 }}>{suffix}</span>
      </div>
    </div>
  );
}