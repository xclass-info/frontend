// src/components/InternshipSection.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { Link } from "react-router-dom";

export default function InternshipSection() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "internships"),
      where("status", "==", "open"),
      limit(3),
    );
    const unsub = onSnapshot(q, (snap) => {
      setInternships(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading || internships.length === 0) return null;

  return (
    <section style={{ padding: "80px 24px", background: "#f9fafb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
            🧪 Open Internships
          </h2>
          <p style={{ color: "#666" }}>
            Research internship opportunities from our mentors.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 24,
          }}
        >
          {internships.map((intern) => (
            <div
              key={intern.id}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
              }}
            >
              {/* <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    background: "#f0fdf4",
                    color: "#16a34a",
                    padding: "2px 10px",
                    borderRadius: 20,
                    fontWeight: 600,
                  }}
                >
                  {intern.mode === "Remote"
                    ? "🌐"
                    : intern.mode === "In-Person"
                      ? "🏫"
                      : "🔄"}{" "}
                  {intern.mode}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    background: "#eff6ff",
                    color: "#4a90e2",
                    padding: "2px 10px",
                    borderRadius: 20,
                    fontWeight: 600,
                  }}
                >
                  ⏱ {intern.duration}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    background:
                      intern.stipend === "Paid" ? "#fef9c3" : "#f9fafb",
                    color: intern.stipend === "Paid" ? "#854d0e" : "#888",
                    padding: "2px 10px",
                    borderRadius: 20,
                    fontWeight: 600,
                  }}
                >
                  💰 {intern.stipend}
                </span>
              </div> */}
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 4,
                  color: "#333",
                }}
              >
                {intern.title}
              </h3>
              <p
                style={{
                  fontSize: 12,
                  color: "#4a90e2",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                🔬 {intern.field}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "#555",
                  lineHeight: 1.5,
                  marginBottom: 12,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {intern.description}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: "#888",
                }}
              >
                <span>👩‍🏫 {intern.teacherName}</span>
                <span style={{ color: "#e74c3c" }}>📅 {intern.deadline}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link
            to='/internship'
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
            View All Internships →
          </Link>
        </div>
      </div>
    </section>
  );
}
