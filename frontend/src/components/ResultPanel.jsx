export default function ResultPanel({
  time,
  wpm,
  netAccuracy,
  grossAccuracy,
  backspaces,
  wrongKeys
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
        <Stat label="WPM" value={wpm} />
        <Stat label="Net Accuracy" value={`${netAccuracy}%`} />
        <Stat label="Gross Accuracy" value={`${grossAccuracy}%`} />
        <Stat label="Wrong Keys" value={wrongKeys} />
        <Stat label="Backspaces" value={backspaces} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        background: "#f1f5f9",
        padding: "14px",
        borderRadius: "8px",
        textAlign: "center",
        border: "1px solid #e2e8f0"
      }}
    >
      <div style={{ fontSize: "13px", color: "#64748b" }}>{label}</div>
      <div style={{ fontSize: "22px", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}
