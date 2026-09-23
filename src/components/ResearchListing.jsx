// src/components/ResearchListing.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import Navbar from "./Navbar";
import { SkeletonClassCard } from "./Skeleton";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Footer from "./Footer";
import { formatMentorName } from "../utils/mentorName";
import { seatsStatus } from "../utils/format";


export default function ResearchListing() {
  const location = useLocation();
  const navigate = useNavigate();
  const [research, setResearch] = useState([]);
  const [teachers, setTeachers] = useState({});
  const [loading, setLoading] = useState(true);
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

  // Mentor's live name from their profile; the name saved on the post is
  // only a fallback (older posts stored the literal string "Teacher").
  function mentorName(r) {
    const liveName = teachers[r.teacherId];
    if (liveName) return formatMentorName(liveName);
    return r.teacherName && r.teacherName !== "Teacher"
      ? r.teacherName
      : "Mentor";
  }

  // Link to the mentor's profile page when we can resolve them; plain text
  // otherwise (e.g. a post whose author no longer has a profile).
  function mentorLabel(r) {
    const name = mentorName(r);
    if (!teachers[r.teacherId]) return name;
    return (
      <Link
        to={`/teacher/${r.teacherId}`}
        onClick={(e) => e.stopPropagation()}
        style={{ color: "#00274c", textDecoration: "underline" }}
      >
        {name}
      </Link>
    );
  }

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
            Explore research topics, ideas and their impact from our mentors.
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
                onClick={() => navigate(`/research/${r.id}`)}
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

                {r.deliverable && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#166534",
                      fontWeight: 600,
                      margin: "0 0 8px",
                    }}
                  >
                    📦 You'll produce: {r.deliverable}
                  </p>
                )}

                {r.seats ? (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#555",
                      fontWeight: 600,
                      margin: "0 0 12px",
                    }}
                  >
                    👥 {seatsStatus(r.seats, r.enrolledCount)}
                  </p>
                ) : null}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#888" }}>
                    👩‍🏫 Mentored by: {mentorLabel(r)}
                  </span>
                  <span
                    style={{ fontSize: 12, color: "#00274c", fontWeight: 600 }}
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
      <Footer />
    </div>
  );
}
