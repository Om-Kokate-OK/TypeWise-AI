/**
 * Analyze backspace behavior from keystroke events
 */
export function analyzeBackspaceBehavior(keystrokeEvents = []) {
  let totalBackspaces = 0;
  let totalKeystrokes = keystrokeEvents.length;

  let maxBurst = 0;
  let currentBurst = 0;

  keystrokeEvents.forEach((event) => {
    if (event.type === "backspace") {
      totalBackspaces++;
      currentBurst++;
      maxBurst = Math.max(maxBurst, currentBurst);
    } else {
      currentBurst = 0;
    }
  });

  const correctionRatio =
    totalKeystrokes === 0
      ? 0
      : totalBackspaces / totalKeystrokes;

  return {
    totalBackspaces,
    correctionRatio: Number(correctionRatio.toFixed(2)),
    maxBackspaceBurst: maxBurst
  };
}
