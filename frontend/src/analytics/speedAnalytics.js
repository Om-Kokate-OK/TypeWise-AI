export function analyzeSpeedStability(keystrokeEvents = []) {
  const keyEvents = keystrokeEvents.filter(
    (e) => e.type === "key" && e.timestamp
  );

  if (keyEvents.length < 2) {
    return {
      averageKeyTime: 0,
      speedVariance: 0,
      stabilityScore: 0
    };
  }

  const intervals = [];
  for (let i = 1; i < keyEvents.length; i++) {
    intervals.push(
      keyEvents[i].timestamp - keyEvents[i - 1].timestamp
    );
  }

  const avg =
    intervals.reduce((a, b) => a + b, 0) / intervals.length;

  const variance =
    intervals.reduce(
      (sum, t) => sum + Math.pow(t - avg, 2),
      0
    ) / intervals.length;

  const stdDev = Math.sqrt(variance);
  const normalizedInstability = stdDev / avg;

  const stabilityScore = Math.max(
    0,
    Math.round(100 - normalizedInstability * 100)
  );

  return {
    averageKeyTime: Math.round(avg),
    speedVariance: Math.round(variance),
    stabilityScore
  };
}
