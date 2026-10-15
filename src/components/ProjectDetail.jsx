// src/components/ProjectDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { formatMentorName } from "../utils/mentorName";
import { LESSON_STRUCTURE_LABEL } from "../utils/format";
import { SeatsRow, RegisterModal, LoginPrompt } from "./RegisterControls";
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

export default function ProjectDetail() {
  const { projectId } = useParams();
  const location = useLocation();
  const { student } = useStudentAuth();
  const [project, setProject] = useState(undefined); // undefined = loading
  const [mentor, setMentor] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  function markRegistered() {
    setProject((p) => ({ ...p, enrolledCount: (p.enrolledCount || 0) + 1 }));
  }

  function openRegister() {
    if (!student) {
      setShowLoginPrompt(true);
      return;
    }
    setRegistering(true);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const snap = await getDoc(doc(db, "projects", projectId));
        const data = snap.exists() ? { id: snap.id, ...snap.data() } : null;
        if (!data) {
          if (!cancelled) setProject(null);
          return;
        }
        if (!cancelled) setProject(data);
        const teacherSnap = await getDoc(doc(db, "teachers", data.teacherId));
        if (!cancelled && teacherSnap.exists() && teacherSnap.data().name) {
          setMentor({ id: teacherSnap.id, ...teacherSnap.data() });
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setProject(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const pageStyle = { minHeight: "100vh", background: "#f9fafb" };
  const wrapStyle = {
    maxWidth: 820,
    margin: "0 auto",
    padding: "100px 24px 48px",
  };

  if (project === undefined) {
    return (
      <div style={pageStyle}>
        <Navbar />
        <div style={{ ...wrapStyle, textAlign: "center", color: "#aaa" }}>
          Loading project...
        </div>
      </div>
    );
  }

  if (project === null) {
    return (
      <div style={pageStyle}>
        <Navbar />
        <div style={{ ...wrapStyle, textAlign: "center" }}>
          <p>Project not found.</p>
          <Link to='/projects' style={{ color: "#2f6175" }}>
            ← Back to all projects
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const mentorLabel = mentor
    ? formatMentorName(mentor.name, {
        mentorType: mentor.mentorType,
        degree: mentor.degree,
      })
    : project.teacherName && project.teacherName !== "Teacher"
      ? project.teacherName
      : "Mentor";

  return (
    <div style={pageStyle}>
      <Navbar />
      <div style={wrapStyle}>
        <Link
          to='/projects'
          style={{
            color: "#2f6175",
            fontSize: 14,
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 20,
          }}
        >
          ← All Projects
        </Link>

        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: "40px 44px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          }}
        >
          <h1
            style={{
              fontSize: "1.9rem",
              lineHeight: 1.3,
              margin: "0 0 12px",
              color: "#1a1a2e",
            }}
          >
            {project.title}
          </h1>

          {project.gradeLevel && (
            <span
              style={{
                display: "inline-block",
                fontSize: 12,
                fontWeight: 700,
                color: "#2f6175",
                background: "#fff8dc",
                border: "1px solid #9a772b",
                padding: "3px 12px",
                borderRadius: 20,
                marginBottom: 12,
              }}
            >
              🎓 {project.gradeLevel}
            </span>
          )}

          <p style={{ fontSize: 14, color: "var(--muted)", fontWeight: 600, margin: "0 0 8px" }}>
            🕐 {LESSON_STRUCTURE_LABEL}
          </p>

          <p style={{ fontSize: 15, color: "#888", margin: "0 0 8px" }}>
            👩‍🏫 Mentored by:{" "}
            {mentor ? (
              <Link
                to={`/teacher/${mentor.id}`}
                style={{ color: "#2f6175", textDecoration: "underline" }}
              >
                {mentorLabel}
              </Link>
            ) : (
              mentorLabel
            )}
          </p>

          {project.deliverable && (
            <p
              style={{
                fontSize: 14,
                color: "#14532d",
                fontWeight: 600,
                margin: "0 0 16px",
              }}
            >
              📦 You'll produce: {project.deliverable}
            </p>
          )}

          {project.prerequisites && (
            <p
              style={{
                fontSize: 14,
                color: "#888",
                margin: "0 0 16px",
              }}
            >
              ✅ Prerequisites: {project.prerequisites}
            </p>
          )}

          {project.seats ? (
            <div style={{ marginBottom: 24 }}>
              <SeatsRow
                kind='project'
                item={project}
                onRegister={openRegister}
              />
              {showLoginPrompt && <LoginPrompt from={location.pathname} />}
            </div>
          ) : null}

          <div style={{ marginBottom: 28 }}>
            <p style={sectionLabel}>Project Description</p>
            <p style={{ ...sectionBody, background: "#f9fafb" }}>
              {project.description}
            </p>
          </div>

          <div style={{ marginBottom: 8 }}>
            <p style={sectionLabel}>What Students Will Learn</p>
            <p
              style={{
                ...sectionBody,
                background: "#f0fdf4",
                borderLeft: "3px solid #1f6f4a",
              }}
            >
              {project.learning}
            </p>
          </div>
        </div>
      </div>
      {registering && student && (
        <RegisterModal
          kind='project'
          item={project}
          student={student}
          onClose={() => setRegistering(false)}
          onRegistered={markRegistered}
        />
      )}
      <Footer />
    </div>
  );
}
