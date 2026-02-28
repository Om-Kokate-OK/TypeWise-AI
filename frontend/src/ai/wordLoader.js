// Import the txt file as a raw string (works with Vite or Webpack)
import rawWords from "../data/words.txt?raw"; // Vite

let cachedWords = null;

export function loadCommonWords() {
  if (cachedWords) return cachedWords;

  const allWords = rawWords
    .split("\n")
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 1);

  cachedWords = {
    easy: allWords.slice(0, 1000),
    medium: allWords.slice(1000, 4000),
    hard: allWords.slice(4000, 10000),
  };

  return cachedWords;
}