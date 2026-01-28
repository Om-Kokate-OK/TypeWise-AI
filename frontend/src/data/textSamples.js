export const TEXT_SAMPLES = [
    "a b c d e f g h i j k l m n o p",
  // "Typing fast requires accuracy and focus Consistency is the key to improvement",
  // "Consistency is the key to improvement",
  // "Learning to type efficiently saves time",
  // "Speed comes naturally with daily practice"
];

// helper to get random text
export function getRandomText() {
  const index = Math.floor(Math.random() * TEXT_SAMPLES.length);
  return TEXT_SAMPLES[index];
}