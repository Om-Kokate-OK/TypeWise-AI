export default function LiveStats({ netWPM, accuracy, time }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "40px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: "60px", // Increased gap for a cleaner look
        padding: "12px 40px",
        background: "var(--acc-bg)", // Use theme background
        border: "1px solid var(--border)",
        borderRadius: "12px",
        backdropFilter: "blur(8px)",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        zIndex: 100,
        transition: "all 0.3s ease",
      }}
    >
      <StatItem label="WPM" value={netWPM} />
      
      {/* Subtle Divider */}
      <div style={{ width: "1px", height: "24px", background: "var(--border)" }} />
      
      <StatItem 
        label="ACC" 
        value={`${accuracy}%`} 
        color={accuracy < 90 ? "var(--error)" : "var(--success)"} 
      />
      
      <div style={{ width: "1px", height: "24px", background: "var(--border)" }} />
      
      <StatItem label="TIME" value={`${time}s`} />
    </div>
  );
}

/**
 * Reusable sub-component for individual stats
 */
function StatItem({ label, value, color = "var(--text)" }) {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      minWidth: "50px" 
    }}>
      <span style={{ 
        fontFamily: "var(--font-mono)", 
        fontSize: "10px", 
        color: "var(--text-dim)", 
        letterSpacing: "0.1em",
        marginBottom: "2px"
      }}>
        {label}
      </span>
      <span style={{ 
        fontFamily: "var(--font-mono)", 
        fontSize: "18px", 
        fontWeight: "700", 
        color: color,
        transition: "color 0.2s ease"
      }}>
        {value}
      </span>
    </div>
  );
}