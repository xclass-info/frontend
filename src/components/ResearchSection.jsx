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
    <section style={{ padding: "80px 24px", background: "white" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
            🔬 Latest Research
          </h2>
          <p style={{ color: "#666" }}>
            Cutting-edge research from our tutors.
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
              style={{
                background: "#f9fafb",
                borderRadius: 16,
                padding: 24,
                border: "1px solid #eee",
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

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a
            href='/#/research'
            style={{
              padding: "12px 32px",
              borderRadius: 32,
              background: "#4a90e2",
              color: "white",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            View All Research →
          </a>
        </div>
      </div>
    </section>
  );
}
