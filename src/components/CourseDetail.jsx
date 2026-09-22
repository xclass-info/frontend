// src/components/CourseDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { formatMentorName } from "../utils/mentorName";
import { lessonWeekday } from "../utils/format";
import { SeatsRow, RegisterModal } from "./RegisterControls";
import { useStudentAuth } from "../utils/useStudentAuth";

const sectionLabel = {
  fontSize: 12,
  color: "#aaa",
  margin: "0 0 8px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const sectionBody = {
  fontSize: 16,
  color: "#444",
  lineHeight: 1.8,
  margin: 0,
  padding: 18,
  borderRadius: 10,
  whiteSpace: "pre-wrap",
};

const STATUS_BADGE = {
  registration: { label: "Registration", color: "#92400e", bg: "rgba(217,119,6,0.08)" },
  active: { label: "Active", color: "#166534", bg: "rgba(22,101,52,0.08)" },
  completed: { label: "Completed", color: "#1e40af", bg: "rgba(37,99,235,0.08)" },
};

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { student } = useStudentAuth();
  const [course, setCourse] = useState(undefined); // undefined = loading
  const [mentor, setMentor] = useState(null);
  const [registering, setRegistering] = useState(false);

  function markRegistered() {
    setCourse((c) => ({ ...c, enrolledCount: (c.enrolledCount || 0) + 1 }));
  }

  function openRegister() {
    if (!student) {
      navigate("/student/login", { state: { from: location.pathname } });
      return;
    }
    setRegistering(true);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const snap = await getDoc(doc(db, "classes", courseId));
        const data = snap.exists() ? { id: snap.id, ...snap.data() } : null;
        if (!data) {
          if (!cancelled) setCourse(null);
          return;
        }
        if (!cancelled) setCourse(data);
        const teacherSnap = await getDoc(doc(db, "teachers", data.teacherId));
        if (!cancelled && teacherSnap.exists() && teacherSnap.data().name) {
          setMentor({ id: teacherSnap.id, name: teacherSnap.data().name });
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setCourse(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const pageStyle = { minHeight: "100vh", background: "#f9fafb" };
  const wrapStyle = {
    maxWidth: 820,
    margin: "0 auto",
    padding: "100px 24px 48px",
  };

  if (course === undefined) {
    return (
      <div style={pageStyle}>
        <Navbar />
        <div style={{ ...wrapStyle, textAlign: "center", color: "#aaa" }}>
          Loading course...
        </div>
      </div>
    );
  }

  if (course === null) {
    return (
      <div style={pageStyle}>
        <Navbar />
        <div style={{ ...wrapStyle, textAlign: "center" }}>
          <p>Course not found.</p>
          <Link to='/courses' style={{ color: "#00274c" }}>
            ← Back to all courses
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const mentorLabel = mentor
    ? formatMentorName(mentor.name)
    : course.teacherName && course.teacherName !== "Teacher"
      ? course.teacherName
      : "Mentor";

  const badge = STATUS_BADGE[course.status] || STATUS_BADGE.registration;

  return (
    <div style={pageStyle}>
      <Navbar />
      <div style={wrapStyle}>
        <Link
          to='/courses'
          style={{
            color: "#00274c",
            fontSize: 14,
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 20,
          }}
        >
          ← All Courses
        </Link>

        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: "40px 44px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <h1
              style={{
                fontSize: "1.9rem",
                lineHeight: 1.3,
                margin: 0,
                color: "#1a1a2e",
              }}
            >
              {course.title}
            </h1>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: badge.color,
                background: badge.bg,
                padding: "4px 12px",
                borderRadius: 20,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {badge.label}
            </span>
          </div>

          <p style={{ fontSize: 15, color: "#888", margin: "0 0 8px" }}>
            👩‍🏫 Mentored by:{" "}
            {mentor ? (
              <Link
                to={`/teacher/${mentor.id}`}
                style={{ color: "#00274c", textDecoration: "underline" }}
              >
                {mentorLabel}
              </Link>
            ) : (
              mentorLabel
            )}
            {" · "}💰 {course.price > 0 ? `$${course.price}` : "Free"}
          </p>

          {course.maxSeats ? (
            <div style={{ marginBottom: 24 }}>
              <SeatsRow kind='course' item={course} onRegister={openRegister} />
            </div>
          ) : null}

          <div style={{ marginBottom: 28 }}>
            <p style={sectionLabel}>Course Description</p>
            <p style={{ ...sectionBody, background: "#f9fafb" }}>
              {course.description}
            </p>
          </div>

          {course.lessons?.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <p style={sectionLabel}>Lessons</p>
              <div
                style={{
                  ...sectionBody,
                  background: "#f9fafb",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {course.lessons.map((l) => (
                  <span key={l.date} style={{ fontSize: 15 }}>
                    📅 {l.date} ({lessonWeekday(l.date)}) · {l.startTime}–
                    {l.endTime}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {registering && student && (
        <RegisterModal
          kind='course'
          item={course}
          student={student}
          onClose={() => setRegistering(false)}
          onRegistered={markRegistered}
        />
      )}
      <Footer />
    </div>
  );
}
