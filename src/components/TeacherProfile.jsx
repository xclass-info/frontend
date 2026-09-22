// src/components/TeacherProfile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  onSnapshot,
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { lessonWeekday, safeUrl } from "../utils/format";
import { SeatsRow, RegisterModal } from "./RegisterControls";
import { useStudentAuth } from "../utils/useStudentAuth";

const cardStyle = {
  background: "white",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  marginBottom: 24,
};
const sectionTitle = { margin: "0 0 16px", fontSize: 16, color: "#333" };
const itemStyle = {
  padding: 16,
  borderRadius: 10,
  background: "#f9fafb",
  border: "1px solid #eee",
};

const BADGES = {
  registration: {
    label: "Registration",
    color: "#92400e",
    bg: "rgba(217,119,6,0.08)",
    border: "rgba(217,119,6,0.3)",
  },
  active: {
    label: "Active",
    color: "#166534",
    bg: "rgba(22,101,52,0.08)",
    border: "rgba(22,101,52,0.3)",
  },
  completed: {
    label: "Completed",
    color: "#1e40af",
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.3)",
  },
};

function StatusBadge({ status }) {
  const b = BADGES[status] || BADGES.active;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 800,
        textTransform: "uppercase",
        padding: "3px 10px",
        borderRadius: 50,
        border: `2px solid ${b.border}`,
        color: b.color,
        background: b.bg,
        whiteSpace: "nowrap",
      }}
    >
      {b.label}
    </span>
  );
}

// Long descriptions are clamped with a Show more toggle so one course or
// project doesn't push everything else off the page.
function ExpandableText({ text, style }) {
  const [open, setOpen] = useState(false);
  const isLong = text.length > 280;
  return (
    <>
      <p
        style={{
          ...style,
          whiteSpace: "pre-wrap",
          ...(isLong && !open
            ? {
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : {}),
        }}
      >
        {text}
      </p>
      {isLong && (
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: "none",
            border: "none",
            color: "#00274c",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            padding: 0,
            marginTop: 4,
          }}
        >
          {open ? "Show less" : "Show more"}
        </button>
      )}
    </>
  );
}

// Research cards expand in place (like Show more on projects/courses)
// instead of navigating away.
function ResearchItem({ r, onRegister }) {
  const [open, setOpen] = useState(false);
  const labelStyle = {
    margin: "0 0 4px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };
  const bodyStyle = {
    margin: 0,
    fontSize: 13,
    color: "#555",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
  };
  return (
    <div style={itemStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 6,
        }}
      >
        <h4 style={{ margin: 0, fontSize: 15, color: "#333" }}>{r.title}</h4>
        <StatusBadge status={r.stage} />
      </div>
      <p
        style={{
          ...bodyStyle,
          color: "#666",
          ...(open
            ? {}
            : {
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }),
        }}
      >
        {r.idea}
      </p>
      <SeatsRow kind='research' item={r} onRegister={onRegister} />
      {open && (
        <>
          <div
            style={{
              marginTop: 10,
              padding: "10px 12px",
              borderRadius: 8,
              background: "#f0fdf4",
              borderLeft: "3px solid #27ae60",
            }}
          >
            <p style={{ ...labelStyle, color: "#16a34a" }}>Impact</p>
            <p style={bodyStyle}>{r.impact}</p>
          </div>
          {r.details && (
            <div
              style={{
                marginTop: 10,
                padding: "10px 12px",
                borderRadius: 8,
                background: "white",
                border: "1px solid #eee",
              }}
            >
              <p style={{ ...labelStyle, color: "#aaa" }}>Additional details</p>
              <p style={bodyStyle}>{r.details}</p>
            </div>
          )}
        </>
      )}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          color: "#00274c",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
          padding: 0,
          marginTop: 8,
        }}
      >
        {open ? "Show less" : "Show more"}
      </button>
    </div>
  );
}

const newestFirst = (a, b) =>
  (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);

export default function TeacherProfile() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { student } = useStudentAuth();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [research, setResearch] = useState([]);
  const [projects, setProjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [registering, setRegistering] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "teachers", teacherId), (snap) => {
      if (snap.exists()) setTeacher({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return () => unsub();
  }, [teacherId]);

  useEffect(() => {
    async function fetchSlots() {
      const snap = await getDocs(
        collection(db, "teachers", teacherId, "availability"),
      );
      const available = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((s) => !s.booked)
        .sort(
          (a, b) =>
            new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`),
        );
      setSlots(available);
    }
    fetchSlots();
  }, [teacherId]);

  // Same content the mentor sees in their dashboard, read-only. Bookings are
  // intentionally not loaded - they contain students' names and emails.
  useEffect(() => {
    async function loadPortfolio() {
      const byTeacher = (name) =>
        getDocs(query(collection(db, name), where("teacherId", "==", teacherId)));
      const toList = (snap) =>
        snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(newestFirst);
      try {
        const [r, p, c] = await Promise.all([
          byTeacher("research"),
          byTeacher("projects"),
          byTeacher("classes"),
        ]);
        setResearch(toList(r).filter((x) => x.status === "published"));
        setProjects(toList(p));
        setCourses(toList(c));
      } catch (err) {
        console.error(err);
      }
    }
    loadPortfolio();
  }, [teacherId]);

  function openRegister(kind, item) {
    // Registering requires a logged-in student account, so it can be tied
    // to the student's record and reliably show up on their dashboard.
    if (!student) {
      navigate("/student/login", { state: { from: location.pathname } });
      return;
    }
    setRegistering({ kind, item });
  }

  // Keep the on-screen seat counts in step after someone registers.
  function markRegistered(kind, id) {
    const bump = (list) =>
      list.map((x) =>
        x.id === id ? { ...x, enrolledCount: (x.enrolledCount || 0) + 1 } : x,
      );
    if (kind === "research") setResearch(bump);
    else if (kind === "project") setProjects(bump);
    else setCourses(bump);
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Required";
    if (!form.email.trim()) newErrors.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email";
    return newErrors;
  }

  async function handleBook() {
    if (!selectedSlot) return alert("Please select a time slot");
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "bookings"), {
        teacherId: teacher.id,
        teacherName: teacher.name,
        slotId: selectedSlot.id,
        studentName: form.name,
        studentEmail: form.email,
        date: selectedSlot.date,
        time: selectedSlot.time,
        duration: selectedSlot.duration,
        status: "pending",
        createdAt: new Date(),
      });
      setBooked(true);
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
          style={{ padding: "120px 32px", textAlign: "center", color: "#aaa" }}
        >
          Loading teacher profile...
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
        <Navbar />
        <div style={{ padding: "120px 32px", textAlign: "center" }}>
          <p>Teacher not found.</p>
          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: 16,
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: "#00274c",
              color: "white",
              cursor: "pointer",
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Navbar />

      <div
        style={{ maxWidth: 800, margin: "0 auto", padding: "100px 24px 48px" }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            color: "#00274c",
            cursor: "pointer",
            fontSize: 14,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← Back
        </button>

        {/* Hero section */}

        {/* Hero section */}
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: 32,
            marginBottom: 24,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            display: "flex",
            gap: 32,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Left — Avatar */}
          <div style={{ flex: "0 0 30%" }}>
            {teacher.photoURL ? (
              <img
                src={teacher.photoURL}
                alt={teacher.name}
                style={{ width: "100%", borderRadius: 16, objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  color: "white",
                  fontSize: 80,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {teacher.name
                  ?.split(" ")
                  .slice(-1)[0]
                  ?.charAt(0)
                  .toUpperCase() || "T"}
              </div>
            )}
          </div>
          {/* Right — Info */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <h1 style={{ margin: "0 0 16px", fontSize: 32 }}>
              {teacher.name?.startsWith("Prof.")
                ? teacher.name?.split(" ").slice(0, 2).join(" ")
                : teacher.name?.startsWith("Dr.")
                  ? `Dr. ${teacher.name?.split(" ").pop()}`
                  : `Dr. ${teacher.name?.split(" ").pop()}`}
            </h1>

            {/* Badges */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              {teacher.gender && (
                <span
                  style={{
                    fontSize: 12,
                    background: "#f0f4ff",
                    color: "#00274c",
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontWeight: 600,
                  }}
                >
                  {teacher.gender === "Male" ? "👨" : "👩"} {teacher.gender}
                </span>
              )}
              {teacher.degree && (
                <span
                  style={{
                    fontSize: 12,
                    background: "#f0fdf4",
                    color: "#16a34a",
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontWeight: 600,
                  }}
                >
                  🎓 {teacher.degree}
                </span>
              )}
              {teacher.major && (
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
                  🔬 {teacher.major}
                </span>
              )}
              {teacher.yearsOfExperience && (
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
                  📆 {teacher.yearsOfExperience} years exp.
                </span>
              )}
            </div>

            {teacher.expertise && (
              <p
                style={{
                  margin: "0 0 24px",
                  fontSize: 15,
                  color: "#555",
                  fontWeight: 600,
                }}
              >
                💡 {teacher.expertise}
              </p>
            )}

            {/* Book button at bottom */}
            <button
              onClick={() => setShowBooking(true)}
              style={{
                padding: "14px 40px",
                borderRadius: 12,
                border: "none",
                background: "#00274c",
                color: "white",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              📅 Book a Session
            </button>
          </div>
        </div>

        {/* Info cards grid */}
        {/* <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        > */}
        {/* Info cards grid */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* Academic Info */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#333" }}>
              🎓 Academic Background
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {teacher.university && (
                <div>
                  <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 2px" }}>
                    University / Institution
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#333",
                      margin: 0,
                      fontWeight: 600,
                    }}
                  >
                    {teacher.university}
                  </p>
                </div>
              )}
              {teacher.researchArea && (
                <div>
                  <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 2px" }}>
                    Research Area
                  </p>
                  <p style={{ fontSize: 14, color: "#333", margin: 0 }}>
                    {teacher.researchArea}
                  </p>
                </div>
              )}
              {teacher.languages && (
                <div>
                  <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 2px" }}>
                    Languages Spoken
                  </p>
                  <p style={{ fontSize: 14, color: "#333", margin: 0 }}>
                    {teacher.languages}
                  </p>
                </div>
              )}
              {teacher.website && (
                <div>
                  <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 2px" }}>
                    Website / LinkedIn
                  </p>
                  {safeUrl(teacher.website) ? (
                    <a
                      href={safeUrl(teacher.website)}
                      target='_blank'
                      rel='noreferrer'
                      style={{ fontSize: 14, color: "#00274c" }}
                    >
                      {teacher.website}
                    </a>
                  ) : (
                    <p style={{ fontSize: 14, color: "#333", margin: 0 }}>
                      {teacher.website}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* About */}
          {teacher.bio && (
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
              }}
            >
              <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#333" }}>
                👤 About Me
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "#555",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {teacher.bio}
              </p>
            </div>
          )}
        </div>

        {/* Research */}
        {research.length > 0 && (
          <div style={cardStyle}>
            <h3 style={sectionTitle}>🔬 Research</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {research.map((r) => (
                <ResearchItem key={r.id} r={r} onRegister={openRegister} />
              ))}
            </div>
          </div>
        )}

        {/* Projects (new collection first, then the older per-profile list) */}
        {[...projects, ...(teacher.projects || [])].length > 0 && (
          <div style={cardStyle}>
            <h3 style={sectionTitle}>💡 Projects</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[...projects, ...(teacher.projects || [])].map((project) => (
                <div key={project.id} style={itemStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      marginBottom: 6,
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: 15, color: "#333" }}>
                      {project.title}
                    </h4>
                    {project.stage && <StatusBadge status={project.stage} />}
                  </div>
                  {project.description && (
                    <ExpandableText
                      text={project.description}
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "#666",
                        lineHeight: 1.6,
                      }}
                    />
                  )}
                  <SeatsRow
                    kind='project'
                    item={project}
                    onRegister={openRegister}
                  />
                  {project.learning && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: "#f0fdf4",
                        borderLeft: "3px solid #27ae60",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#16a34a",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        What students will learn
                      </p>
                      <ExpandableText
                        text={project.learning}
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: "#555",
                          lineHeight: 1.6,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses */}
        {courses.length > 0 && (
          <div style={cardStyle}>
            <h3 style={sectionTitle}>📚 Courses</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {courses.map((c) => (
                <div key={c.id} style={itemStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      marginBottom: 6,
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: 15, color: "#333" }}>
                      {c.title}
                    </h4>
                    <StatusBadge status={c.status || "registration"} />
                  </div>
                  {c.description && (
                    <ExpandableText
                      text={c.description}
                      style={{
                        margin: "0 0 10px",
                        fontSize: 13,
                        color: "#666",
                        lineHeight: 1.6,
                      }}
                    />
                  )}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      fontSize: 13,
                      color: "#555",
                      fontWeight: 600,
                    }}
                  >
                    {c.lessons?.length > 0 ? (
                      c.lessons.map((l) => (
                        <span key={l.date}>
                          📅 {l.date} ({lessonWeekday(l.date)}) · {l.startTime}–
                          {l.endTime}
                        </span>
                      ))
                    ) : (
                      <span>
                        📅 {c.date || c.dates?.join(", ")}
                        {c.startTime && ` · ${c.startTime}–${c.endTime}`}
                      </span>
                    )}
                    <SeatsRow
                      kind='course'
                      item={c}
                      onRegister={openRegister}
                      extra={` · 💰 ${c.price > 0 ? `$${c.price}` : "Free"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Slots */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          }}
        >
          <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#333" }}>
            🗓 Available Slots
          </h3>
          {slots.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: 14 }}>
              No available slots at the moment.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 10,
              }}
            >
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => {
                    setSelectedSlot(slot);
                    setShowBooking(true);
                  }}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: `2px solid ${selectedSlot?.id === slot.id ? "#00274c" : "#eee"}`,
                    background:
                      selectedSlot?.id === slot.id ? "#eff6ff" : "white",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  <p style={{ margin: "0 0 4px", fontWeight: 600 }}>
                    📅 {slot.date}
                  </p>
                  <p style={{ margin: "0 0 4px", color: "#555" }}>
                    ⏰ {slot.time}
                  </p>
                  <p style={{ margin: 0, color: "#888", fontSize: 12 }}>
                    ⏱ {slot.duration} min{" "}
                    {slot.price > 0 ? `· $${slot.price}` : "· Free"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Booking Modal ── */}
      {showBooking && (
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
              maxWidth: 440,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {booked ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <p style={{ fontSize: 48 }}>✅</p>
                <h3>Booking Request Sent!</h3>
                <p style={{ color: "#888", marginBottom: 20 }}>
                  {teacher.name} will confirm your session soon.
                </p>
                <button
                  onClick={() => {
                    setShowBooking(false);
                    setBooked(false);
                  }}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 8,
                    border: "none",
                    background: "#00274c",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <h3 style={{ margin: 0 }}>Book with {teacher.name}</h3>
                  <button
                    onClick={() => setShowBooking(false)}
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

                <h4 style={{ marginBottom: 8 }}>Select a Slot</h4>
                {slots.length === 0 ? (
                  <p style={{ color: "#888", fontSize: 14, marginBottom: 16 }}>
                    No available slots.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      marginBottom: 20,
                    }}
                  >
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          padding: "10px 16px",
                          borderRadius: 8,
                          border: `2px solid ${selectedSlot?.id === slot.id ? "#00274c" : "#eee"}`,
                          background:
                            selectedSlot?.id === slot.id ? "#eff6ff" : "white",
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        📅 {slot.date} &nbsp; ⏰ {slot.time} &nbsp; (
                        {slot.duration} min){" "}
                        {slot.price > 0 ? `· $${slot.price}` : "· Free"}
                      </div>
                    ))}
                  </div>
                )}

                <h4 style={{ marginBottom: 8 }}>Your Details</h4>
                <input
                  placeholder='Your full name'
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    setErrors({ ...errors, name: "" });
                  }}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: `1px solid ${errors.name ? "red" : "#ddd"}`,
                    marginBottom: 8,
                    boxSizing: "border-box",
                  }}
                />
                {errors.name && (
                  <p style={{ color: "red", fontSize: 12, marginBottom: 8 }}>
                    {errors.name}
                  </p>
                )}

                <input
                  placeholder='Your email'
                  type='email'
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    setErrors({ ...errors, email: "" });
                  }}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: `1px solid ${errors.email ? "red" : "#ddd"}`,
                    marginBottom: 16,
                    boxSizing: "border-box",
                  }}
                />
                {errors.email && (
                  <p style={{ color: "red", fontSize: 12, marginBottom: 8 }}>
                    {errors.email}
                  </p>
                )}

                <button
                  onClick={handleBook}
                  disabled={submitting || slots.length === 0}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: "none",
                    background: "#00274c",
                    color: "white",
                    fontSize: 16,
                    cursor: "pointer",
                    opacity: slots.length === 0 ? 0.5 : 1,
                  }}
                >
                  {submitting ? "Sending Request..." : "Request Booking →"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {registering && student && (
        <RegisterModal
          kind={registering.kind}
          item={registering.item}
          student={student}
          onClose={() => setRegistering(null)}
          onRegistered={markRegistered}
        />
      )}
      <Footer />
    </div>
  );
}
