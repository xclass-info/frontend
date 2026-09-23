// src/components/ShowcaseListing.jsx
// Public proof-of-outcomes page: finished student projects, published by
// mentors from their dashboard's Showcase tab.
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Link } from "react-router-dom";
import { SkeletonClassCard } from "./Skeleton";
import { formatMentorName } from "../utils/mentorName";
import { DELIVERABLE_OPTIONS } from "../utils/deliverables";

export default function ShowcaseListing() {
  const [entries, setEntries] = useState([]);
  const [teachers, setTeachers] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "showcase"), (snap) => {
      setEntries(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)),
      );
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    getDocs(collection(db, "teachers"))
      .then((snap) => {
        const map = {};
        snap.docs.forEach((d) => {
          map[d.id] = d.data().name;
        });
        setTeachers(map);
      })
      .catch((err) => console.error(err));
  }, []);

  function mentorLabel(s) {
    const liveName = teachers[s.teacherId];
    const name = liveName
      ? formatMentorName(liveName)
      : s.teacherName && s.teacherName !== "Teacher"
        ? s.teacherName
        : "Mentor";
    if (!liveName) return name;
    return (
      <Link
        to={`/teacher/${s.teacherId}`}
        onClick={(e) => e.stopPropagation()}
        style={{ color: "#00274c", textDecoration: "underline" }}
      >
        {name}
      </Link>
    );
  }

  const filtered =
    filter === "all" ? entries : entries.filter((e) => e.outputType === filter);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
        <Navbar />
        <div
          style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 48px" }}
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
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
            🏆 Student Showcase
          </h1>
          <p style={{ color: "#666", fontSize: "1rem", maxWidth: 600, margin: "0 auto" }}>
            Real projects our students have finished with their mentors - not
            just what's possible, but what's already been done.
          </p>
        </div>

        {entries.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 32,
            }}
          >
            <button
              onClick={() => setFilter("all")}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: "1px solid " + (filter === "all" ? "#00274c" : "#ddd"),
                background: filter === "all" ? "#00274c" : "white",
                color: filter === "all" ? "white" : "#555",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              All
            </button>
            {DELIVERABLE_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  border: "1px solid " + (filter === d ? "#00274c" : "#ddd"),
                  background: filter === d ? "#00274c" : "white",
                  color: filter === d ? "white" : "#555",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {entries.length === 0 ? (
          <div style={{ textAlign: "center", color: "#aaa", padding: 40 }}>
            <p>😴 No finished projects published yet. Check back soon!</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "#aaa", padding: 40 }}>
            <p>No projects with that output type yet.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {filtered.map((s) => (
              <div
                key={s.id}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#166534",
                    background: "rgba(22,101,52,0.08)",
                    padding: "3px 10px",
                    borderRadius: 20,
                    marginBottom: 12,
                  }}
                >
                  📦 {s.outputType}
                </span>

                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 8,
                    color: "#333",
                  }}
                >
                  {s.title}
                </h3>

                <p style={{ fontSize: 13, color: "#888", margin: "0 0 12px" }}>
                  👤 {s.studentName}
                </p>

                <p
                  style={{
                    fontSize: 13,
                    color: "#555",
                    margin: "0 0 16px",
                    lineHeight: 1.6,
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {s.summary}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#888" }}>
                    👩‍🏫 Mentored by: {mentorLabel(s)}
                  </span>
                  {s.outputUrl && (
                    <a
                      href={s.outputUrl}
                      target='_blank'
                      rel='noreferrer'
                      style={{
                        fontSize: 12,
                        color: "#00274c",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      View work →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
