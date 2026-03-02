import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import Header from "../components/Header";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";

/* ── Custom Tooltip ───────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--acc-bg)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      padding: "8px 14px",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--text)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}>
      <div style={{ color: "var(--text-dim)", marginBottom: 2 }}>#Session {label}</div>
      <div style={{ color: "var(--accent)", fontWeight: 700 }}>{payload[0].value}</div>
    </div>
  );
};

/* ── Animated Counter ─────────────────────────────── */
function AnimatedNumber({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const num = parseFloat(value) || 0;
  useEffect(() => {
    let start = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 900, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * num));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [num]);
  return <>{display}{suffix}</>;
}

/* ── Stat Card ────────────────────────────────────── */
function StatCard({ label, value, accent = false, delay = 0, large = false }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  const isPercent = typeof value === "string" && value.includes("%");
  const rawNum = isPercent ? value.replace("%", "") : value;

  return (
    <div style={{
      background: "var(--acc-bg)",
      border: `1px solid ${accent ? "var(--accent)" : "var(--border)"}`,
      borderRadius: "12px",
      padding: large ? "28px 24px" : "20px 18px",
      position: "relative",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "all .5s ease",
    }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: large ? 44 : 28, fontWeight: 700, color: accent ? "var(--accent)" : "var(--text)", lineHeight: 1 }}>
        <AnimatedNumber value={rawNum} suffix={isPercent ? "%" : ""} />
      </div>
    </div>
  );
}

/* ── Section Header ───────────────────────────────── */
function SectionHeader({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <div style={{ width: 3, height: 18, background: "var(--accent)", borderRadius: 2 }} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-dim)" }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

/* ── Main ─────────────────────────────────────────── */
export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [chartVisible, setChartVisible] = useState(false);

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

  /* ---------------- DATA FETCH ---------------- */
  useEffect(() => {
    async function fetchData() {
      try {
        const single = await API.get(`/sessions/${id}`);
        const history = await API.get("/sessions");
        setSession(single.data);
        setAllSessions(history.data.reverse());
        setTimeout(() => setChartVisible(true), 600);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }
    fetchData();
  }, [id]);

  if (!session) return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
        loading_results...
      </div>
    </div>
  );

  const trendData = allSessions.map((s, i) => ({ index: i + 1, netWPM: s.netWPM, accuracy: s.accuracy }));
  const weakKeyData = session.weakKeys?.map((k) => ({ key: k, value: 1 })) || [];

  // Dynamic Chart Styles based on Theme
  const axisStyle = { fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--text-dim)" };
  const gridStyle = { stroke: "var(--border)", strokeDasharray: "3 3" };

  const totalChars = session.correct + session.incorrect + session.missed;
  const rawAccuracy = totalChars > 0 ? ((session.correct / totalChars) * 100).toFixed(1) : 0;
  const weakKeysCount = session.weakKeys?.length || 0;

  const startAdaptiveTest = () => {
    navigate("/", { state: { adaptive: true, weakKeys: session.weakKeys || [], performance: { stabilityScore: session.stabilityScore, wpm: session.netWPM } } });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--text)", display: "flex", flexDirection: "column", transition: "background 0.3s ease" }}>
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px", width: "100%" }}>

        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)", marginBottom: 8 }}>// SESSION_COMPLETE</div>
            <h1 style={{ fontSize: 42, fontWeight: 800, margin: 0, letterSpacing: "-1.5px" }}>Performance Report</h1>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-dim)", padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "8px" }}>
            REF_{id?.slice(-6).toUpperCase()}
          </div>
        </div>

        {/* Primary Stats */}
        <SectionHeader>Core Metrics</SectionHeader>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 40 }}>
          <StatCard label="Net Speed" value={session.netWPM} accent delay={0} large />
          <StatCard label="Accuracy" value={session.accuracy + "%"} accent delay={100} large />
          <StatCard label="Consistency" value={session.stabilityScore} accent delay={200} large />
        </div>

        {/* Details List */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 40 }}>
          <div style={{ background: "var(--acc-bg)", border: "1px solid var(--border)", padding: "20px", borderRadius: "12px" }}>
            <div style={{ color: "var(--text-dim)", fontSize: 10, marginBottom: 8, fontFamily: "var(--font-mono)" }}>CHARACTERS (COR/INC/EXT/MIS)</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{session.correct} / {session.incorrect} / {session.extra} / {session.missed}</div>
          </div>
          <div style={{ background: "var(--acc-bg)", border: "1px solid var(--border)", padding: "20px", borderRadius: "12px" }}>
            <div style={{ color: "var(--text-dim)", fontSize: 10, marginBottom: 8, fontFamily: "var(--font-mono)" }}>RAW ACCURACY</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--success)" }}>{rawAccuracy}%</div>
          </div>
        </div>

        {/* Weak Keys & Adaptive Action */}
        {weakKeysCount > 0 && (
          <div style={{ background: "var(--acc-bg)", border: "1px solid var(--error)", padding: "24px", borderRadius: "12px", marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "var(--error)", fontSize: 10, fontWeight: "bold", marginBottom: 4 }}>WEAK KEYS DETECTED</div>
              <div style={{ fontSize: 24, letterSpacing: "4px", fontWeight: "bold" }}>{session.weakKeys.join(", ")}</div>
            </div>
            <button
              onClick={startAdaptiveTest}
              style={{ background: "var(--accent)", border: "none", color: "#000", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
              PRACTICE THESE KEYS
            </button>
          </div>
        )}

        {/* Progress Charts */}
        <SectionHeader>Visual Trends</SectionHeader>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20 }}>

          {/* Speed Chart */}
          <div style={{ background: "var(--acc-bg)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)", opacity: chartVisible ? 1 : 0, transition: "0.8s" }}>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 20, fontFamily: "var(--font-mono)" }}>WPM HISTORY</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="index" tick={axisStyle} hide />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="netWPM" stroke="var(--accent)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Accuracy Chart */}
          <div style={{ background: "var(--acc-bg)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)", opacity: chartVisible ? 1 : 0, transition: "0.8s", transitionDelay: "0.2s" }}>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 20, fontFamily: "var(--font-mono)" }}>ACCURACY HISTORY</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="index" tick={axisStyle} hide />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="accuracy" stroke="var(--success)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
}