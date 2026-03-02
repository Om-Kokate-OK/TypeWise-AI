import { useEffect, useRef } from "react";

export default function TypingViewport({
  text,
  input,
  onChange
}) {
  const hiddenInputRef = useRef(null);

  useEffect(() => {
    hiddenInputRef.current.focus();
  }, []);

  return (
    <div
      onClick={() => hiddenInputRef.current.focus()}
      style={{
        maxWidth: "900px",
        margin: "120px auto 0 auto",
        fontSize: "28px",
        lineHeight: "42px",
        letterSpacing: "0.5px",
        cursor: "text",
        userSelect: "none"
      }}
    >
      {/* Hidden Input */}
      <input
        ref={hiddenInputRef}
        value={input}
        onChange={(e) => onChange(e.target.value)}
        style={{
          position: "absolute",
          opacity: 0
        }}
      />

      {/* Render Text */}
      {text.split("").map((char, index) => {
        const typedChar = input[index];

        let color = "#94a3b8";

        if (typedChar == null) {
          color = "#cbd5e1";
        } else if (typedChar === char) {
          color = "#16a34a";
        } else {
          color = "#ef4444";
        }

        const isActive = index === input.length;

        return (
          <span
            key={index}
            style={{
              color,
              borderBottom: isActive
                ? "3px solid #2563eb"
                : "none",
              transition: "0.1s ease"
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
}