const keyboardRows = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l"],
  ["z","x","c","v","b","n","m"]
];

export default function KeyboardHeatmap() {
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
          {row.map((key) => (
            <div
              key={key}
              style={{
                width: "40px",
                height: "40px",
                margin: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                background: "#e5e7eb",
                fontWeight: "600",
                textTransform: "uppercase"
              }}
            >
              {key}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}