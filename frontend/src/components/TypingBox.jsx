import TargetTextDisplay from "./TargetTextDisplay";

export default function TypingBox({ text, value, onChange }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      
      {/* Target Text with Live Highlight */}
      <div
        style={{
          background: "#f8fafc",
          padding: "14px",
          borderRadius: "8px",
          marginBottom: "12px",
          border: "1px solid #e2e8f0"
        }}
      >
        <TargetTextDisplay text={text} input={value} />
      </div>

      {/* Typing Area */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="Start typing here..."
        style={{
          width: "100%",
          fontSize: "16px",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #cbd5f5",
          outline: "none"
        }}
      />
    </div>
  );
}