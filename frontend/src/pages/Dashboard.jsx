import { useMemo } from "react";
import TypingBox from "../components/TypingBox";
import ResultPanel from "../components/ResultPanel";
import { getRandomText } from "../data/textSamples";
import { useTypingEngine } from "../hooks/useTypingEngine";
import { useSessionTimer } from "../hooks/useSessionTimer";
import { calculateWPM } from "../utils/wpmCalculator";
import { calculateAccuracy } from "../utils/accuracyCalculator";

export default function Dashboard() {
  const text = useMemo(() => getRandomText(), []);
  const typing = useTypingEngine(text);

  // Timer runs only when typing started AND not completed
  const timer = useSessionTimer(typing.started && !typing.isCompleted);

  const wpm = calculateWPM(typing.input.length, timer.time);
  const accuracy = calculateAccuracy(
    typing.correctCount,
    typing.input.length
  );

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto" }}>
      <h2>TypeWise AI – Phase 1</h2>

      <TypingBox
        text={text}
        value={typing.input}
        onChange={typing.handleKeyPress}
      />

      {typing.isCompleted && (
        <p style={{ color: "green", marginTop: "10px" }}>
          ✅ Test Completed
        </p>
      )}

      <ResultPanel wpm={wpm} accuracy={accuracy} time={timer.time} />
    </div>
  );
}