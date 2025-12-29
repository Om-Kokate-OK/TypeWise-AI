import { useState } from "react";

export function useTypingEngine(targetText) {
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // NEW METRICS
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [wrongKeystrokes, setWrongKeystrokes] = useState(0);

  const handleKeyPress = (value) => {
    if (isCompleted) return;

    if (!started && value.length > 0) {
      setStarted(true);
    }

    // Detect backspace
    if (value.length < input.length) {
      setBackspaceCount((b) => b + 1);
      setTotalKeystrokes((t) => t + 1);
      setInput(value);
      return;
    }

    // Hard cap to target length
    if (value.length > targetText.length) return;

    const index = value.length - 1;
    const typedChar = value[index];
    const expectedChar = targetText[index];

    setTotalKeystrokes((t) => t + 1);

    if (typedChar !== expectedChar) {
      setWrongKeystrokes((w) => w + 1);
    }

    setInput(value);

    if (value.length === targetText.length) {
      setIsCompleted(true);
    }
  };

  // DERIVED FINAL CORRECTNESS (NET)
  let correctFinalChars = 0;
  const compareLength = Math.min(input.length, targetText.length);

  for (let i = 0; i < compareLength; i++) {
    if (input[i] === targetText[i]) {
      correctFinalChars++;
    }
  }

  const resetEngine = () => {
    setInput("");
    setStarted(false);
    setIsCompleted(false);
    setBackspaceCount(0);
    setTotalKeystrokes(0);
    setWrongKeystrokes(0);
  };

  return {
    input,
    started,
    isCompleted,

    // metrics
    correctFinalChars,
    wrongKeystrokes,
    backspaceCount,
    totalKeystrokes,

    handleKeyPress,
    resetEngine
  };
}
