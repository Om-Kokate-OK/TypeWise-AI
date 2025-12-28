// frontend/src/hooks/useTypingEngine.js

import { useState } from "react";

export function useTypingEngine(targetText) {
  const [input, setInput] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleKeyPress = (value) => {
    // block input after completion
    if (isCompleted) return;

    if (!started) setStarted(true);

    const index = value.length - 1;
    const expectedChar = targetText[index];
    const typedChar = value[index];

    if (typedChar === expectedChar) {
      setCorrectCount((c) => c + 1);
    } else {
      setErrorCount((e) => e + 1);
    }

    setInput(value);

    // STOP condition
    if (value.length === targetText.length) {
      setIsCompleted(true);
    }
  };

  const resetEngine = () => {
    setInput("");
    setCorrectCount(0);
    setErrorCount(0);
    setStarted(false);
    setIsCompleted(false);
  };

  return {
    input,
    correctCount,
    errorCount,
    started,
    isCompleted,
    handleKeyPress,
    resetEngine
  };
}
