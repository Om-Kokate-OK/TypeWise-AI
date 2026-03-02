import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import { generateAdaptiveText } from "../ai/adaptiveEngine";
import { useTypingEngine } from "../hooks/useTypingEngine";
import { useSessionTimer } from "../hooks/useSessionTimer";
import { calculateStats } from "../utils/wpmCalculator";

import { analyzeKeyAccuracy } from "../analytics/keyAnalytics";
import { rankWeakKeys } from "../analytics/weakKeyAnalyzer";
import { analyzeSpeedStability } from "../analytics/speedAnalytics";

import Header from "../components/Header";

export default function Dashboard() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  /* ---------------- THEME STATE ---------------- */
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  /* ---------------- ENGINE STATE ---------------- */
  const [mode, setMode] = useState("words");
  const [wordLimit, setWordLimit] = useState(30);
  const [timeLimit, setTimeLimit] = useState(30);

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

  /* ---------------- TYPING LOGIC ---------------- */
  const [text, setText] = useState(() => generateAdaptiveText(null, [], wordLimit));
  const typing = useTypingEngine(text, mode);
  const timer = useSessionTimer(typing.started && !typing.isCompleted);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (typing.isCompleted) return;
    if (mode === "time" && timer.time >= timeLimit) typing.forceComplete();
    if (mode === "words" && typing.input.length >= text.length) typing.forceComplete();
  }, [timer.time, typing.input]);

  const effectiveTime = mode === "time" ? timeLimit : timer.time;
  const { rawWPM, netWPM, accuracy } = calculateStats({
    correctChars: typing.correctFinalChars,
    incorrectChars: typing.incorrectChars,
    extraChars: typing.extraChars,
    totalKeystrokes: typing.totalKeystrokes,
    timeInSeconds: effectiveTime,
  });

  /* ---------------- SAVE DATA ---------------- */
  useEffect(() => {
    if (!typing.isCompleted) return;
    const saveSession = async () => {
      try {
        const keyStats = analyzeKeyAccuracy(typing.keystrokeEvents);
        const weakKeys = rankWeakKeys(keyStats).map(k => k.key);
        const stability = analyzeSpeedStability(typing.keystrokeEvents);

        const sessionData = {
          mode, wordLimit, timeLimit,
          rawWPM: parseFloat(rawWPM),
          netWPM: parseFloat(netWPM),
          accuracy: parseFloat(accuracy),
          correct: typing.correctFinalChars,
          incorrect: typing.incorrectChars,
          extra: typing.extraChars,
          missed: typing.missedChars,
          stabilityScore: stability.stabilityScore,
          weakKeys,
        };

        const { data } = await API.post("/sessions", sessionData);
        navigate(`/results/${data._id}`, { state: { weakKeys, performance: { stabilityScore: stability.stabilityScore, wpm: netWPM } } });
      } catch (err) { console.error("Save error:", err); }
    };
    saveSession();
  }, [typing.isCompleted]);

  /* ---------------- HANDLERS ---------------- */
  const resetTest = () => {
    setText(generateAdaptiveText(null, [], wordLimit));
    typing.resetEngine();
    timer.resetTimer();
    inputRef.current?.focus();
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg)",
      color: "var(--text)",
      display: "flex",
      flexDirection: "column",
      transition: "background 0.3s ease, color 0.3s ease"
    }}>
      {/* Passing theme state to Header */}
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      {/* TOP CONFIG BAR */}
      <div style={{ padding: "40px 0 20px 0" }}>
        {/* MODE SELECTOR */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}>
          <div style={{ display: "flex", background: "var(--acc-bg)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border)" }}>
            {["words", "time"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  background: mode === m ? "var(--bg)" : "transparent",
                  border: "none",
                  color: mode === m ? "var(--accent)" : "var(--text-dim)",
                  padding: "6px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  fontWeight: "bold",
                  transition: "0.2s"
                }}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* SUB-OPTIONS (Word/Time amounts) */}
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          {(mode === "words" ? [10, 15, 30, 60, 100] : [15, 30, 60, 120]).map((val) => (
            <button
              key={val}
              onClick={() => {
                if (mode === "words") {
                  setWordLimit(val);
                  setText(generateAdaptiveText(null, [], val));
                } else {
                  setTimeLimit(val);
                }
                typing.resetEngine();
                timer.resetTimer();
              }}
              style={{
                background: "transparent",
                border: "none",
                color: (mode === "words" ? wordLimit : timeLimit) === val ? "var(--accent)" : "var(--text-dim)",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "14px",
                transition: "0.2s",
                fontWeight: (mode === "words" ? wordLimit : timeLimit) === val ? "bold" : "normal"
              }}
            >
              {val}{mode === "time" && "s"}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN TYPING AREA */}
      <div
        onClick={() => inputRef.current.focus()}
        style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "0 10%", cursor: "text" }}
      >
        <input
          ref={inputRef}
          value={typing.input}
          onChange={(e) => typing.handleKeyPress(e.target.value)}
          style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
        />

        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "32px",
          lineHeight: "1.5",
          textAlign: "left",
          maxWidth: "1000px",
          position: "relative",
          userSelect: "none",
          filter: typing.isCompleted ? "blur(4px)" : "none",
          transition: "filter 0.3s"
        }}>
          {text.split("").map((char, index) => {
            const typed = typing.input[index];
            const isCurrent = index === typing.input.length;

            let color = "var(--text-dim)";
            let bgColor = "transparent";

            if (typed != null) {
              if (typed === char) {
                color = "var(--text)";
              } else {
                color = "var(--error)";
                if (char === " ") bgColor = "rgba(239, 68, 68, 0.2)";
              }
            }

            return (
              <span key={index} style={{ color, backgroundColor: bgColor, position: "relative" }}>
                {isCurrent && <span className="custom-caret" />}
                {char}
              </span>
            );
          })}
        </div>
      </div>

      {/* FOOTER STATS */}
      <div style={{
        padding: "30px 40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "80px",
        borderTop: "1px solid var(--border)",
        background: "var(--acc-bg)"
      }}>
        <StatBlock label="WPM" value={netWPM} />
        <StatBlock label="ACC" value={`${accuracy}%`} color={accuracy < 90 ? "var(--error)" : "var(--success)"} />
        <StatBlock label="TIME" value={`${mode === "time" ? Math.max(0, timeLimit - timer.time) : timer.time}s`} />

        <button
          onClick={resetTest}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-dim)",
            padding: "8px 24px",
            borderRadius: "6px",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.color = "var(--text)"}
          onMouseLeave={(e) => e.target.style.color = "var(--text-dim)"}
        >
          RESTART
        </button>
      </div>

      <style>{`
        .custom-caret {
          position: absolute;
          left: -1px;
          top: 10%;
          width: 2px;
          height: 80%;
          background: var(--accent);
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function StatBlock({ label, value, color = "var(--text)" }) {
  return (
    <div style={{ textAlign: "center", minWidth: "80px" }}>
      <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "5px", fontFamily: "var(--font-mono)" }}>{label}</div>
      <div style={{ fontSize: "28px", fontWeight: "bold", color, fontFamily: "var(--font-mono)" }}>{value}</div>
    </div>
  );
}