// src/components/ResearchDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { formatMentorName } from "../utils/mentorName";

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

export default function ResearchDetail() {
  const { researchId } = useParams();
  const [research, setResearch] = useState(undefined); // undefined = loading
  const [mentor, setMentor] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const snap = await getDoc(doc(db, "research", researchId));
        const data = snap.exists() ? { id: snap.id, ...snap.data() } : null;
        // Only published research is public, same as the listing page.
        if (!data || data.status !== "published") {
          if (!cancelled) setResearch(null);
          return;
        }
        if (!cancelled) setResearch(data);
        const teacherSnap = await getDoc(doc(db, "teachers", data.teacherId));
        if (!cancelled && teacherSnap.exists() && teacherSnap.data().name) {
          setMentor({ id: teacherSnap.id, name: teacherSnap.data().name });
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setResearch(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [researchId]);

  const pageStyle = { minHeight: "100vh", background: "#f9fafb" };
  const wrapStyle = {
    maxWidth: 820,
    margin: "0 auto",
    padding: "100px 24px 48px",
  };

  if (research === undefined) {
    return (
      <div style={pageStyle}>
        <Navbar />
        <div style={{ ...wrapStyle, textAlign: "center", color: "#aaa" }}>
          Loading research...
        </div>
      </div>
    );
  }

  if (research === null) {
    return (
      <div style={pageStyle}>
        <Navbar />
        <div style={{ ...wrapStyle, textAlign: "center" }}>
          <p>Research not found.</p>
          <Link to='/research' style={{ color: "#00274c" }}>
            ← Back to all research
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const mentorLabel = mentor
    ? formatMentorName(mentor.name)
    : research.teacherName && research.teacherName !== "Teacher"
      ? research.teacherName
      : "Mentor";

  return (
    <div style={pageStyle}>
      <Navbar />
      <div style={wrapStyle}>
        <Link
          to='/research'
          style={{
            color: "#00274c",
            fontSize: 14,
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 20,
          }}
        >
          ← All Research
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
            {research.title}
          </h1>

          <p style={{ fontSize: 15, color: "#888", margin: "0 0 32px" }}>
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
          </p>

          <div style={{ marginBottom: 28 }}>
            <p style={sectionLabel}>Research Idea</p>
            <p style={{ ...sectionBody, background: "#f9fafb" }}>
              {research.idea}
            </p>
          </div>

          <div style={{ marginBottom: 28 }}>
            <p style={sectionLabel}>Research Impact</p>
            <p
              style={{
                ...sectionBody,
                background: "#f0fdf4",
                borderLeft: "3px solid #27ae60",
              }}
            >
              {research.impact}
            </p>
          </div>

          {research.details && (
            <div style={{ marginBottom: 8 }}>
              <p style={sectionLabel}>Additional Details</p>
              <p style={{ ...sectionBody, background: "#f9fafb" }}>
                {research.details}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
