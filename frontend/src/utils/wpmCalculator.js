/**
 * Calculate rawWPM, netWPM, and accuracy from typing session data.
 *
 * @param {Object} params
 * @param {number} params.correctChars   - Characters typed correctly (final state)
 * @param {number} params.incorrectChars - Characters typed incorrectly (final state)
 * @param {number} params.extraChars     - Characters typed beyond target length
 * @param {number} params.totalKeystrokes - All keystrokes (including backspaces)
 * @param {number} params.timeInSeconds  - Duration of the session
 * @returns {{ rawWPM: string, netWPM: string, accuracy: string }}
 */
export function calculateStats({
  correctChars,
  incorrectChars,
  extraChars,
  totalKeystrokes,
  timeInSeconds,
}) {
  if (timeInSeconds === 0) {
    return { rawWPM: "0.00", netWPM: "0.00", accuracy: "0.00" };
  }

  const timeInMinutes = timeInSeconds / 60;

  const rawWPM = (totalKeystrokes / 5) / timeInMinutes;

  const netWPM = (correctChars / 5) / timeInMinutes;

  const totalCharsConsidered = correctChars + incorrectChars + extraChars;
  const accuracy =
    totalCharsConsidered === 0
      ? 0
      : (correctChars / totalCharsConsidered) * 100;

  return {
    rawWPM: rawWPM.toFixed(2),
    netWPM: netWPM.toFixed(2),
    accuracy: accuracy.toFixed(2),
  };
}