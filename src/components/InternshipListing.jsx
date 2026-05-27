// src/components/InternshipListing.jsx
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import Navbar from "./Navbar";
import { SkeletonClassCard } from "./Skeleton";
import Footer from "./Footer";

export default function InternshipListing() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", statement: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [filterMode, setFilterMode] = useState("all");

  useEffect(() => {
    const q = query(
      collection(db, "internships"),
      where("status", "==", "open"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setInternships(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered =
    filterMode === "all"
      ? internships
      : internships.filter((i) => i.mode === filterMode);

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Required";
    if (!form.email.trim()) newErrors.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email";
    if (!form.statement.trim()) newErrors.statement = "Required";
    return newErrors;
  }

  async function handleApply() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "internship_applications"), {
        internshipId: selected.id,
        internshipTitle: selected.title,
        teacherId: selected.teacherId,
        teacherName: selected.teacherName,
        studentName: form.name,
        studentEmail: form.email,
        statement: form.statement,
        status: "pending",
        createdAt: new Date(),
      });
      await updateDoc(doc(db, "internships", selected.id), {
        applicants: (selected.applicants || 0) + 1,
      });
      setApplied(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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
            🧪 Internships
          </h1>
          <p style={{ color: "#666", fontSize: "1rem" }}>
            Explore research internship opportunities from our mentors.
          </p>
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginBottom: 32,
            flexWrap: "wrap",
          }}
        >
          {["all", "Remote", "In-Person", "Hybrid"].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              style={{
                padding: "8px 20px",
                borderRadius: 20,
                border: "none",
                background: filterMode === mode ? "#4a90e2" : "#e0e0e0",
                color: filterMode === mode ? "white" : "#555",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {mode === "all"
                ? "🧪 All"
                : mode === "Remote"
                  ? "🌐 Remote"
                  : mode === "In-Person"
                    ? "🏫 In-Person"
                    : "🔄 Hybrid"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "#aaa", padding: 40 }}>
            <p>😴 No internships available right now. Check back soon!</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {filtered.map((intern) => (
              <div
                key={intern.id}
                onClick={() => {
                  setSelected(intern);
                  setApplying(false);
                  setApplied(false);
                  setForm({ name: "", email: "", statement: "" });
                }}
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
                    marginBottom: 6,
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
                    WebkitLineClamp: 3,
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
                    alignItems: "center",
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: 12,
                  }}
                >
                  <div>
                    <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
                      👩‍🏫 {intern.teacherName}
                    </p>
                    <p style={{ fontSize: 12, color: "#e74c3c", margin: 0 }}>
                      📅 Deadline: {intern.deadline}
                    </p>
                  </div>
                  <span
                    style={{ fontSize: 12, color: "#4a90e2", fontWeight: 600 }}
                  >
                    {intern.spots} spots left
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail + Apply Modal ── */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 32,
              width: "100%",
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3 style={{ margin: 0 }}>🧪 Internship Details</h3>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {applied ? (
              <div style={{ textAlign: "center", padding: 32 }}>
                <p style={{ fontSize: 48, marginBottom: 12 }}>✅</p>
                <h3>Application Submitted!</h3>
                <p style={{ color: "#888", marginBottom: 20 }}>
                  {selected.teacherName} will review your application and get
                  back to you.
                </p>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 8,
                    border: "none",
                    background: "#4a90e2",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>
            ) : applying ? (
              <>
                <h2 style={{ fontSize: 18, marginBottom: 4 }}>
                  Apply: {selected.title}
                </h2>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
                  with {selected.teacherName}
                </p>

                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{ fontSize: 13, color: "#555", fontWeight: 600 }}
                  >
                    Full Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      setErrors({ ...errors, name: "" });
                    }}
                    placeholder='Your full name'
                    style={{
                      display: "block",
                      width: "100%",
                      padding: 10,
                      borderRadius: 8,
                      border: `1px solid ${errors.name ? "red" : "#ddd"}`,
                      marginTop: 4,
                      boxSizing: "border-box",
                    }}
                  />
                  {errors.name && (
                    <p style={{ color: "red", fontSize: 12 }}>{errors.name}</p>
                  )}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{ fontSize: 13, color: "#555", fontWeight: 600 }}
                  >
                    Email *
                  </label>
                  <input
                    type='email'
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      setErrors({ ...errors, email: "" });
                    }}
                    placeholder='your@email.com'
                    style={{
                      display: "block",
                      width: "100%",
                      padding: 10,
                      borderRadius: 8,
                      border: `1px solid ${errors.email ? "red" : "#ddd"}`,
                      marginTop: 4,
                      boxSizing: "border-box",
                    }}
                  />
                  {errors.email && (
                    <p style={{ color: "red", fontSize: 12 }}>{errors.email}</p>
                  )}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{ fontSize: 13, color: "#555", fontWeight: 600 }}
                  >
                    Why are you interested? *
                  </label>
                  <textarea
                    value={form.statement}
                    onChange={(e) => {
                      setForm({ ...form, statement: e.target.value });
                      setErrors({ ...errors, statement: "" });
                    }}
                    placeholder="Tell us why you're interested in this internship and what you hope to learn..."
                    rows={4}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: 10,
                      borderRadius: 8,
                      border: `1px solid ${errors.statement ? "red" : "#ddd"}`,
                      marginTop: 4,
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                  {errors.statement && (
                    <p style={{ color: "red", fontSize: 12 }}>
                      {errors.statement}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleApply}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 8,
                      border: "none",
                      background: "#4a90e2",
                      color: "white",
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {submitting ? "Submitting..." : "Submit Application →"}
                  </button>
                  <button
                    onClick={() => setApplying(false)}
                    style={{
                      padding: "12px 20px",
                      borderRadius: 8,
                      border: "none",
                      background: "#f1f1f1",
                      cursor: "pointer",
                    }}
                  >
                    Back
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Badges */}
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    marginBottom: 16,
                  }}
                >
                  {/* <span
                    style={{
                      fontSize: 12,
                      background: "#f0fdf4",
                      color: "#16a34a",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontWeight: 600,
                    }}
                  >
                    {selected.mode === "Remote"
                      ? "🌐"
                      : selected.mode === "In-Person"
                        ? "🏫"
                        : "🔄"}{" "}
                    {selected.mode}
                  </span> */}
                  {/* <span
                    style={{
                      fontSize: 12,
                      background: "#eff6ff",
                      color: "#4a90e2",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontWeight: 600,
                    }}
                  >
                    ⏱ {selected.duration}
                  </span> */}
                  {/* <span
                    style={{
                      fontSize: 12,
                      background:
                        selected.stipend === "Paid" ? "#fef9c3" : "#f9fafb",
                      color: selected.stipend === "Paid" ? "#854d0e" : "#888",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontWeight: 600,
                    }}
                  >
                    💰 {selected.stipend}
                  </span> */}
                  <span
                    style={{
                      fontSize: 12,
                      background: "#fdf4ff",
                      color: "#9333ea",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontWeight: 600,
                    }}
                  >
                    👥 {selected.spots} spots
                  </span>
                </div>

                <h2 style={{ fontSize: 20, marginBottom: 4 }}>
                  {selected.title}
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "#4a90e2",
                    fontWeight: 600,
                    marginBottom: 20,
                  }}
                >
                  🔬 {selected.field}
                </p>

                <div style={{ marginBottom: 16 }}>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#aaa",
                      margin: "0 0 6px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Project Description
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#555",
                      lineHeight: 1.7,
                      margin: 0,
                      background: "#f9fafb",
                      padding: 14,
                      borderRadius: 8,
                    }}
                  >
                    {selected.description}
                  </p>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#aaa",
                      margin: "0 0 6px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Requirements
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#555",
                      lineHeight: 1.7,
                      margin: 0,
                      background: "#f9fafb",
                      padding: 14,
                      borderRadius: 8,
                    }}
                  >
                    {selected.requirements}
                  </p>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#aaa",
                      margin: "0 0 6px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Learning Outcomes
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#555",
                      lineHeight: 1.7,
                      margin: 0,
                      background: "#f0fdf4",
                      padding: 14,
                      borderRadius: 8,
                      borderLeft: "3px solid #27ae60",
                    }}
                  >
                    {selected.outcomes}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#f9fafb",
                    padding: 14,
                    borderRadius: 8,
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <p
                      style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}
                    >
                      Posted by
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
                      👩‍🏫 {selected.teacherName}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}
                    >
                      Application Deadline
                    </p>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#e74c3c",
                        margin: 0,
                      }}
                    >
                      📅 {selected.deadline}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setApplying(true)}
                  style={{
                    width: "100%",
                    padding: 14,
                    borderRadius: 10,
                    border: "none",
                    background: "#4a90e2",
                    color: "white",
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Apply Now →
                </button>
              </>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
