// src/components/CourseListing.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import Navbar from "./Navbar";
import { SkeletonClassCard } from "./Skeleton";
import { useNavigate, Link } from "react-router-dom";
import Footer from "./Footer";
import { formatMentorName } from "../utils/mentorName";
import { seatsStatus, lessonWeekday } from "../utils/format";

const STATUS_BADGE = {
  registration: { label: "Registration", color: "#92400e", bg: "rgba(217,119,6,0.08)" },
  active: { label: "Active", color: "#166534", bg: "rgba(22,101,52,0.08)" },
  completed: { label: "Completed", color: "#1e40af", bg: "rgba(37,99,235,0.08)" },
};

export default function CourseListing() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "classes"), (snap) => {
      setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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

  function mentorName(c) {
    const liveName = teachers[c.teacherId];
    if (liveName) return formatMentorName(liveName);
    return c.teacherName && c.teacherName !== "Teacher"
      ? c.teacherName
      : "Mentor";
  }

  function mentorLabel(c) {
    const name = mentorName(c);
    if (!teachers[c.teacherId]) return name;
    return (
      <Link
        to={`/teacher/${c.teacherId}`}
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
            📚 Courses
          </h1>
          <p style={{ color: "#666", fontSize: "1rem" }}>
            Browse live online courses taught by our mentors.
          </p>
        </div>

        {courses.length === 0 ? (
          <div style={{ textAlign: "center", color: "#aaa", padding: 40 }}>
            <p>😴 No courses posted yet. Check back soon!</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {courses.map((c) => {
              const badge = STATUS_BADGE[c.status] || STATUS_BADGE.registration;
              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/courses/${c.id}`)}
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#333", margin: 0 }}>
                      {c.title}
                    </h3>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: badge.color,
                        background: badge.bg,
                        padding: "3px 10px",
                        borderRadius: 20,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 13,
                      color: "#555",
                      margin: "0 0 16px",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {c.description}
                  </p>

                  {c.lessons?.length > 0 && (
                    <p style={{ fontSize: 12, color: "#666", margin: "0 0 8px" }}>
                      📅 {c.lessons[0].date} ({lessonWeekday(c.lessons[0].date)})
                      {c.lessons.length > 1 ? ` +${c.lessons.length - 1} more` : ""}
                    </p>
                  )}

                  <p style={{ fontSize: 12, color: "#666", margin: "0 0 4px" }}>
                    💰 {c.price > 0 ? `$${c.price}` : "Free"}
                  </p>

                  {c.maxSeats ? (
                    <p
                      style={{
                        fontSize: 12,
                        color: "#555",
                        fontWeight: 600,
                        margin: "0 0 12px",
                      }}
                    >
                      👥 {seatsStatus(c.maxSeats, c.enrolledCount)}
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
                      👩‍🏫 Mentored by: {mentorLabel(c)}
                    </span>
                    <span style={{ fontSize: 12, color: "#00274c", fontWeight: 600 }}>
                      Read more →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
