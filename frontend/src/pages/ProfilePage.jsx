import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";

export default function ProfilePage() {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [profileRes, sessionsRes] = await Promise.all([
                    API.get("/auth/me"),
                    API.get("/sessions"),
                ]);
                setProfile(profileRes.data);
                setSessions(sessionsRes.data);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            } finally {
                setLoading(false);
            }
        }
        if (user) fetchData();
    }, [user]);

    /* ── Derived stats ── */
    const totalTests = sessions.length;
    const avgWPM = totalTests
        ? Math.round(sessions.reduce((s, t) => s + (t.netWPM || 0), 0) / totalTests)
        : 0;
    const avgAccuracy = totalTests
        ? (sessions.reduce((s, t) => s + (t.accuracy || 0), 0) / totalTests).toFixed(1)
        : "0.0";
    const bestWPM = totalTests ? Math.max(...sessions.map((s) => s.netWPM || 0)) : 0;
    const totalTime = sessions.reduce((s, t) => s + (t.mode === "time" ? t.timeLimit : 0), 0);

    /* ── Top 5 sessions by Net WPM ── */
    const top5 = [...sessions].sort((a, b) => (b.netWPM || 0) - (a.netWPM || 0)).slice(0, 5);

    /* ── Recent 10 sessions ── */
    const recent = sessions.slice(0, 10);

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Header />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-dim)" }}>
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Header />

            <div className="page-container">
                {/* ── Profile Header ── */}
                <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
                    {/* Avatar */}
                    <div
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, var(--accent), #d97706)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "var(--font-mono)",
                            fontSize: 28,
                            fontWeight: 700,
                            color: "#0d1117",
                            flexShrink: 0,
                        }}
                    >
                        {profile?.name?.[0]?.toUpperCase() || "?"}
                    </div>

                    <div>
                        <h1 style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 4 }}>
                            {profile?.name || "Typist"}
                        </h1>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-dim)" }}>
                            {profile?.email}
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                            Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
                        </div>
                    </div>
                </div>

                {/* ── Overview Stats ── */}
                <div style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 14 }}>
            // overview
                    </div>
                </div>

                <div className="stats-grid" style={{ marginBottom: 12 }}>
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
                        <div className="stat-value" style={{ color: "var(--success)" }}>{avgAccuracy}%</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Best WPM</div>
                        <div className="stat-value" style={{ color: "var(--accent)" }}>{bestWPM}</div>
                    </div>
                </div>

                <div className="section-divider" />

                {/* ── Top 5 Sessions ── */}
                <div style={{ marginBottom: 36 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 16 }}>
            // top 5 sessions
                    </div>

                    {top5.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 40, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-dim)" }}>
                            No sessions yet — <Link to="/" style={{ color: "var(--accent)" }}>start typing</Link>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {top5.map((s, i) => {
                                const medals = ["🥇", "🥈", "🥉"];
                                const rank = i < 3 ? medals[i] : `#${i + 1}`;
                                return (
                                    <Link key={s._id} to={`/results/${s._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                padding: "16px 20px",
                                                background: i === 0 ? "rgba(245,158,11,0.06)" : "var(--surface)",
                                                border: `1px solid ${i === 0 ? "rgba(245,158,11,0.2)" : "var(--border)"}`,
                                                borderRadius: "var(--radius)",
                                                transition: "all 0.2s",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = "var(--accent)";
                                                e.currentTarget.style.background = "var(--accent-glow)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = i === 0 ? "rgba(245,158,11,0.2)" : "var(--border)";
                                                e.currentTarget.style.background = i === 0 ? "rgba(245,158,11,0.06)" : "var(--surface)";
                                            }}
                                        >
                                            {/* Left: rank + date */}
                                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                                <span style={{ fontFamily: "var(--font-mono)", fontSize: i < 3 ? 20 : 14, minWidth: 32, textAlign: "center", color: "var(--text-muted)" }}>
                                                    {rank}
                                                </span>
                                                <div>
                                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)" }}>
                                                        {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                    </div>
                                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                                        {s.mode} {s.mode === "words" ? s.wordLimit : `${s.timeLimit}s`}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: stats */}
                                            <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
                                                <div style={{ textAlign: "right" }}>
                                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>WPM</div>
                                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--text)", letterSpacing: "-1px" }}>{s.netWPM}</div>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Acc</div>
                                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: s.accuracy >= 95 ? "var(--success)" : s.accuracy >= 80 ? "var(--accent)" : "var(--error)", letterSpacing: "-1px" }}>
                                                        {s.accuracy}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="section-divider" />

                {/* ── Recent History ── */}
                <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-dim)" }}>
              // recent sessions
                        </div>
                        {sessions.length > 10 && (
                            <Link to="/history" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" }}>
                                View all &rarr;
                            </Link>
                        )}
                    </div>

                    {recent.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 40, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-dim)" }}>
                            No recent sessions
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                        {["Date", "Mode", "Net WPM", "Accuracy", ""].map((h) => (
                                            <th
                                                key={h}
                                                style={{
                                                    padding: "10px 14px",
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
                                    {recent.map((s, idx) => (
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
                                            <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>
                                                {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </td>
                                            <td style={{ padding: "12px 14px" }}>
                                                <span style={{
                                                    padding: "2px 7px",
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
                                            <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--text)" }}>{s.netWPM}</td>
                                            <td style={{ padding: "12px 14px", color: s.accuracy >= 95 ? "var(--success)" : s.accuracy >= 80 ? "var(--accent)" : "var(--error)" }}>
                                                {s.accuracy}%
                                            </td>
                                            <td style={{ padding: "12px 14px", textAlign: "right" }}>
                                                <Link to={`/results/${s._id}`}>
                                                    <button style={{ fontSize: 10, padding: "3px 8px", color: "var(--accent)", borderColor: "rgba(245,158,11,0.2)", background: "transparent" }}>
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
        </div>
    );
}
