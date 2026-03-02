import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Header({ isDarkMode, setIsDarkMode }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const navLink = (to, label) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: active ? "var(--accent)" : "var(--text-dim)",
          borderBottom: active ? "1px solid var(--accent)" : "1px solid transparent",
          paddingBottom: 2,
          transition: "all 0.2s",
          textDecoration: "none",
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <header
      style={{
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)", // Uses dynamic background
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "all 0.3s ease"
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 12, height: 12, background: "var(--accent)", borderRadius: "2px" }} />
        <span style={{ 
          fontFamily: "var(--font-mono)", 
          fontWeight: 700, 
          fontSize: 14, 
          color: "var(--text)", 
          letterSpacing: "-0.5px" 
        }}>
          TypeWise<span style={{ color: "var(--accent)" }}>_</span>
        </span>
      </Link>

      {/* Nav & Controls */}
      <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {navLink("/", "Type")}
          {user && navLink("/history", "History")}
          {user && navLink("/profile", "Profile")}
        </div>

        {/* Vertical Divider */}
        <div style={{ width: "1px", height: "16px", background: "var(--border)" }} />

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Toggle Theme"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            color: "var(--text-dim)",
            transition: "color 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-dim)"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        {user ? (
          <button
            onClick={logout}
            style={{
              fontSize: 10,
              padding: "6px 14px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              color: "var(--error)",
              border: "1px solid var(--border)",
              background: "transparent",
              transition: "0.2s"
            }}
          >
            LOGOUT
          </button>
        ) : (
          <Link to="/login">
            <button
              style={{
                fontSize: 10,
                padding: "6px 14px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                color: "var(--accent)",
                border: "1px solid var(--accent)",
                background: "transparent",
                transition: "0.2s"
              }}
            >
              LOGIN
            </button>
          </Link>
        )}
      </nav>
    </header>
  );
}