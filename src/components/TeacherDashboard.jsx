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
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import styles from "./TeacherDashboard.module.css";

import Availability from "./Availability";
import BookingRequests from "./BookingRequests";
import { SkeletonDashboardCard } from "./Skeleton";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("classes");

  // Profile form state
  const [profile, setProfile] = useState({
    degree: "",
    expertise: "",
    researchArea: "",
    bio: "",
    university: "",
    yearsOfExperience: "",
    languages: "",
    website: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [projects, setProjects] = useState([]); // ← add this
  const [newProject, setNewProject] = useState({ title: "", description: "" });

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
        setProjects(data.projects || []);
        // Load existing profile data
        setProfile({
          degree: data.degree || "",
          expertise: data.expertise || "",
          researchArea: data.researchArea || "",
          bio: data.bio || "",
          university: data.university || "",
          yearsOfExperience: data.yearsOfExperience || "",
          languages: data.languages || "",
          website: data.website || "",
        });
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

      return () => unsubscribeClasses();
    });

    return () => unsubscribeAuth();
  }, []);

  function addProject() {
    if (!newProject.title.trim()) return alert("Please enter a project title.");
    const project = {
      id: crypto.randomUUID(),
      title: newProject.title.trim(),
      description: newProject.description.trim(),
    };
    setProjects((prev) => [...prev, project]);
    setNewProject({ title: "", description: "" });
  }

  function removeProject(id) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleLogout() {
    await signOut(auth);
    navigate("/teacher/login");
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
        projects,
        updatedAt: new Date(),
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
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
          <Link to='/teacher/create-class' className={styles.createBtn}>
            + Create Class
          </Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{classes.length}</span>
          <span className={styles.statLabel}>Total Classes</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>
            {classes.filter((c) => c.status === "active").length}
          </span>
          <span className={styles.statLabel}>Active Classes</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>
            {classes.reduce((acc, c) => acc + (c.enrolledCount || 0), 0)}
          </span>
          <span className={styles.statLabel}>Total Students</span>
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
          { id: "classes", label: "📚 Classes" },
          { id: "availability", label: "🗓 Availability" },
          { id: "bookings", label: "📬 Bookings" },
          { id: "profile", label: "👤 Profile" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: activeTab === tab.id ? "#4a90e2" : "#888",
              borderBottom:
                activeTab === tab.id
                  ? "2px solid #4a90e2"
                  : "2px solid transparent",
              marginBottom: -2,
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Classes Tab ── */}
      {activeTab === "classes" && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Classes</h2>
          {classes.length === 0 ? (
            <div className={styles.empty}>
              <p>🎒 No classes yet!</p>
              <Link to='/teacher/create-class' className={styles.createBtn}>
                + Create your first class
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {classes.map((cls) => (
                <div key={cls.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <h3 className={styles.cardTitle}>{cls.title}</h3>
                    <span
                      className={`${styles.badge} ${cls.status === "active" ? styles.active : styles.draft}`}
                    >
                      {cls.status || "draft"}
                    </span>
                  </div>
                  <p className={styles.cardDesc}>{cls.description}</p>
                  <div className={styles.cardMeta}>
                    <span>
                      📅 {cls.date} at {cls.time}
                    </span>
                    <span>
                      👥 {cls.enrolledCount || 0} / {cls.maxSeats} seats
                    </span>
                  </div>
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
                  </div>
                </div>
              ))}
            </div>
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
          <h2 className={styles.sectionTitle}>👤 My Profile</h2>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
            This information will be displayed on your public tutor profile.
          </p>

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
                  <option value="Associate's Degree">Associate's Degree</option>
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
                  <option value='Doctor of Law (JD)'>Doctor of Law (JD)</option>
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
                  {wordCount} / 300 words
                </span>
              </div>
              <textarea
                name='bio'
                value={profile.bio}
                onChange={handleProfileChange}
                placeholder='Tell students about yourself — your background, teaching style, achievements, and why you love teaching...'
                rows={6}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              />
              {wordCount >= 300 && (
                <p style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>
                  Maximum 300 words reached.
                </p>
              )}
            </div>

            {/* Projects */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>
                💡 Project Ideas
              </h3>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
                Share project ideas students can work on with you.
              </p>

              {/* Existing projects */}
              {projects.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      style={{
                        padding: 16,
                        borderRadius: 10,
                        background: "#f9fafb",
                        border: "1px solid #eee",
                        position: "relative",
                      }}
                    >
                      <button
                        onClick={() => removeProject(project.id)}
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          background: "none",
                          border: "none",
                          color: "#e74c3c",
                          cursor: "pointer",
                          fontSize: 16,
                        }}
                      >
                        ✕
                      </button>
                      <h4
                        style={{
                          margin: "0 0 6px",
                          fontSize: 15,
                          paddingRight: 24,
                        }}
                      >
                        {project.title}
                      </h4>
                      {project.description && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            color: "#666",
                            lineHeight: 1.5,
                          }}
                        >
                          {project.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add new project */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  border: "2px dashed #ddd",
                  background: "white",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#888",
                    marginBottom: 10,
                  }}
                >
                  + Add a project
                </p>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Project Title *</label>
                  <input
                    value={newProject.title}
                    onChange={(e) =>
                      setNewProject({ ...newProject, title: e.target.value })
                    }
                    placeholder='e.g. Build a chatbot with Python'
                    style={inputStyle}
                  />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>
                    Description{" "}
                    <span style={{ color: "#aaa", fontWeight: 400 }}>
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                    placeholder='Describe what the student will build and learn...'
                    rows={3}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      lineHeight: 1.6,
                    }}
                  />
                </div>
                <button
                  onClick={addProject}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "#4a90e2",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  + Add Project
                </button>
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={saveProfile}
              disabled={profileSaving}
              style={{
                padding: "12px 32px",
                borderRadius: 8,
                border: "none",
                background: profileSaved ? "#27ae60" : "#4a90e2",
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
          </div>
        </div>
      )}
    </div>
  );
}
