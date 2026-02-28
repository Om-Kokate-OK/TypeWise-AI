import { loadCommonWords } from "./wordLoader";
import { weightedPick } from "./scorer";

function chooseDifficulty(performance) {
  if (!performance) return "easy";

  const { stabilityScore, wpm } = performance;

  if (stabilityScore > 80 && wpm > 50) return "hard";
  if (stabilityScore > 60 && wpm > 35) return "medium";
  return "easy";
}

function filterByLength(words, difficulty) {
  const ranges = {
    easy: [2, 5],
    medium: [4, 8],
    hard: [7, Infinity],
  };

  const [min, max] = ranges[difficulty];
  return words.filter((w) => w.length >= min && w.length <= max);
}

export function generateAdaptiveText(
  performance,
  weakKeys = [],
  wordCount = 40
) {
  const wordDatabase = loadCommonWords();
  const difficulty = chooseDifficulty(performance);

  const basePool = wordDatabase[difficulty];
let wordPool = filterByLength(basePool, difficulty);

if (wordPool.length === 0) {
  wordPool = basePool;
}
  const guaranteedCount =
    weakKeys.length > 0 ? Math.floor(wordCount * 0.4) : 0;

  const randomCount = wordCount - guaranteedCount;

  const weakWords = wordPool.filter((w) =>
    weakKeys.some((key) => w.includes(key))
  );

  const sentence = [];

  // 40% guaranteed weak words
  for (let i = 0; i < guaranteedCount; i++) {
    if (weakWords.length > 0) {
      sentence.push(
        weakWords[Math.floor(Math.random() * weakWords.length)]
      );
    } else {
      sentence.push(weightedPick(wordPool, weakKeys));
    }
  }

  // Remaining weighted random
  for (let i = 0; i < randomCount; i++) {
    sentence.push(weightedPick(wordPool, weakKeys));
  }

  // Shuffle
  for (let i = sentence.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sentence[i], sentence[j]] = [sentence[j], sentence[i]];
  }

  return sentence.join(" ");
}