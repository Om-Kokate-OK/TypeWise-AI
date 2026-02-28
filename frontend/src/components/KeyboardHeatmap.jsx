const keyboardRows = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l"],
  ["z","x","c","v","b","n","m"]
];

function getHeatColor(stats) {
  if (!stats) return "#e5e7eb"; // Not used

  const { correct, wrong } = stats;

  if (wrong > 0) {
    const intensity = Math.min(wrong, 5);
    const greenBlue = 255 - intensity * 35;
    return `rgb(255, ${greenBlue}, ${greenBlue})`; // Red scale
  }

  if (correct > 0) {
    return "#bbf7d0"; // Soft green for strong keys
  }

  return "#e5e7eb";
}

export default function KeyboardHeatmap({ keyStats }) {
  return (
    <div style={{ marginTop: "40px" }}>
      <h3 style={{ marginBottom: "15px" }}>Keyboard Heatmap</h3>

      {/* Keyboard */}
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
            const stats = keyStats?.[key];
            const wrongCount = stats?.wrong || 0;
            const correctCount = stats?.correct || 0;

            return (
              <div
                key={key}
                title={`Correct: ${correctCount} | Wrong: ${wrongCount}`}
                style={{
                  width: "44px",
                  height: "44px",
                  margin: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  background: getHeatColor(stats),
                  fontWeight: "600",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  cursor: "default"
                }}
              >
                {key}
              </div>
            );
          })}
        </div>
      ))}

      {/* Legend */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          fontSize: "14px"
        }}
      >
        <LegendBox color="#bbf7d0" label="Strong" />
        <LegendBox color="#fca5a5" label="Weak" />
        <LegendBox color="#e5e7eb" label="Not Used" />
      </div>
    </div>
  );
}

function LegendBox({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div
        style={{
          width: "16px",
          height: "16px",
          background: color,
          borderRadius: "4px"
        }}
      />
      <span>{label}</span>
    </div>
  );
}