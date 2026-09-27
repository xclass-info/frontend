// src/components/ExploreResourcesModal.jsx
// The 4-option chooser revealed after clicking "Explore Learning Resources"
// on the homepage - mirrors RequestHelpModal's chrome for consistency.
import { Link } from "react-router-dom";

const OPTIONS = [
  {
    to: "/courses",
    icon: "📚",
    label: "Courses",
    desc: "Live online courses taught by our mentors.",
  },
  {
    to: "/tutors",
    icon: "🧑‍🏫",
    label: "1-1 Learning",
    desc: "Book a 1-on-1 session with a mentor for general help.",
  },
  {
    to: "/projects",
    icon: "💡",
    label: "Projects",
    desc: "Hands-on projects you build alongside a mentor.",
  },
  {
    to: "/research",
    icon: "🔬",
    label: "Research",
    desc: "Real research topics led by PhD mentors.",
  },
];

export default function ExploreResourcesModal({ onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 32,
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <h3 style={{ margin: 0 }}>🔎 Explore Learning Resources</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>
          What are you looking for?
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {OPTIONS.map((o) => (
            <Link
              key={o.to}
              to={o.to}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                borderRadius: 12,
                border: "1px solid #eee",
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#4a8fe2";
                e.currentTarget.style.background = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#eee";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 26 }}>{o.icon}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#1a1a2e",
                  }}
                >
                  {o.label}
                </span>
                <span style={{ display: "block", fontSize: 13, color: "#888" }}>
                  {o.desc}
                </span>
              </span>
              <span style={{ color: "#00274c", fontWeight: 700 }}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
