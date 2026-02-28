import { useState, useEffect } from "react";

import TypingBox from "../components/TypingBox";
import ResultPanel from "../components/ResultPanel";
import KeyboardHeatmap from "../components/KeyboardHeatmap";

import { getRandomText } from "../data/textSamples";
import { generateAdaptiveText } from "../ai/adaptiveEngine";

import { useTypingEngine } from "../hooks/useTypingEngine";
import { useSessionTimer } from "../hooks/useSessionTimer";

import { calculateWPM } from "../utils/wpmCalculator";
import {
  calculateNetAccuracy,
  calculateGrossAccuracy,
} from "../utils/accuracyCalculator";

import { analyzeBackspaceBehavior } from "../analytics/backspaceAnalytics";
import { analyzeSpeedStability } from "../analytics/speedAnalytics";
import { analyzeKeyAccuracy } from "../analytics/keyAnalytics";
import { rankWeakKeys } from "../analytics/weakKeyAnalyzer";

export default function Dashboard() {
  /* --------------------------------------------------
     BASIC STATE
  -------------------------------------------------- */

  // Current paragraph / words to type
  const [text, setText] = useState(getRandomText());

  // Performance summary after test completion
  const [performance, setPerformance] = useState(null);

  // Mode can be: "words" OR "time"
  const [mode, setMode] = useState("words");

  // Word limit for words mode
  const [wordLimit, setWordLimit] = useState(40);

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

  // If time is up → force complete test
  useEffect(() => {
    if (timeUp && !typing.isCompleted) {
      typing.forceComplete(); // make sure this exists in your hook
    }
  }, [timeUp]);

  /* --------------------------------------------------
     CALCULATIONS
  -------------------------------------------------- */

  // Use fixed time in time mode
  const effectiveTime =
    mode === "time" ? timeLimit : timer.time;

  // Words per minute
  const wpm = calculateWPM(
    typing.input.length,
    effectiveTime
  );

  // Accuracy calculations
  const netAccuracy = calculateNetAccuracy(
    typing.correctFinalChars,
    text.length
  );

  const correctKeystrokes =
    typing.totalKeystrokes -
    typing.wrongKeystrokes -
    typing.backspaceCount;

  const grossAccuracy = calculateGrossAccuracy(
    correctKeystrokes,
    typing.totalKeystrokes
  );

  /* --------------------------------------------------
     WHEN TEST COMPLETES → RUN ANALYTICS
  -------------------------------------------------- */

  useEffect(() => {
    if (!typing.isCompleted) return;

    // Analyze key accuracy
    const keyStats = analyzeKeyAccuracy(
      typing.keystrokeEvents
    );
    setKeyStatsState(keyStats);

    // Identify weak keys
    const weakKeys = rankWeakKeys(keyStats).map(
      (k) => k.key
    );

    // Backspace behavior
    const backspaceStats =
      analyzeBackspaceBehavior(
        typing.keystrokeEvents
      );

    // Speed stability
    const speedStats =
      analyzeSpeedStability(
        typing.keystrokeEvents
      );

    // Final performance summary
    const performanceSummary = {
      stabilityScore: speedStats.stabilityScore,
      wpm,
      correctionRatio:
        backspaceStats.correctionRatio,
    };

    setPerformance(performanceSummary);

    console.log("Weak Keys:", weakKeys);
    console.log("Performance:", performanceSummary);
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
      <h2 style={{ marginBottom: "6px" }}>
        TypeWise AI
      </h2>

      <p
        style={{
          marginBottom: "20px",
          color: "#64748b",
        }}
      >
        Typing Skill Analyzer - Phase 3 (HeatMap)
      </p>

      {/* WORD LIMIT BUTTONS */}
      <div
        style={{
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        {[25, 40, 50].map((count) => (
          <button
            key={count}
            onClick={() => {
              setWordLimit(count);
              setText(
                generateAdaptiveText(
                  performance,
                  [],
                  count
                )
              );
              typing.resetEngine();
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
              cursor: "pointer",
            }}
          >
            {count} Words
          </button>
        ))}
      </div>

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
            onClick={() => {
              setMode(m);
              typing.resetEngine();
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
              cursor: "pointer",
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
              onClick={() => {
                setTimeLimit(sec);
                typing.resetEngine();
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
                cursor: "pointer",
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
        wpm={wpm}
        netAccuracy={netAccuracy}
        grossAccuracy={grossAccuracy}
        backspaces={typing.backspaceCount}
        wrongKeys={typing.wrongKeystrokes}
      />

      {/* ADAPTIVE TEST BUTTON */}
      {typing.isCompleted && performance && (
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
      )}
    </div>
  );
}