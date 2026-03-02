import { useState } from "react";

export function useTypingEngine(targetText, mode, timeUp) {
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Phase 1 metrics
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [wrongKeystrokes, setWrongKeystrokes] = useState(0);

  // 🔥 Phase 2 raw keystroke events (MISSING EARLIER)
  const [keystrokeEvents, setKeystrokeEvents] = useState([]);

  const forceComplete = () => {
    setIsCompleted(true);
  };

  const handleKeyPress = (value) => {
    if (isCompleted) return;

    if (!started && value.length > 0) {
      setStarted(true);
    }

    // ⌫ BACKSPACE
    if (value.length < input.length) {
      setBackspaceCount((b) => b + 1);
      setTotalKeystrokes((t) => t + 1);

      // record backspace event
      setKeystrokeEvents((events) => [
        ...events,
        {
          type: "backspace",
          timestamp: Date.now()

        }

      ]);

      setInput(value);
      return;
    }

    // Hard cap
    if (value.length > targetText.length) return;

    const index = value.length - 1;
    const typedChar = value[index];
    const expectedChar = targetText[index];

    setTotalKeystrokes((t) => t + 1);

    const isCorrect = typedChar === expectedChar;

    if (!isCorrect) {
      setWrongKeystrokes((w) => w + 1);
    }

    // 🔑 record key event
    setKeystrokeEvents((events) => [
      ...events,
      {
        type: "key",
        typedChar,
        expectedChar,
        correct: isCorrect,
        timestamp: Date.now()

      }
    ]);

    setInput(value);

    // if (value.length === targetText.length) {
    //   setIsCompleted(true);
    // }

    if (mode === "words") {
      if (value.length >= targetText.length) {
        setIsCompleted(true);
      }
    }

    if (mode === "time" && timeUp) {
      setIsCompleted(true);
    }
  };

  // Net correctness (final input only)
  let correctFinalChars = 0;
  const compareLength = Math.min(input.length, targetText.length);

  for (let i = 0; i < compareLength; i++) {
    if (input[i] === targetText[i]) {
      correctFinalChars++;
    }
  }

  const incorrectChars = compareLength - correctFinalChars;
  const extraChars = Math.max(0, input.length - targetText.length);
  const missedChars = Math.max(0, targetText.length - input.length);

  const resetEngine = () => {
    setInput("");
    setStarted(false);
    setIsCompleted(false);
    setBackspaceCount(0);
    setTotalKeystrokes(0);
    setWrongKeystrokes(0);
    setKeystrokeEvents([]);
  };

  return {
    input,
    started,
    isCompleted,

    // Phase 1 metrics
    correctFinalChars,
    incorrectChars,
    extraChars,
    missedChars,
    wrongKeystrokes,
    backspaceCount,
    totalKeystrokes,

    // Phase 2 analytics stream
    keystrokeEvents,

    handleKeyPress,
    resetEngine,

    forceComplete
  };
}
