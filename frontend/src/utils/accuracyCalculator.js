// Net Accuracy → final sentence correctness
export function calculateNetAccuracy(correctFinalChars, targetLength) {
  if (targetLength === 0) return 100;
  return Math.round((correctFinalChars / targetLength) * 100);
}

// Gross Accuracy → typing efficiency
export function calculateGrossAccuracy(correctKeystrokes, totalKeystrokes) {
  if (totalKeystrokes === 0) return 100;
  return Math.round((correctKeystrokes / totalKeystrokes) * 100);
}
