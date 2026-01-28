/**
 * Analyze key accuracy using keystroke events
 */
export function analyzeKeyAccuracy(keystrokeEvents = []) {
  const keyStats = {};

  // 🛡️ Safety guard
  if (!Array.isArray(keystrokeEvents)) {
    console.warn("keystrokeEvents is not an array:", keystrokeEvents);
    return keyStats;
  }

  keystrokeEvents.forEach((event) => {
    if (event.type !== "key") return;

    const expected = event.expectedChar;

    if (expected === " ") return;

    if (!keyStats[expected]) {
      keyStats[expected] = { correct: 0, wrong: 0 };
    }

    if (event.correct) {
      keyStats[expected].correct++;
    } else {
      keyStats[expected].wrong++;
    }
  });

  return keyStats;
}
