// src/components/StudentDashboard.jsx
// A logged-in student's dashboard: profile, plus the courses, projects and
// research they've registered for. Laid out like the mentor dashboard.
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import styles from "./TeacherDashboard.module.css";
import Footer from "./Footer";
import { formatMentorName } from "../utils/mentorName";
import { lessonWeekday } from "../utils/format";
import { loadStudentRegistrations } from "../utils/studentData";

const TABS = [
  { id: "profile", label: "👤 Profile" },
  { id: "course", label: "📚 Courses" },
  { id: "project", label: "💡 Projects" },
  { id: "research", label: "🔬 Research" },
];

const EMPTY = {
  course: {
    text: "📚 You haven't registered for any courses yet.",
    to: "/tutors",
    cta: "Meet our mentors",
  },
  project: {
    text: "💡 You haven't registered for any projects yet.",
    to: "/tutors",
    cta: "Meet our mentors",
  },
  research: {
    text: "🔬 You haven't registered for any research yet.",
    to: "/research",
    cta: "Browse research",
  },
};

const clamp = (lines) => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

function badgeFor(kind, item) {
  if (kind === "course") {
    if (item.status === "completed") return [styles.completed, "Completed"];
    if (item.status === "active") return [styles.active, "Active"];
    return [styles.registration, "Registration"];
  }
  return item.stage === "completed"
    ? [styles.draft, "Completed"]
    : [styles.active, "Active"];
}

function RegistrationCard({ row }) {
  const { reg, item, mentorName } = row;
  const description = item ? item.idea || item.description : null;
  const [badgeClass, badgeLabel] = item ? badgeFor(reg.kind, item) : [];

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <h3 className={styles.cardTitle}>{reg.itemTitle}</h3>
        {item && (
          <span className={`${styles.badge} ${badgeClass}`}>{badgeLabel}</span>
        )}
      </div>

      {item ? (
        description && (
          <p className={styles.cardDesc} style={clamp(4)}>
            {description}
          </p>
        )
      ) : (
        <p className={styles.cardDesc}>This is no longer available.</p>
      )}

      <div className={styles.cardMeta}>
        {reg.kind === "course" && item?.lessons?.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {item.lessons.map((l) => (
              <span key={l.date}>
                📅 {l.date} ({lessonWeekday(l.date)}) · {l.startTime}–
                {l.endTime}
              </span>
            ))}
          </div>
        )}
        <span>
          ✅ Registered{" "}
          {reg.createdAt?.toDate ? reg.createdAt.toDate().toLocaleDateString() : ""}
        </span>
        {mentorName && reg.teacherId && (
          <span>
            👩‍🏫 Mentored by:{" "}
            <Link
              to={`/teacher/${reg.teacherId}`}
              style={{ color: "#00274c", textDecoration: "underline" }}
            >
              {formatMentorName(mentorName)}
            </Link>
          </span>
        )}
      </div>

      {reg.kind === "research" && item && (
        <div className={styles.cardFooter}>
          <Link to={`/research/${reg.itemId}`} className={styles.joinBtn}>
            Read more →
          </Link>
        </div>
      )}
    </div>
  );
}

const labelStyle = { fontSize: 13, color: "#888", fontWeight: 600 };
const valueStyle = { margin: "4px 0 0", fontSize: 15 };

export function StudentDashboardView({
  student,
  email,
  rows,
  onSaveName,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(student.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const rowsFor = (kind) => rows.filter((r) => r.reg.kind === kind);

  async function save() {
    if (!nameDraft.trim()) {
      setError("Please enter your full name");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSaveName(nameDraft.trim());
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.logo}>💻 HappyResearch</h1>
            <p className={styles.welcome}>
              Welcome back, <strong>{student.name}</strong> 👋
            </p>
          </div>
          <div className={styles.headerRight}>
            <Link to='/' className={styles.createBtn}>
              Home
            </Link>
            <button className={styles.logoutBtn} onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            borderBottom: "2px solid #f0f0f0",
            paddingBottom: 0,
            flexWrap: "wrap",
          }}
        >
          {TABS.map((tab) => {
            const count = tab.id === "profile" ? 0 : rowsFor(tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: 19,
                  fontWeight: 600,
                  color: activeTab === tab.id ? "#00274c" : "#888",
                  borderBottom:
                    activeTab === tab.id
                      ? "2px solid #00274c"
                      : "2px solid transparent",
                  marginBottom: -2,
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
                {count > 0 ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>

        {activeTab === "profile" && (
          <div className={styles.section}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 className={styles.sectionTitle}>👤 My Profile</h2>
                <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
                  Your student account details.
                </p>
              </div>
              {!editing && (
                <button
                  onClick={() => {
                    setNameDraft(student.name);
                    setEditing(true);
                  }}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "#00274c",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  ✏️ Edit
                </button>
              )}
            </div>

            <div style={{ maxWidth: 600 }}>
              <div style={{ marginBottom: 20 }}>
                <p style={labelStyle}>Full name</p>
                {editing ? (
                  <input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                      fontSize: 16,
                      boxSizing: "border-box",
                      marginTop: 4,
                      fontFamily: "inherit",
                    }}
                  />
                ) : (
                  <p style={valueStyle}>{student.name}</p>
                )}
              </div>
              <div style={{ marginBottom: 20 }}>
                <p style={labelStyle}>Email</p>
                <p style={valueStyle}>
                  {email}{" "}
                  <span style={{ color: "#16a34a", fontSize: 13 }}>
                    ✓ verified
                  </span>
                </p>
              </div>
              {student.createdAt?.toDate && (
                <div style={{ marginBottom: 20 }}>
                  <p style={labelStyle}>Member since</p>
                  <p style={valueStyle}>
                    {student.createdAt.toDate().toLocaleDateString()}
                  </p>
                </div>
              )}

              {editing && (
                <>
                  {error && (
                    <p style={{ color: "#e74c3c", fontSize: 13 }}>{error}</p>
                  )}
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={save}
                      disabled={saving}
                      style={{
                        padding: "12px 32px",
                        borderRadius: 8,
                        border: "none",
                        background: "#00274c",
                        color: "white",
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: "pointer",
                        opacity: saving ? 0.6 : 1,
                      }}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setError("");
                      }}
                      disabled={saving}
                      style={{
                        padding: "12px 28px",
                        borderRadius: 50,
                        border: "2.5px solid #cbd5e1",
                        background: "transparent",
                        color: "#475569",
                        fontSize: 15,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab !== "profile" && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {activeTab === "course" && "Your Courses"}
              {activeTab === "project" && "Your Projects"}
              {activeTab === "research" && "Your Research"}
            </h2>
            {rowsFor(activeTab).length === 0 ? (
              <div className={styles.empty}>
                <p>{EMPTY[activeTab].text}</p>
                <Link to={EMPTY[activeTab].to} className={styles.createBtn}>
                  {EMPTY[activeTab].cta}
                </Link>
              </div>
            ) : (
              <div className={styles.grid}>
                {rowsFor(activeTab).map((row) => (
                  <RegistrationCard key={row.reg.id} row={row} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null); // { uid, student, email, rows }

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      // Only verified student accounts belong here.
      if (!user || !user.emailVerified) {
        navigate("/student/login");
        return;
      }
      try {
        const snap = await getDoc(doc(db, "students", user.uid));
        if (!snap.exists()) {
          navigate("/student/login");
          return;
        }
        const rows = await loadStudentRegistrations(user.email);
        setData({ uid: user.uid, student: snap.data(), email: user.email, rows });
      } catch (err) {
        console.error(err);
        navigate("/student/login");
      }
    });
    return () => unsub();
  }, [navigate]);

  async function saveName(name) {
    await updateDoc(doc(db, "students", data.uid), { name });
    setData({ ...data, student: { ...data.student, name } });
  }

  async function logout() {
    await signOut(auth);
    navigate("/");
  }

  if (!data) {
    return (
      <div className={styles.page}>
        <p style={{ color: "#aaa", padding: 40 }}>Loading...</p>
      </div>
    );
  }

  return (
    <StudentDashboardView
      student={data.student}
      email={data.email}
      rows={data.rows}
      onSaveName={saveName}
      onLogout={logout}
    />
  );
}
