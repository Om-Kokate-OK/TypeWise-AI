import { useState, useEffect, useContext } from "react";

import TypingBox from "../components/TypingBox";
import ResultPanel from "../components/ResultPanel";
import KeyboardHeatmap from "../components/KeyboardHeatmap";
import LoginPromptModal from "../components/LoginPromptModal";

import { getRandomText } from "../data/textSamples";
import { generateAdaptiveText } from "../ai/adaptiveEngine";

import { useTypingEngine } from "../hooks/useTypingEngine";
import { useSessionTimer } from "../hooks/useSessionTimer";

import { AuthContext } from "../context/AuthContext";

import { calculateStats } from "../utils/wpmCalculator";

import { analyzeBackspaceBehavior } from "../analytics/backspaceAnalytics";
import { analyzeSpeedStability } from "../analytics/speedAnalytics";
import { analyzeKeyAccuracy } from "../analytics/keyAnalytics";
import { rankWeakKeys } from "../analytics/weakKeyAnalyzer";


// backend

import API from "../api/api";

export default function Dashboard() {
  /* --------------------------------------------------
     AUTH CONTEXT
  -------------------------------------------------- */
  const {
    user,
    isGuest,
    guestTestCount,
    incrementGuestTestCount,
    logout,
  } = useContext(AuthContext);

  // Login prompt modal visibility
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  /* --------------------------------------------------
     BASIC STATE
  -------------------------------------------------- */

  // Current paragraph / words to type
  // const [text, setText] = useState(getRandomText());

  // Performance summary after test completion
  const [performance, setPerformance] = useState(null);

  // Mode can be: "words" OR "time"
  const [mode, setMode] = useState("words");

  // Word limit for words mode
  const [wordLimit, setWordLimit] = useState(40);

  const [text, setText] = useState(() =>
    generateAdaptiveText(null, [], wordLimit)
  );
  // Time limit for time mode
  const [timeLimit, setTimeLimit] = useState(30);

  // Stores per-key accuracy data (for heatmap)
  const [keyStatsState, setKeyStatsState] = useState({});

  /* --------------------------------------------------
     TYPING ENGINE
     (Must be declared BEFORE timer uses it)
  -------------------------------------------------- */

  const typing = useTypingEngine(text, mode);

  /* --------------------------------------------------
     TIMER (depends on typing state)
  -------------------------------------------------- */

  const timer = useSessionTimer(
    typing.started && !typing.isCompleted
  );

  /* --------------------------------------------------
     TIME MODE LOGIC
  -------------------------------------------------- */

  // Check if time limit is reached
  const timeUp =
    mode === "time" && timer.time >= timeLimit;

  useEffect(() => {
    if (timeUp && !typing.isCompleted) {
      typing.forceComplete();
    }
  }, [timeUp, typing.isCompleted]);

  /* --------------------------------------------------
     CALCULATIONS
  -------------------------------------------------- */

  // Use fixed time in time mode
  const effectiveTime =
    mode === "time" ? timeLimit : timer.time;

  // Compute all stats using the new formula
  const { rawWPM, netWPM, accuracy } = calculateStats({
    correctChars: typing.correctFinalChars,
    incorrectChars: typing.incorrectChars,
    extraChars: typing.extraChars,
    totalKeystrokes: typing.totalKeystrokes,
    timeInSeconds: effectiveTime,
  });

  /* --------------------------------------------------
     WHEN TEST COMPLETES → RUN ANALYTICS
  -------------------------------------------------- */

  useEffect(() => {
    if (!typing.isCompleted) return;

    const processAnalytics = async () => {
      const keyStats = analyzeKeyAccuracy(
        typing.keystrokeEvents
      );
      setKeyStatsState(keyStats);

      const weakKeys = rankWeakKeys(keyStats).map(
        (k) => k.key
      );

      const backspaceStats =
        analyzeBackspaceBehavior(
          typing.keystrokeEvents
        );

      const speedStats =
        analyzeSpeedStability(
          typing.keystrokeEvents
        );

      const performanceSummary = {
        stabilityScore: speedStats.stabilityScore,
        wpm: parseFloat(netWPM),
        correctionRatio:
          backspaceStats.correctionRatio,
      };

      setPerformance(performanceSummary);

      // --------------------------------------------------
      // GUEST FLOW: store in sessionStorage temp DB
      // --------------------------------------------------
      if (isGuest) {
        const tempSession = {
          mode,
          wordLimit,
          timeLimit,
          rawWPM: parseFloat(rawWPM),
          netWPM: parseFloat(netWPM),
          accuracy: parseFloat(accuracy),
          stabilityScore: performanceSummary.stabilityScore,
          weakKeys,
          timestamp: Date.now(),
        };

        // Overwrite previous session (temp — removed each time)
        sessionStorage.setItem(
          "guestSessions",
          JSON.stringify([tempSession])
        );

        incrementGuestTestCount();

        // On 2nd+ test as guest, show login prompt
        if (guestTestCount >= 1) {
          setShowLoginPrompt(true);
        }

        return; // don't save to backend
      }

      // --------------------------------------------------
      // LOGGED-IN: save to backend
      // --------------------------------------------------
      try {
        await API.post("/sessions", {
          mode,
          wordLimit,
          timeLimit,
          rawWPM: parseFloat(rawWPM),
          netWPM: parseFloat(netWPM),
          accuracy: parseFloat(accuracy),
          stabilityScore:
            performanceSummary.stabilityScore,
          weakKeys,
        });
      } catch (err) {
        console.error("Session save failed", err);
      }
    };

    processAnalytics();
  }, [typing.isCompleted]);


  /* --------------------------------------------------
     UI
  -------------------------------------------------- */

  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "40px auto",
        padding: "20px",
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
      }}
    >
      {/* LOGIN PROMPT MODAL */}
      {showLoginPrompt && (
        <LoginPromptModal
          onClose={() => setShowLoginPrompt(false)}
          message="Sign in to save your session history, track progress, and unlock adaptive key-improvement insights."
        />
      )}

      {/* HEADER BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
        }}
      >
        <h2 style={{ margin: 0 }}>TypeWise AI</h2>

        {/* Logout / Login buttons */}
        {user ? (
          <button
            onClick={() => {
              logout();
              window.location.reload();
            }}
            style={{
              padding: "6px 16px",
              borderRadius: "6px",
              border: "1px solid #ef4444",
              background: "#fff",
              color: "#ef4444",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => setShowLoginPrompt(true)}
            style={{
              padding: "6px 16px",
              borderRadius: "6px",
              border: "1px solid #2563eb",
              background: "#fff",
              color: "#2563eb",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Login
          </button>
        )}
      </div>

      <p
        style={{
          marginBottom: "20px",
          color: "#64748b",
        }}
      >
        Typing Skill Analyzer - Phase 3 (HeatMap)
      </p>

      {/* WORD LIMIT BUTTONS (only in words mode) */}
      {mode === "words" && (
        <div
          style={{
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {[25, 40, 50].map((count) => (
            <button
              key={count}
              disabled={typing.started && !typing.isCompleted}
              onClick={() => {
                if (typing.started && !typing.isCompleted) return;
                setWordLimit(count);
                setText(
                  generateAdaptiveText(
                    performance,
                    [],
                    count
                  )
                );
                typing.resetEngine();
                timer.resetTimer();
              }}
              style={{
                margin: "0 5px",
                padding: "6px 12px",
                borderRadius: "6px",
                border:
                  wordLimit === count
                    ? "2px solid #2563eb"
                    : "1px solid #ccc",
                background: "white",
                cursor:
                  typing.started && !typing.isCompleted
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  typing.started && !typing.isCompleted
                    ? 0.5
                    : 1,
              }}
            >
              {count} Words
            </button>
          ))}
        </div>
      )}

      {/* MODE BUTTONS */}
      <div
        style={{
          marginBottom: "10px",
          textAlign: "center",
        }}
      >
        {["words", "time"].map((m) => (
          <button
            key={m}
            disabled={typing.started && !typing.isCompleted}
            onClick={() => {
              if (typing.started && !typing.isCompleted) return;
              setMode(m);
              setText(
                generateAdaptiveText(
                  performance,
                  [],
                  m === "words" ? wordLimit : 50
                )
              );
              typing.resetEngine();
              timer.resetTimer();
            }}
            style={{
              margin: "0 5px",
              padding: "6px 12px",
              borderRadius: "6px",
              border:
                mode === m
                  ? "2px solid #2563eb"
                  : "1px solid #ccc",
              background: "white",
              cursor:
                typing.started && !typing.isCompleted
                  ? "not-allowed"
                  : "pointer",
              opacity:
                typing.started && !typing.isCompleted
                  ? 0.5
                  : 1,
            }}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      {/* TIME LIMIT BUTTONS */}
      {mode === "time" && (
        <div
          style={{
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {[15, 30, 60].map((sec) => (
            <button
              key={sec}
              disabled={typing.started && !typing.isCompleted}
              onClick={() => {
                if (typing.started && !typing.isCompleted) return;
                setTimeLimit(sec);
                typing.resetEngine();
                timer.resetTimer();
              }}
              style={{
                margin: "0 5px",
                padding: "6px 12px",
                borderRadius: "6px",
                border:
                  timeLimit === sec
                    ? "2px solid #2563eb"
                    : "1px solid #ccc",
                background: "white",
                cursor:
                  typing.started && !typing.isCompleted
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  typing.started && !typing.isCompleted
                    ? 0.5
                    : 1,
              }}
            >
              {sec}s
            </button>
          ))}
        </div>
      )}

      {/* TYPING BOX */}
      <TypingBox
        text={text}
        value={typing.input}
        onChange={typing.handleKeyPress}
      />

      {/* COMPLETION MESSAGE + HEATMAP */}
      {typing.isCompleted && (
        <div
          style={{
            marginTop: "10px",
            color: "#16a34a",
            fontWeight: "600",
          }}
        >
          ✅ Test Completed
          <KeyboardHeatmap
            keyStats={keyStatsState}
          />
        </div>
      )}

      {/* RESULT PANEL */}
      <ResultPanel
        time={timer.time}
        rawWPM={rawWPM}
        netWPM={netWPM}
        accuracy={accuracy}
        correct={typing.correctFinalChars}
        incorrect={typing.incorrectChars}
        extra={typing.extraChars}
        missed={typing.missedChars}
      />


      {/* ADAPTIVE TEST BUTTON */}
      {typing.isCompleted && performance && (
        <>
          {user ? (
            <button
              onClick={() => {
                const keyStats =
                  analyzeKeyAccuracy(
                    typing.keystrokeEvents
                  );

                const weakKeys =
                  rankWeakKeys(keyStats).map(
                    (k) => k.key
                  );

                const newText =
                  generateAdaptiveText(
                    performance,
                    weakKeys,
                    mode === "words"
                      ? wordLimit
                      : 50
                  );

                setText(newText);
                typing.resetEngine();
                timer.resetTimer();
              }}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                borderRadius: "6px",
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
              }}
            >
              Start Adaptive Test
            </button>
          ) : (
            <button
              onClick={() => setShowLoginPrompt(true)}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                borderRadius: "6px",
                border: "none",
                background: "#94a3b8",
                color: "white",
                cursor: "pointer",
              }}
            >
              🔒 Login to Unlock Adaptive Test
            </button>
          )}

          {/* RETRY (available to everyone) */}
          <button
            onClick={() => {
              setText(
                generateAdaptiveText(
                  null,
                  [],
                  mode === "words" ? wordLimit : 50
                )
              );
              typing.resetEngine();
              timer.resetTimer();
              // Clear guest temp data on new test
              if (isGuest) {
                sessionStorage.removeItem("guestSessions");
              }
            }}
            style={{
              marginTop: "10px",
              marginLeft: "10px",
              padding: "10px 20px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#334155",
              cursor: "pointer",
            }}
          >
            Retry New Test
          </button>
        </>
      )}

      {/* GUEST INFO BANNER */}
      {isGuest && !typing.isCompleted && (
        <p
          style={{
            marginTop: "16px",
            padding: "10px 14px",
            background: "#fef3c7",
            borderRadius: "8px",
            color: "#92400e",
            fontSize: "13px",
            textAlign: "center",
          }}
        >
          You&apos;re in guest mode — session data is temporary.{" "}
          <span
            onClick={() => setShowLoginPrompt(true)}
            style={{
              textDecoration: "underline",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Login to save progress
          </span>
        </p>
      )}
    </div>
  );
}