export default function TypingBox({ text, value, onChange }) {
  return (
    <div>
      <p style={{ fontSize: "18px", marginBottom: "10px" }}>{text}</p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        style={{
          width: "100%",
          fontSize: "16px",
          padding: "10px"
        }}
        placeholder="Start typing here..."
      />
    </div>
  );
}
