import { useMemo } from "react";
import TypingBox from "../components/TypingBox";
import ResultPanel from "../components/ResultPanel";
import { getRandomText } from "../data/textSamples";
import { useTypingEngine } from "../hooks/useTypingEngine";
import { useSessionTimer } from "../hooks/useSessionTimer";
import { calculateWPM } from "../utils/wpmCalculator";
import {
  calculateNetAccuracy,
  calculateGrossAccuracy
} from "../utils/accuracyCalculator";

export default function Dashboard() {
  const text = useMemo(() => getRandomText(), []);
  const typing = useTypingEngine(text);

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
      Typing Skill Analyzer – Phase 1
    </p>

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
      </div>
    )}

    <ResultPanel
      time={timer.time}
      wpm={wpm}
      netAccuracy={netAccuracy}
      grossAccuracy={grossAccuracy}
      backspaces={typing.backspaceCount}
      wrongKeys={typing.wrongKeystrokes}
    />
  </div>
);

}
