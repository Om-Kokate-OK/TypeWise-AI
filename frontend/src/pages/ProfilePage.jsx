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

    const top5 = [...sessions].sort((a, b) => (b.netWPM || 0) - (a.netWPM || 0)).slice(0, 5);
    const recent = sessions.slice(0, 10);

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column" }}>
                <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-dim)" }}>
                    loading_profile...
                </div>
            </div>
        );
    }

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

            <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px", width: "100%" }}>
                
                {/* ── Profile Header ── */}
                <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 48 }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: "20px",
                        background: "var(--accent)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 800,
                        color: isDarkMode ? "#0d1117" : "#fff",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                    }}>
                        {profile?.name?.[0]?.toUpperCase() || "?"}
                    </div>

                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: "-1px" }}>
                            {profile?.name || "Typist"}
                        </h1>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-dim)", marginTop: 4 }}>
                            {profile?.email}
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", marginTop: 8, textTransform: "uppercase", letterSpacing: "1px" }}>
                            Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
                        </div>
                    </div>
                </div>

                {/* ── Overview Stats ── */}
                <SectionLabel>// account_overview</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 48 }}>
                    <StatCard label="Total Tests" value={totalTests} />
                    <StatCard label="Average Speed" value={avgWPM} suffix=" WPM" color="var(--accent)" />
                    <StatCard label="Average Acc" value={avgAccuracy} suffix="%" color="var(--success)" />
                    <StatCard label="Personal Best" value={bestWPM} suffix=" WPM" color="var(--accent)" />
                </div>

                {/* ── Top 5 Sessions ── */}
                <SectionLabel>// top_performances</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 48 }}>
                    {top5.map((s, i) => (
                        <Link key={s._id} to={`/results/${s._id}`} style={{ textDecoration: "none" }}>
                            <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "16px 24px", borderRadius: "12px",
                                background: "var(--acc-bg)", border: "1px solid var(--border)",
                                transition: "0.2s"
                            }} className="hover-card">
                                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "var(--text-dim)", width: 24 }}>
                                        {i === 0 ? "🏆" : i + 1}
                                    </span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 18 }}>{s.netWPM} WPM</div>
                                        <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                                            {new Date(s.createdAt).toLocaleDateString()} • {s.mode.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontWeight: 700, color: "var(--success)" }}>{s.accuracy}%</div>
                                    <div style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase" }}>Accuracy</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* ── Recent History Table ── */}
                <SectionLabel>// activity_log</SectionLabel>
                <div style={{ overflowX: "auto", background: "var(--acc-bg)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                {["Date", "Mode", "Speed", "Acc", ""].map((h) => (
                                    <th key={h} style={{ padding: "16px", textAlign: "left", fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recent.map((s) => (
                                <tr key={s._id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "14px 16px", color: "var(--text-dim)" }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: "14px 16px" }}>
                                        <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border)" }}>
                                            {s.mode}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 16px", fontWeight: 700 }}>{s.netWPM}</td>
                                    <td style={{ padding: "14px 16px", color: "var(--success)" }}>{s.accuracy}%</td>
                                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                                        <Link to={`/results/${s._id}`} style={{ color: "var(--accent)", textDecoration: "none", fontSize: 11 }}>DETAILS</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`
                .hover-card:hover { transform: translateX(8px); border-color: var(--accent) !important; }
            `}</style>
        </div>
    );
}

function SectionLabel({ children }) {
    return (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "2px", color: "var(--text-dim)", marginBottom: 16, textTransform: "uppercase" }}>
            {children}
        </div>
    );
}

function StatCard({ label, value, suffix = "", color = "var(--text)" }) {
    return (
        <div style={{ background: "var(--acc-bg)", border: "1px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
            <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginBottom: 8, textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}<span style={{ fontSize: 14 }}>{suffix}</span></div>
        </div>
    );
}