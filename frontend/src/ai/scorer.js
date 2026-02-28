export function scoreWord(word, weakKeys) {
  let score = 1;

  for (const char of word) {
    if (weakKeys.includes(char)) {
      score += 3;
    }
  }

  return score;
}

export function weightedPick(words, weakKeys) {
  if (!words || words.length === 0) {
    return "typing"; // safe fallback word
  }

  const weighted = words.map((word) => ({
    word,
    weight: scoreWord(word, weakKeys),
  }));

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);

  if (totalWeight === 0) {
    return words[Math.floor(Math.random() * words.length)];
  }

  let random = Math.random() * totalWeight;

  for (const item of weighted) {
    if (random < item.weight) return item.word;
    random -= item.weight;
  }

  return weighted[0].word;
}