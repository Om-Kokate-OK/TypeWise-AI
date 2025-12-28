export default function ResultPanel({ wpm, accuracy, time }) {
  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Results</h3>
      <p>Time: {time}s</p>
      <p>WPM: {wpm}</p>
      <p>Accuracy: {accuracy}%</p>
    </div>
  );
}
