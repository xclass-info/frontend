// src/components/ResearchSection.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  limit,
  orderBy,
} from "firebase/firestore";

export default function ResearchSection() {
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "research"),
      where("status", "==", "published"),
      limit(3),
    );
    const unsub = onSnapshot(q, (snap) => {
      setResearch(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading || research.length === 0) return null;

  return (
    <section style={{ padding: "120px 24px 80px 24px", background: "white" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className='reveal' style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
            🔬 Research Opportunities
          </h2>
          <p style={{ color: "#666" }}>
            Explore fascinating research ideas across science, technology, and
            beyond — spark your curiosity, discover your passion.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 24,
          }}
        >
          {research.map((r) => (
            <div
              key={r.id}
              className='reveal'
              style={{
                background: "#f9fafb",
                borderRadius: 16,
                padding: 24,
                border: "1px solid #eee",
                cursor: "pointer",
                transition: "transform 0.25s, box-shadow 0.25s, border-color 0.25s",
              }}
              onClick={() => {
                window.location.hash = `#/research/${r.id}`;
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.1)";
                e.currentTarget.style.borderColor = "#ffcb05";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#eee";
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 10,
                  color: "#333",
                }}
              >
                🔬 {r.title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#555",
                  lineHeight: 1.5,
                  marginBottom: 10,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {r.idea}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#27ae60",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Impact: {r.impact.substring(0, 80)}...
              </p>
            </div>
          ))}
        </div>

        <div className='reveal' style={{ textAlign: "center", marginTop: 32 }}>
          <a
            href='/#/research'
            style={{
              display: "inline-block",
              padding: "12px 32px",
              borderRadius: 32,
              background: "#00274c",
              color: "white",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 15,
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,39,76,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            View All Research →
          </a>
        </div>
      </div>
    </section>
  );
}
