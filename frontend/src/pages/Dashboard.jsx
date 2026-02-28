import { useMemo, useEffect } from "react";
import TypingBox from "../components/TypingBox";
import ResultPanel from "../components/ResultPanel";
import { getRandomText } from "../data/textSamples";
import { useTypingEngine } from "../hooks/useTypingEngine";
import { useSessionTimer } from "../hooks/useSessionTimer";
import { calculateWPM } from "../utils/wpmCalculator";
import { analyzeBackspaceBehavior } from "../analytics/backspaceAnalytics";
import { analyzeSpeedStability } from "../analytics/speedAnalytics";
import KeyboardHeatmap from "../components/KeyboardHeatmap";
import { useState } from "react";
import { generateAdaptiveText } from "../ai/adaptiveEngine";


import {
  calculateNetAccuracy,
  calculateGrossAccuracy
} from "../utils/accuracyCalculator";

import { analyzeKeyAccuracy } from "../analytics/keyAnalytics";
import { rankWeakKeys } from "../analytics/weakKeyAnalyzer";

export default function Dashboard() {
  const [text, setText] = useState(getRandomText());
  const [performance, setPerformance] = useState(null);
  const typing = useTypingEngine(text);

  const [mode, setMode] = useState("words");
const [wordLimit, setWordLimit] = useState(40);

  const timer = useSessionTimer(typing.started && !typing.isCompleted);

  const wpm = calculateWPM(typing.input.length, timer.time);

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

  const [keyStatsState, setKeyStatsState] = useState({});


// useEffect(() => {
//   if (!typing.isCompleted) return;

//   const keyStats = analyzeKeyAccuracy(
//     typing.keystrokeEvents
//   );

//   setKeyStatsState(keyStats);

//   const weakKeys = rankWeakKeys(keyStats);
//   const backspaceStats = analyzeBackspaceBehavior(
//     typing.keystrokeEvents
//   );
//   const speedStats = analyzeSpeedStability(
//     typing.keystrokeEvents
//   );

//   // console.log("Key Stats:", keyStats);
//   // console.log("Weak Keys:", weakKeys);
//   // console.log("Backspace Stats:", backspaceStats);
//   // console.log("Speed Stats:", speedStats);

//   const performanceSummary = {
//   stabilityScore: speedStats.stabilityScore,
//   wpm,
//   correctionRatio: backspaceStats.correctionRatio
// };
// setPerformance(performanceSummary);
// }, [typing.isCompleted, typing.keystrokeEvents]);

useEffect(() => {
  if (!typing.isCompleted) return;

  const keyStats = analyzeKeyAccuracy(typing.keystrokeEvents);
  setKeyStatsState(keyStats);

  const weakKeys = rankWeakKeys(keyStats).map((k) => k.key);

  const backspaceStats = analyzeBackspaceBehavior(typing.keystrokeEvents);
  const speedStats = analyzeSpeedStability(typing.keystrokeEvents);

  const performanceSummary = {
    stabilityScore: speedStats.stabilityScore,
    wpm,
    correctionRatio: backspaceStats.correctionRatio,
  };

  setPerformance(performanceSummary);

  console.log("Weak Keys:", weakKeys);
  console.log("Performance:", performanceSummary);
}, [typing.isCompleted]);


  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "40px auto",
        padding: "20px",
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
      }}
    >
      <h2 style={{ marginBottom: "6px" }}>TypeWise AI</h2>
      <p style={{ marginBottom: "20px", color: "#64748b" }}>
        Typing Skill Analyzer - Phase 3 (HeatMap)
      </p>
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
  {[25, 40, 50].map((count) => (
    <button
      key={count}
      onClick={() => {
        setWordLimit(count);
        setText(generateAdaptiveText(performance, [], count));
        typing.resetEngine();
      }}
      style={{
        margin: "0 5px",
        padding: "6px 12px",
        borderRadius: "6px",
        border: wordLimit === count ? "2px solid #2563eb" : "1px solid #ccc",
        background: "white",
        cursor: "pointer"
      }}
    >
      {count} Words
    </button>
  ))}
</div>

      <TypingBox
        text={text}
        value={typing.input}
        onChange={typing.handleKeyPress}
      />

      {typing.isCompleted && (
        <div
          style={{
            marginTop: "10px",
            color: "#16a34a",
            fontWeight: "600"
          }}
        >
          ✅ Test Completed
          <KeyboardHeatmap keyStats={keyStatsState}/>
        </div>
      )}

      {/* ✅ RESULT PANEL WILL NOW RENDER */}
      <ResultPanel
        time={timer.time}
        wpm={wpm}
        netAccuracy={netAccuracy}
        grossAccuracy={grossAccuracy}
        backspaces={typing.backspaceCount}
        wrongKeys={typing.wrongKeystrokes}
      />

      {typing.isCompleted && performance && (
  <button
    onClick={() => {
      const keyStats = analyzeKeyAccuracy(typing.keystrokeEvents);
      const weakKeys = rankWeakKeys(keyStats).map((k) => k.key);

      const newText = generateAdaptiveText(performance, weakKeys, wordLimit);

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
      cursor: "pointer"
    }}
  >
    Start Adaptive Test
  </button>
)}

    </div>
  );
}
