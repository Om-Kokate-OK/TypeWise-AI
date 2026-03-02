import { useState, useEffect } from "react";

export function useSessionTimer(isRunning) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const resetTimer = () => {
    setTime(0);
  };
  return { time, resetTimer };
}