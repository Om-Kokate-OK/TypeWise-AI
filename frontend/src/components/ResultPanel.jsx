export default function ResultPanel({
  time,
  rawWPM,
  netWPM,
  accuracy,
  rawAccuracy,
  correct,
  incorrect,
  extra,
  missed
}) {
  return (
    <div style={{ marginTop: "24px" }}>
      <h3 style={{ marginBottom: "12px" }}>Results</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px"
        }}
      >
        <Stat label="Time (s)" value={time} />
        <Stat label="Raw WPM" value={rawWPM} />
        <Stat label="Net WPM" value={netWPM} />
        <Stat label="Accuracy" value={`${accuracy}%`} tooltip="Based on final text (after corrections)" />
        <Stat label="Raw Accuracy" value={`${rawAccuracy}%`} tooltip="Based on every keystroke (before corrections)" />
        <Stat label="Correct" value={correct} color="#16a34a" />
        <Stat label="Incorrect" value={incorrect} color="#dc2626" />
        <Stat label="Extra" value={extra} color="#d97706" />
        <Stat label="Missed" value={missed} color="#6366f1" />
      </div>
    </div>
  );
}

function Stat({ label, value, color, tooltip }) {
  return (
    <div
      title={tooltip || ""}
      style={{
        background: "#f1f5f9",
        padding: "14px",
        borderRadius: "8px",
        textAlign: "center",
        border: "1px solid #e2e8f0",
        cursor: tooltip ? "help" : "default"
      }}
    >
      <div style={{ fontSize: "13px", color: "#64748b" }}>{label}</div>
      <div style={{ fontSize: "22px", fontWeight: "bold", color: color || "inherit" }}>
        {value}
      </div>
    </div>
  );
}
