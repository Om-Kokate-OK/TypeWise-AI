export default function TargetTextDisplay({ text, input }) {
  return (
    <div
      style={{
        fontSize: "22px",
        lineHeight: "36px",
        marginBottom: "20px",
        fontFamily: "monospace",
        wordWrap: "break-word"
      }}
    >
      {text.split("").map((char, index) => {
        const typedChar = input[index];

        let color = "#9ca3af"; // default grey
        let borderBottom = "none";

        // Correct
        if (typedChar === char) {
          color = "#16a34a"; // green
        }

        // Wrong
        if (typedChar && typedChar !== char) {
          color = "#dc2626"; // red
        }

        // Active cursor
        if (index === input.length) {
          borderBottom = "3px solid #facc15"; // yellow underline
        }

        return (
          <span
            key={index}
            style={{
              color,
              borderBottom,
              paddingBottom: "2px"
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
}