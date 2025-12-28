export function calculateWPM(totalChars, timeInSeconds) {
  if (timeInSeconds === 0) return 0;

  const wordsTyped = totalChars / 5;
  const minutes = timeInSeconds / 60;

  return Math.round(wordsTyped / minutes);
}