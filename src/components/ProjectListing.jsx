// src/components/ProjectListing.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import Navbar from "./Navbar";
import { SkeletonClassCard } from "./Skeleton";
import { useNavigate, Link } from "react-router-dom";
import Footer from "./Footer";
import { formatMentorName } from "../utils/mentorName";
import { seatsStatus } from "../utils/format";

const labelStyle = {
  fontSize: 12,
  color: "#aaa",
  margin: "0 0 4px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const clampStyle = (lines) => ({
  fontSize: 13,
  color: "#555",
  margin: 0,
  lineHeight: 1.5,
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

export default function ProjectListing() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [teachers, setTeachers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "projects"), (snap) => {
      setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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

  function mentorName(p) {
    const liveName = teachers[p.teacherId];
    if (liveName) return formatMentorName(liveName);
    return p.teacherName && p.teacherName !== "Teacher"
      ? p.teacherName
      : "Mentor";
  }

  function mentorLabel(p) {
    const name = mentorName(p);
    if (!teachers[p.teacherId]) return name;
    return (
      <Link
        to={`/teacher/${p.teacherId}`}
        onClick={(e) => e.stopPropagation()}
        style={{ color: "#00274c", textDecoration: "underline" }}
      >
        {name}
      </Link>
    );
  }

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
            💡 Projects
          </h1>
          <p style={{ color: "#666", fontSize: "1rem" }}>
            Explore hands-on projects you can work on with our mentors.
          </p>
        </div>

        {projects.length === 0 ? (
          <div style={{ textAlign: "center", color: "#aaa", padding: 40 }}>
            <p>😴 No projects posted yet. Check back soon!</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
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
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 12,
                    color: "#333",
                  }}
                >
                  {p.title}
                </h3>

                <div style={{ marginBottom: 12 }}>
                  <p style={labelStyle}>Description</p>
                  <p style={clampStyle(3)}>{p.description}</p>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <p style={labelStyle}>What You'll Learn</p>
                  <p style={clampStyle(2)}>{p.learning}</p>
                </div>

                {p.seats ? (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#555",
                      fontWeight: 600,
                      margin: "0 0 12px",
                    }}
                  >
                    👥 {seatsStatus(p.seats, p.enrolledCount)}
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
                    👩‍🏫 Mentored by: {mentorLabel(p)}
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
      <Footer />
    </div>
  );
}
