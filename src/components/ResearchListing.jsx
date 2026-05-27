// src/components/ResearchListing.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Navbar from "./Navbar";
import { SkeletonClassCard } from "./Skeleton";
import { useLocation } from "react-router-dom";

export default function ResearchListing() {
  const location = useLocation();
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  // Update filter when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFilter(params.get("type") || "all");
  }, [location.search]);

  useEffect(() => {
    const q = query(
      collection(db, "research"),
      where("status", "==", "published"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setResearch(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered =
    filter === "all" ? research : research.filter((r) => r.type === filter);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
        <Navbar />
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "100px 24px 48px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            {[1, 2, 3].map((i) => (
              <SkeletonClassCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Navbar />
      <div
        style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 48px" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
            🔬 Research
          </h1>
          <p style={{ color: "#666", fontSize: "1rem" }}>
            Explore research topics, ideas and their impact from our tutors.
          </p>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "#aaa", padding: 40 }}>
            <p>😴 No research posted yet. Check back soon!</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {filtered.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelected(r)}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 12px rgba(0,0,0,0.07)";
                }}
              >
                {/* Type badge */}

                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 12,
                    color: "#333",
                  }}
                >
                  {r.title}
                </h3>

                <div style={{ marginBottom: 12 }}>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#aaa",
                      margin: "0 0 4px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Idea
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#555",
                      margin: 0,
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {r.idea}
                  </p>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#aaa",
                      margin: "0 0 4px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Impact
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#555",
                      margin: 0,
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {r.impact}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#888" }}>
                    👩‍🏫 {r.teacherName}
                  </span>
                  <span
                    style={{ fontSize: 12, color: "#4a90e2", fontWeight: 600 }}
                  >
                    Read more →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
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
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 32,
              width: "100%",
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3 style={{ margin: 0 }}>🔬 Research Details</h3>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Type badge in modal */}
            {/* <span
              style={{
                display: "inline-block",
                fontSize: 12,
                padding: "4px 12px",
                borderRadius: 20,
                fontWeight: 600,
                marginBottom: 12,
                background:
                  selected.type === "publication" ? "#eff6ff" : "#f0fdf4",
                color: selected.type === "publication" ? "#4a90e2" : "#16a34a",
              }}
            >
              {selected.type === "publication"
                ? "📄 Research Publication Track"
                : "🧪 Research Exploration Track"}
            </span> */}

            <h2 style={{ fontSize: 20, marginBottom: 20 }}>{selected.title}</h2>

            <div style={{ marginBottom: 20 }}>
              <p
                style={{
                  fontSize: 12,
                  color: "#aaa",
                  margin: "0 0 8px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Research Idea
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "#555",
                  lineHeight: 1.7,
                  margin: 0,
                  background: "#f9fafb",
                  padding: 14,
                  borderRadius: 8,
                }}
              >
                {selected.idea}
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p
                style={{
                  fontSize: 12,
                  color: "#aaa",
                  margin: "0 0 8px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Research Impact
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "#555",
                  lineHeight: 1.7,
                  margin: 0,
                  background: "#f0fdf4",
                  padding: 14,
                  borderRadius: 8,
                  borderLeft: "3px solid #27ae60",
                }}
              >
                {selected.impact}
              </p>
            </div>

            {selected.details && (
              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    fontSize: 12,
                    color: "#aaa",
                    margin: "0 0 8px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Additional Details
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "#555",
                    lineHeight: 1.7,
                    margin: 0,
                    background: "#f9fafb",
                    padding: 14,
                    borderRadius: 8,
                  }}
                >
                  {selected.details}
                </p>
              </div>
            )}

            <div
              style={{
                fontSize: 13,
                color: "#888",
                borderTop: "1px solid #f0f0f0",
                paddingTop: 16,
              }}
            >
              👩‍🏫 Posted by {selected.teacherName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
