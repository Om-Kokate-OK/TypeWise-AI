import { useEffect, useState } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const { data } = await API.get("/sessions");
        setSessions(data);
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <div className="page-container">
        {/* Page Title */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8 }}>
            // session log
          </div>
          <h1 style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, letterSpacing: "-1px" }}>
            Your <span style={{ color: "var(--accent)" }}>History</span>
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="stats-grid" style={{ marginBottom: 32 }}>
          <div className="stat-box">
            <div className="stat-label">Total Tests</div>
            <div className="stat-value">{totalTests}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Avg WPM</div>
            <div className="stat-value" style={{ color: "var(--info)" }}>{avgWPM}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Avg Accuracy</div>
            <div className="stat-value" style={{ color: "var(--success)" }}>{avgAcc}%</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Best WPM</div>
            <div className="stat-value" style={{ color: "var(--accent)" }}>{bestWPM}</div>
          </div>
        </div>

        <div className="section-divider" />

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: 40, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-dim)" }}>
            Loading sessions...
          </div>
        )}

        {/* Empty State */}
        {!loading && sessions.length === 0 && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-dim)", marginBottom: 16 }}>
              No sessions yet
            </div>
            <Link to="/">
              <button style={{ color: "var(--accent)", borderColor: "rgba(245,158,11,0.3)" }}>
                START TYPING
              </button>
            </Link>
          </div>
        )}

        {/* Session Table */}
        {!loading && sessions.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Date", "Mode", "Net WPM", "Raw WPM", "Accuracy", "Stability", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 14px",
                        textAlign: "left",
                        fontSize: 10,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--text-dim)",
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, idx) => (
                  <tr
                    key={s._id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.15s",
                      background: idx % 2 === 0 ? "transparent" : "rgba(13,17,23,0.4)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-glow)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : "rgba(13,17,23,0.4)")}
                  >
                    <td style={{ padding: "14px", color: "var(--text-muted)" }}>
                      {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: "14px" }}>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        background: s.mode === "time" ? "rgba(56,189,248,0.1)" : "rgba(168,85,247,0.1)",
                        color: s.mode === "time" ? "#38bdf8" : "#a855f7",
                        border: `1px solid ${s.mode === "time" ? "rgba(56,189,248,0.2)" : "rgba(168,85,247,0.2)"}`,
                      }}>
                        {s.mode} {s.mode === "words" ? s.wordLimit : `${s.timeLimit}s`}
                      </span>
                    </td>
                    <td style={{ padding: "14px", fontWeight: 700, color: "var(--text)" }}>{s.netWPM}</td>
                    <td style={{ padding: "14px", color: "var(--text-muted)" }}>{s.rawWPM}</td>
                    <td style={{ padding: "14px", color: s.accuracy >= 95 ? "var(--success)" : s.accuracy >= 80 ? "var(--accent)" : "var(--error)" }}>
                      {s.accuracy}%
                    </td>
                    <td style={{ padding: "14px", color: "var(--text-muted)" }}>
                      {s.stabilityScore ?? "—"}
                    </td>
                    <td style={{ padding: "14px", textAlign: "right" }}>
                      <Link to={`/results/${s._id}`}>
                        <button style={{ fontSize: 10, padding: "4px 10px", color: "var(--accent)", borderColor: "rgba(245,158,11,0.2)", background: "transparent" }}>
                          VIEW
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
  );
}