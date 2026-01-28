/**
 * Rank weak keys based on error frequency
 * keyStats comes from analyzeKeyAccuracy()
 */
export function rankWeakKeys(keyStats, limit = 5) {
  const weakKeys = [];

  for (const key in keyStats) {
    const { correct, wrong } = keyStats[key];

    // Only keys with mistakes are considered weak
    if (wrong > 0) {
      weakKeys.push({
        key,
        score: wrong,     // severity
        correct,
        wrong
      });
    }
  }

  // Sort by most wrong first
  weakKeys.sort((a, b) => b.score - a.score);

  // Return top N weak keys
  return weakKeys.slice(0, limit);
}
