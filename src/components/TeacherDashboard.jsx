import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import styles from "./TeacherDashboard.module.css";

import Availability from "./Availability";
import BookingRequests from "./BookingRequests";
import { SkeletonDashboardCard } from "./Skeleton";
import ResearchForm from "./ResearchForm";
import ProjectForm from "./ProjectForm";
import ShowcaseForm from "./ShowcaseForm";

import Footer from "./Footer";
import { lessonWeekday, safeUrl } from "../utils/format";
import RegistrationList from "./RegistrationList";

function profileFromTeacherData(data) {
  return {
    gender: data.gender || "",
    degree: data.degree || "",
    expertise: data.expertise || "",
    researchArea: data.researchArea || "",
    bio: data.bio || "",
    university: data.university || "",
    yearsOfExperience: data.yearsOfExperience || "",
    languages: data.languages || "",
    website: data.website || "",
  };
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [research, setResearch] = useState([]);
  const [showResearchForm, setShowResearchForm] = useState(false);
  const [editingResearch, setEditingResearch] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showcase, setShowcase] = useState([]);
  const [showShowcaseForm, setShowShowcaseForm] = useState(false);
  const [editingShowcase, setEditingShowcase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(location.state?.tab || "classes");

  // Profile form state
  const [profile, setProfile] = useState({
    gender: "",
    degree: "",
    expertise: "",
    researchArea: "",
    bio: "",
    university: "",
    yearsOfExperience: "",
    languages: "",
    website: "",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/teacher/login");
        return;
      }

      const teacherDoc = await getDoc(doc(db, "teachers", user.uid));
      if (teacherDoc.exists()) {
        const data = teacherDoc.data();
        setTeacher(data);
        // Load existing profile data
        setProfile(profileFromTeacherData(data));
        setWordCount(
          (data.bio || "").trim().split(/\s+/).filter(Boolean).length,
        );
      }

      const q = query(
        collection(db, "classes"),
        where("teacherId", "==", user.uid),
      );
      const unsubscribeClasses = onSnapshot(q, (snapshot) => {
        setClasses(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });

      const researchQuery = query(
        collection(db, "research"),
        where("teacherId", "==", user.uid),
      );
      const unsubscribeResearch = onSnapshot(researchQuery, (snapshot) => {
        setResearch(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      });

      const projectsQuery = query(
        collection(db, "projects"),
        where("teacherId", "==", user.uid),
      );
      const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
        setProjects(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      });

      const showcaseQuery = query(
        collection(db, "showcase"),
        where("teacherId", "==", user.uid),
      );
      const unsubscribeShowcase = onSnapshot(showcaseQuery, (snapshot) => {
        setShowcase(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      });

      return () => {
        unsubscribeClasses();
        unsubscribeResearch();
        unsubscribeProjects();
        unsubscribeShowcase();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  function cancelProfileEdit() {
    if (teacher) {
      setProfile(profileFromTeacherData(teacher));
      setWordCount(
        (teacher.bio || "").trim().split(/\s+/).filter(Boolean).length,
      );
    }
    setIsEditingProfile(false);
  }

  async function handleLogout() {
    await signOut(auth);
    navigate("/teacher/login");
  }

  async function updateCourseStatus(id, status) {
    try {
      await updateDoc(doc(db, "classes", id), { status });
    } catch (err) {
      console.error(err);
      alert("Failed to update status. Please try again.");
    }
  }

  async function deleteCourse(id) {
    if (!confirm("Delete this course? This can't be undone.")) return;
    try {
      await deleteDoc(doc(db, "classes", id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Please try again.");
    }
  }

  async function deleteResearch(id) {
    if (!confirm("Delete this research post? This can't be undone.")) return;
    try {
      await deleteDoc(doc(db, "research", id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Please try again.");
    }
  }

  async function toggleResearchStage(r) {
    const nextStage = r.stage === "completed" ? "active" : "completed";
    try {
      await updateDoc(doc(db, "research", r.id), { stage: nextStage });
    } catch (err) {
      console.error(err);
      alert("Failed to update status. Please try again.");
    }
  }

  async function deleteProject(id) {
    if (!confirm("Delete this project post? This can't be undone.")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Please try again.");
    }
  }

  async function toggleProjectStage(p) {
    const nextStage = p.stage === "completed" ? "active" : "completed";
    try {
      await updateDoc(doc(db, "projects", p.id), { stage: nextStage });
    } catch (err) {
      console.error(err);
      alert("Failed to update status. Please try again.");
    }
  }

  async function deleteShowcaseEntry(id) {
    if (!confirm("Remove this from Student Work? This can't be undone."))
      return;
    try {
      await deleteDoc(doc(db, "showcase", id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Please try again.");
    }
  }

  function handleProfileChange(e) {
    const { name, value } = e.target;
    if (name === "bio") {
      const words = value.trim().split(/\s+/).filter(Boolean).length;
      if (words > 300) return; // block over 300 words
      setWordCount(words);
    }
    setProfile((prev) => ({ ...prev, [name]: value }));
  }

  // async function saveProfile() {
  //   setProfileSaving(true);
  //   try {
  //     const user = auth.currentUser;
  //     await updateDoc(doc(db, "teachers", user.uid), {
  //       ...profile,
  //       updatedAt: new Date(),
  //     });
  //     setProfileSaved(true);
  //     setTimeout(() => setProfileSaved(false), 2000);
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to save profile. Please try again.");
  //   } finally {
  //     setProfileSaving(false);
  //   }
  // }

  async function saveProfile() {
    //if (!profile.gender) return alert("Please select your gender."); // ← add this
    // Validate required fields
    if (!profile.degree) return alert("Please select your degree.");
    if (!profile.university.trim())
      return alert("Please enter your university.");
    if (!profile.expertise.trim())
      return alert("Please enter your area of expertise.");
    // if (!profile.researchArea.trim())
    //   return alert("Please enter your research area.");
    // if (!profile.yearsOfExperience)
    //   return alert("Please enter your years of experience.");
    if (!profile.languages.trim())
      return alert("Please enter languages spoken.");

    setProfileSaving(true);
    try {
      const user = auth.currentUser;
      await updateDoc(doc(db, "teachers", user.uid), {
        ...profile,
        updatedAt: new Date(),
      });
      setTeacher((prev) => ({ ...prev, ...profile }));
      setProfileSaved(true);
      setTimeout(() => {
        setProfileSaved(false);
        setIsEditingProfile(false);
      }, 1200);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.logo}>🔬 happyResearch</h1>
          </div>
        </div>
        <div className={styles.grid}>
          {[1, 2, 3].map((i) => (
            <SkeletonDashboardCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 14,
    boxSizing: "border-box",
    marginTop: 4,
    fontFamily: "inherit",
  };

  const labelStyle = {
    fontSize: 13,
    color: "#888",
    fontWeight: 600,
  };

  const fieldStyle = {
    marginBottom: 16,
  };

  return (
    <>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.logo}>💻 HappyResearch</h1>
            <p className={styles.welcome}>
              Welcome back, <strong>{teacher?.name}</strong> 👋
            </p>
          </div>
          <div className={styles.headerRight}>
            <button
              className={styles.createBtn}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            borderBottom: "2px solid #f0f0f0",
            paddingBottom: 0,
          }}
        >
          {[
            { id: "research", label: "🔬 Research" },
            { id: "projects", label: "💡 Projects" },
            { id: "classes", label: "📚 Courses" },
            { id: "showcase", label: "🏆 Student Work" },
            { id: "availability", label: "🗓 Availability" },
            { id: "bookings", label: "📬 Bookings" },
          ].map((tab) => (
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
            </button>
          ))}
        </div>
        {activeTab === "research" && (
          <div className={styles.section}>
            {showResearchForm ? (
              <ResearchForm
                research={editingResearch}
                onClose={() => {
                  setShowResearchForm(false);
                  setEditingResearch(null);
                }}
              />
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h2 className={styles.sectionTitle}>Your Research</h2>
                  <button
                    onClick={() => {
                      setEditingResearch(null);
                      setShowResearchForm(true);
                    }}
                    className={styles.createBtn}
                  >
                    + Add Research
                  </button>
                </div>
                {research.length === 0 ? (
                  <div className={styles.empty}>
                    <p>🔬 No research posted yet!</p>
                    <button
                      onClick={() => {
                        setEditingResearch(null);
                        setShowResearchForm(true);
                      }}
                      className={styles.createBtn}
                    >
                      + Post your first research
                    </button>
                  </div>
                ) : (
                  <div className={styles.grid}>
                    {research.map((r) => (
                      <div key={r.id} className={styles.card}>
                        <div className={styles.cardTop}>
                          <h3 className={styles.cardTitle}>{r.title}</h3>
                          <span
                            className={`${styles.badge} ${r.stage === "completed" ? styles.draft : styles.active}`}
                          >
                            {r.stage === "completed" ? "Completed" : "Active"}
                          </span>
                        </div>
                        <p className={styles.cardDesc}>{r.idea}</p>
                        {r.gradeLevel && (
                          <span
                            style={{
                              display: "inline-block",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#00274c",
                              background: "#fff8dc",
                              border: "1px solid #ffcb05",
                              padding: "2px 10px",
                              borderRadius: 20,
                              marginBottom: 6,
                            }}
                          >
                            🎓 {r.gradeLevel}
                          </span>
                        )}
                        {r.deliverable && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "#166534",
                              fontWeight: 600,
                              margin: "0 0 6px",
                            }}
                          >
                            📦 {r.deliverable}
                          </p>
                        )}
                        {r.seats ? (
                          <div className={styles.cardMeta}>
                            <span>
                              👥 {r.enrolledCount || 0} / {r.seats} seats
                            </span>
                          </div>
                        ) : null}
                        <RegistrationList itemId={r.id} />
                        <div className={styles.cardFooter}>
                          <button
                            className={styles.joinBtn}
                            onClick={() => {
                              setEditingResearch(r);
                              setShowResearchForm(true);
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className={styles.copyBtn}
                            onClick={() => toggleResearchStage(r)}
                          >
                            {r.stage === "completed"
                              ? "🔄 Mark Active"
                              : "✅ Mark Completed"}
                          </button>
                          <button
                            className={styles.copyBtn}
                            onClick={() => deleteResearch(r.id)}
                            style={{ color: "#e74c3c" }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {/* ── Projects Tab ── */}
        {activeTab === "projects" && (
          <div className={styles.section}>
            {showProjectForm ? (
              <ProjectForm
                project={editingProject}
                onClose={() => {
                  setShowProjectForm(false);
                  setEditingProject(null);
                }}
              />
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h2 className={styles.sectionTitle}>Your Projects</h2>
                  <button
                    onClick={() => {
                      setEditingProject(null);
                      setShowProjectForm(true);
                    }}
                    className={styles.createBtn}
                  >
                    + Add Project
                  </button>
                </div>
                {projects.length === 0 ? (
                  <div className={styles.empty}>
                    <p>💡 No projects posted yet!</p>
                    <button
                      onClick={() => {
                        setEditingProject(null);
                        setShowProjectForm(true);
                      }}
                      className={styles.createBtn}
                    >
                      + Post your first project
                    </button>
                  </div>
                ) : (
                  <div className={styles.grid}>
                    {projects.map((p) => (
                      <div key={p.id} className={styles.card}>
                        <div className={styles.cardTop}>
                          <h3 className={styles.cardTitle}>{p.title}</h3>
                          <span
                            className={`${styles.badge} ${p.stage === "completed" ? styles.draft : styles.active}`}
                          >
                            {p.stage === "completed" ? "Completed" : "Active"}
                          </span>
                        </div>
                        <p className={styles.cardDesc}>{p.description}</p>
                        {p.gradeLevel && (
                          <span
                            style={{
                              display: "inline-block",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#00274c",
                              background: "#fff8dc",
                              border: "1px solid #ffcb05",
                              padding: "2px 10px",
                              borderRadius: 20,
                              marginBottom: 6,
                            }}
                          >
                            🎓 {p.gradeLevel}
                          </span>
                        )}
                        {p.deliverable && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "#166534",
                              fontWeight: 600,
                              margin: "0 0 6px",
                            }}
                          >
                            📦 {p.deliverable}
                          </p>
                        )}
                        {p.seats ? (
                          <div className={styles.cardMeta}>
                            <span>
                              👥 {p.enrolledCount || 0} / {p.seats} seats
                            </span>
                          </div>
                        ) : null}
                        <RegistrationList itemId={p.id} />
                        <div className={styles.cardFooter}>
                          <button
                            className={styles.joinBtn}
                            onClick={() => {
                              setEditingProject(p);
                              setShowProjectForm(true);
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className={styles.copyBtn}
                            onClick={() => toggleProjectStage(p)}
                          >
                            {p.stage === "completed"
                              ? "🔄 Mark Active"
                              : "✅ Mark Completed"}
                          </button>
                          <button
                            className={styles.copyBtn}
                            onClick={() => deleteProject(p.id)}
                            style={{ color: "#e74c3c" }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {/* ── Classes Tab ── */}
        {activeTab === "classes" && (
          <div className={styles.section}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                Your Courses
              </h2>
              <Link to='/teacher/create-class' className={styles.createBtn}>
                + Create Course
              </Link>
            </div>
            {classes.length === 0 ? (
              <div className={styles.empty}>
                <p>🎒 No courses yet!</p>
                <Link to='/teacher/create-class' className={styles.createBtn}>
                  + Create your first course
                </Link>
              </div>
            ) : (
              <div className={styles.grid}>
                {classes.map((cls) => (
                  <div key={cls.id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <h3 className={styles.cardTitle}>{cls.title}</h3>
                      <select
                        value={cls.status || "registration"}
                        onChange={(e) =>
                          updateCourseStatus(cls.id, e.target.value)
                        }
                        className={`${styles.badge} ${
                          cls.status === "completed"
                            ? styles.completed
                            : cls.status === "active"
                              ? styles.active
                              : styles.registration
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <option value='registration'>Registration</option>
                        <option value='active'>Active</option>
                        <option value='completed'>Completed</option>
                      </select>
                    </div>
                    {cls.gradeLevel && (
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#00274c",
                          background: "#fff8dc",
                          border: "1px solid #ffcb05",
                          padding: "2px 10px",
                          borderRadius: 20,
                          marginBottom: 6,
                        }}
                      >
                        🎓 {cls.gradeLevel}
                      </span>
                    )}
                    <p className={styles.cardDesc}>{cls.description}</p>
                    {cls.prerequisites && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "#888",
                          margin: "0 0 6px",
                        }}
                      >
                        ✅ Prerequisites: {cls.prerequisites}
                      </p>
                    )}
                    <div className={styles.cardMeta}>
                      {cls.lessons?.length > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          {cls.lessons.map((l) => (
                            <span key={l.date}>
                              📅 {l.date} ({lessonWeekday(l.date)}) ·{" "}
                              {l.startTime}–{l.endTime}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span>
                          📅 {cls.date || cls.dates?.join(", ")}
                          {cls.startTime &&
                            ` · ${cls.startTime}–${cls.endTime}`}
                        </span>
                      )}
                      <span>
                        👥 {cls.enrolledCount || 0} / {cls.maxSeats} seats
                      </span>
                    </div>
                    <RegistrationList itemId={cls.id} />
                    <div className={styles.cardFooter}>
                      <Link
                        to={`/classroom/${cls.id}`}
                        className={styles.joinBtn}
                      >
                        🎥 Start Class
                      </Link>
                      <button
                        className={styles.copyBtn}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/#/classroom/${cls.id}`,
                          );
                          alert("Link copied!");
                        }}
                      >
                        📋 Copy Link
                      </button>
                      <Link
                        to='/teacher/create-class'
                        state={{ editCourseId: cls.id }}
                        className={styles.copyBtn}
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        className={styles.copyBtn}
                        onClick={() => deleteCourse(cls.id)}
                        style={{ color: "#e74c3c" }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* ── Showcase Tab ── */}
        {activeTab === "showcase" && (
          <div className={styles.section}>
            {showShowcaseForm ? (
              <ShowcaseForm
                entry={editingShowcase}
                onClose={() => {
                  setShowShowcaseForm(false);
                  setEditingShowcase(null);
                }}
              />
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <h2 className={styles.sectionTitle} style={{ marginBottom: 4 }}>
                      Your Student Work
                    </h2>
                    <p style={{ color: "#888", fontSize: 13, margin: 0 }}>
                      Finished student projects, shown publicly as proof of
                      real outcomes.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingShowcase(null);
                      setShowShowcaseForm(true);
                    }}
                    className={styles.createBtn}
                  >
                    + Add to Student Work
                  </button>
                </div>
                {showcase.length === 0 ? (
                  <div className={styles.empty}>
                    <p>🏆 Nothing published yet!</p>
                    <p style={{ fontSize: 13, color: "#aaa", marginTop: -8 }}>
                      Once a student finishes a research post or project,
                      publish their outcome here.
                    </p>
                    <button
                      onClick={() => {
                        setEditingShowcase(null);
                        setShowShowcaseForm(true);
                      }}
                      className={styles.createBtn}
                    >
                      + Add your first Student Work entry
                    </button>
                  </div>
                ) : (
                  <div className={styles.grid}>
                    {showcase.map((s) => (
                      <div key={s.id} className={styles.card}>
                        <div className={styles.cardTop}>
                          <h3 className={styles.cardTitle}>{s.title}</h3>
                          <span className={`${styles.badge} ${styles.active}`}>
                            {s.outputType}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 13,
                            color: "#888",
                            margin: "0 0 8px",
                          }}
                        >
                          👤 {s.studentName}
                        </p>
                        <p className={styles.cardDesc}>{s.summary}</p>
                        {s.outputUrl && (
                          <a
                            href={s.outputUrl}
                            target='_blank'
                            rel='noreferrer'
                            style={{
                              fontSize: 13,
                              color: "#00274c",
                              textDecoration: "underline",
                            }}
                          >
                            View finished work →
                          </a>
                        )}
                        <div className={styles.cardFooter}>
                          <button
                            className={styles.joinBtn}
                            onClick={() => {
                              setEditingShowcase(s);
                              setShowShowcaseForm(true);
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className={styles.copyBtn}
                            onClick={() => deleteShowcaseEntry(s.id)}
                            style={{ color: "#e74c3c" }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {/* ── Availability Tab ── */}
        {activeTab === "availability" && (
          <div className={styles.section}>
            <Availability />
          </div>
        )}
        {/* ── Bookings Tab ── */}
        {activeTab === "bookings" && (
          <div className={styles.section}>
            <BookingRequests />
          </div>
        )}
        {/* ── Profile Tab ── */}
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
                  This information will be displayed on your public tutor
                  profile.
                </p>
              </div>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
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

            {!isEditingProfile ? (
              <div style={{ maxWidth: 600 }}>
                {[
                  ["Gender", profile.gender],
                  ["Degree", profile.degree],
                  ["University / Institution", profile.university],
                  ["Area of Expertise", profile.expertise],
                  ["Research Area", profile.researchArea],
                  [
                    "Years of Teaching Experience",
                    profile.yearsOfExperience,
                  ],
                  ["Languages Spoken", profile.languages],
                ].map(([label, value]) => (
                  <div style={fieldStyle} key={label}>
                    <p style={labelStyle}>{label}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 15 }}>
                      {value || <span style={{ color: "#bbb" }}>Not set</span>}
                    </p>
                  </div>
                ))}
                <div style={fieldStyle}>
                  <p style={labelStyle}>Personal Website / LinkedIn</p>
                  {safeUrl(profile.website) ? (
                    <a
                      href={safeUrl(profile.website)}
                      target='_blank'
                      rel='noreferrer'
                      style={{
                        display: "block",
                        marginTop: 4,
                        fontSize: 15,
                        color: "#00274c",
                      }}
                    >
                      {profile.website}
                    </a>
                  ) : (
                    <p style={{ margin: "4px 0 0", fontSize: 15, color: "#bbb" }}>
                      Not set
                    </p>
                  )}
                </div>
                <div style={fieldStyle}>
                  <p style={labelStyle}>About Me</p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 15,
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {profile.bio || (
                      <span style={{ color: "#bbb" }}>Not set</span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
            <div style={{ maxWidth: 600 }}>
              {/* Gender */}
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Gender <span style={{ color: "#e74c3c" }}>*</span>
                </label>
                <select
                  name='gender'
                  value={profile.gender}
                  onChange={handleProfileChange}
                  style={inputStyle}
                >
                  <option value=''>Select gender</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                </select>
              </div>
              {/* Degree */}
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Degree <span style={{ color: "#e74c3c" }}>*</span>
                </label>
                <select
                  name='degree'
                  value={profile.degree}
                  onChange={handleProfileChange}
                  style={inputStyle}
                >
                  <option value=''>Select your highest degree</option>
                  <optgroup label='Secondary Education'>
                    <option value='High School Diploma'>
                      High School Diploma
                    </option>
                    <option value='GED'>GED</option>
                  </optgroup>
                  <optgroup label='Undergraduate'>
                    <option value="Associate's Degree">
                      Associate's Degree
                    </option>
                    <option value='Bachelor of Arts (BA)'>
                      Bachelor of Arts (BA)
                    </option>
                    <option value='Bachelor of Science (BS)'>
                      Bachelor of Science (BS)
                    </option>
                    <option value='Bachelor of Education (BEd)'>
                      Bachelor of Education (BEd)
                    </option>
                    <option value='Bachelor of Engineering (BEng)'>
                      Bachelor of Engineering (BEng)
                    </option>
                  </optgroup>
                  <optgroup label='Graduate'>
                    <option value='Master of Arts (MA)'>
                      Master of Arts (MA)
                    </option>
                    <option value='Master of Science (MS)'>
                      Master of Science (MS)
                    </option>
                    <option value='Master of Education (MEd)'>
                      Master of Education (MEd)
                    </option>
                    <option value='Master of Business Administration (MBA)'>
                      Master of Business Administration (MBA)
                    </option>
                    <option value='Master of Engineering (MEng)'>
                      Master of Engineering (MEng)
                    </option>
                    <option value='Master of Fine Arts (MFA)'>
                      Master of Fine Arts (MFA)
                    </option>
                  </optgroup>
                  <optgroup label='Doctorate'>
                    <option value='Doctor of Philosophy (PhD)'>
                      Doctor of Philosophy (PhD)
                    </option>
                    <option value='Doctor of Education (EdD)'>
                      Doctor of Education (EdD)
                    </option>
                    <option value='Doctor of Medicine (MD)'>
                      Doctor of Medicine (MD)
                    </option>
                    <option value='Doctor of Law (JD)'>
                      Doctor of Law (JD)
                    </option>
                    <option value='Doctor of Business Administration (DBA)'>
                      Doctor of Business Administration (DBA)
                    </option>
                    <option value='Doctor of Engineering (DEng)'>
                      Doctor of Engineering (DEng)
                    </option>
                  </optgroup>
                  <optgroup label='Other'>
                    <option value='Professional Certification'>
                      Professional Certification
                    </option>
                    <option value='Vocational Training'>
                      Vocational Training
                    </option>
                    <option value='Other'>Other</option>
                  </optgroup>
                </select>
              </div>

              {/* University */}
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  University / Institution{" "}
                  <span style={{ color: "#e74c3c" }}>*</span>
                </label>
                <input
                  name='university'
                  value={profile.university}
                  onChange={handleProfileChange}
                  placeholder='e.g. MIT, Stanford University'
                  style={inputStyle}
                />
              </div>

              {/* Expertise */}
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Area of Expertise <span style={{ color: "#e74c3c" }}>*</span>
                </label>
                <input
                  name='expertise'
                  value={profile.expertise}
                  onChange={handleProfileChange}
                  placeholder='e.g. Machine Learning, Web Development'
                  style={inputStyle}
                />
              </div>

              {/* Research Area */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Research Area </label>
                <input
                  name='researchArea'
                  value={profile.researchArea}
                  onChange={handleProfileChange}
                  placeholder='e.g. Natural Language Processing, Computer Vision'
                  style={inputStyle}
                />
              </div>

              {/* Years of Experience */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Years of Teaching Experience</label>
                <input
                  name='yearsOfExperience'
                  type='number'
                  min='0'
                  value={profile.yearsOfExperience}
                  onChange={handleProfileChange}
                  placeholder='e.g. 5'
                  style={inputStyle}
                />
              </div>

              {/* Languages */}
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Languages Spoken <span style={{ color: "#e74c3c" }}>*</span>
                </label>
                <input
                  name='languages'
                  value={profile.languages}
                  onChange={handleProfileChange}
                  placeholder='e.g. English, Spanish, Mandarin'
                  style={inputStyle}
                />
              </div>

              {/* Website */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Personal Website / LinkedIn</label>
                <input
                  name='website'
                  value={profile.website}
                  onChange={handleProfileChange}
                  placeholder='e.g. https://linkedin.com/in/yourname'
                  style={inputStyle}
                />
              </div>

              {/* Bio */}
              <div style={fieldStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label style={labelStyle}>About Me</label>
                  <span
                    style={{
                      fontSize: 12,
                      color: wordCount > 280 ? "#e74c3c" : "#aaa",
                    }}
                  >
                    {wordCount} / 500 words
                  </span>
                </div>
                <textarea
                  name='bio'
                  value={profile.bio}
                  onChange={handleProfileChange}
                  placeholder='Tell students about yourself — your background, teaching style, achievements, and why you love teaching...'
                  rows={20}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                />
                {wordCount >= 300 && (
                  <p style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>
                    Maximum 300 words reached.
                  </p>
                )}
              </div>

              {/* Save / Cancel buttons */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={saveProfile}
                  disabled={profileSaving}
                  style={{
                    padding: "12px 32px",
                    borderRadius: 8,
                    border: "none",
                    background: profileSaved ? "#27ae60" : "#00274c",
                    color: "white",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  {profileSaving
                    ? "Saving..."
                    : profileSaved
                      ? "Saved!"
                      : "Save Profile"}
                </button>
                <button
                  onClick={cancelProfileEdit}
                  disabled={profileSaving}
                  style={{
                    padding: "12px 32px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    background: "white",
                    color: "#555",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
            )}
          </div>
        )}

      </div>
      <Footer />
    </>
  );
}
