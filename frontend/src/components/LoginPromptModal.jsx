import { useNavigate } from "react-router-dom";

export default function LoginPromptModal({ onClose, message }) {
    const navigate = useNavigate();

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "32px",
                    maxWidth: "420px",
                    width: "90%",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                    textAlign: "center",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ marginTop: 0, marginBottom: "12px", fontSize: "20px" }}>
                    🔒 Login Required
                </h3>

                <p style={{ color: "#64748b", marginBottom: "24px", lineHeight: 1.5 }}>
                    {message ||
                        "Sign in to save your session data, track progress over time, and unlock adaptive key-improvement insights."}
                </p>

                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                    <button
                        onClick={() => navigate("/login")}
                        style={{
                            padding: "10px 24px",
                            borderRadius: "8px",
                            border: "none",
                            background: "#2563eb",
                            color: "#fff",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "14px",
                        }}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => navigate("/register")}
                        style={{
                            padding: "10px 24px",
                            borderRadius: "8px",
                            border: "2px solid #2563eb",
                            background: "#fff",
                            color: "#2563eb",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "14px",
                        }}
                    >
                        Register
                    </button>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        marginTop: "16px",
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        fontSize: "13px",
                    }}
                >
                    Continue as Guest
                </button>
            </div>
        </div>
    );
}
