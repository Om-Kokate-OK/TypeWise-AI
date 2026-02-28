const keyboardRows = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l"],
  ["z","x","c","v","b","n","m"]
];

function getHeatColor(wrongCount) {
  if (!wrongCount) return "#e5e7eb"; // neutral grey

  // Clamp intensity between 1 and 5
  const intensity = Math.min(wrongCount, 5);

  // Red scale: darker with more mistakes
  const redValue = 255;
  const greenBlue = 255 - intensity * 35;

  return `rgb(${redValue}, ${greenBlue}, ${greenBlue})`;
}

export default function KeyboardHeatmap({ keyStats }) {
  return (
    <div style={{ marginTop: "30px" }}>
      <h3 style={{ marginBottom: "15px" }}>Keyboard Heatmap</h3>

      {keyboardRows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "8px"
          }}
        >
          {row.map((key) => {
            const wrongCount = keyStats?.[key]?.wrong || 0;

            return (
              <div
                key={key}
                style={{
                  width: "42px",
                  height: "42px",
                  margin: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "6px",
                  background: getHeatColor(wrongCount),
                  fontWeight: "600",
                  textTransform: "uppercase",
                  transition: "background 0.3s ease"
                }}
              >
                {key}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}