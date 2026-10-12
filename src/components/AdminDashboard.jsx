// src/components/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { db, auth, storage } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Link } from "react-router-dom";
import { mentorTypeLabel } from "../utils/mentorVerification";

const ADMIN_EMAIL = "zhenhepan@gmail.com";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [tab, setTab] = useState("research");

  const [research, setResearch] = useState([]);
  const [internships, setInternships] = useState([]);
  const [mentors, setMentors] = useState([]);
  const pendingApplications = mentors.filter(
    (m) => m.verificationStatus === "pending_review",
  );
  const [rejectTarget, setRejectTarget] = useState(null); // mentor being rejected, or null
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const [editItem, setEditItem] = useState(null);
  const [editType, setEditType] = useState(null);

  const [addType, setAddType] = useState(null);
  const [addForm, setAddForm] = useState({});
  const [addLoading, setAddLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Filters & sorting for each tab (client-side, data is already loaded)
  const [researchSearch, setResearchSearch] = useState("");
  const [researchStatusFilter, setResearchStatusFilter] = useState("all");
  const [researchSort, setResearchSort] = useState("newest");

  const [internshipSearch, setInternshipSearch] = useState("");
  const [internshipStatusFilter, setInternshipStatusFilter] = useState("all");
  const [internshipSort, setInternshipSort] = useState("newest");

  const [mentorSearch, setMentorSearch] = useState("");
  const [mentorStatusFilter, setMentorStatusFilter] = useState("all");
  const [mentorVerificationFilter, setMentorVerificationFilter] =
    useState("all");
  const [mentorSort, setMentorSort] = useState("name");

  const [applicationSearch, setApplicationSearch] = useState("");
  const [applicationTypeFilter, setApplicationTypeFilter] = useState("all");
  const [applicationSort, setApplicationSort] = useState("oldest");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u && u.email === ADMIN_EMAIL) setUser(u);
      else setUser(null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "research"), (snap) => {
      setResearch(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "internships"), (snap) => {
      setInternships(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "teachers"), (snap) => {
      setMentors(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  async function uploadMentorImage(file, mentorId) {
    const imageRef = ref(storage, `mentors/${mentorId}_${Date.now()}`);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResetSent(false);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        setError("You are not authorized as admin.");
      }
    } catch (err) {
      if (err.code === "auth/too-many-requests") {
        setError(
          "Too many failed attempts. Wait a few minutes, or reset your password below.",
        );
      } else if (err.code === "auth/invalid-email") {
        setError("That doesn't look like a valid email address.");
      } else if (err.code === "auth/user-disabled") {
        setError("This account has been disabled.");
      } else {
        setError("Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError("Enter your admin email above first, then click Forgot password.");
      return;
    }
    setResetLoading(true);
    setError("");
    setResetSent(false);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err) {
      if (err.code === "auth/invalid-email") {
        setError("That doesn't look like a valid email address.");
      } else {
        setError("Could not send reset email. Please try again.");
      }
    } finally {
      setResetLoading(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setUser(null);
  }

  async function approveApplication(mentorId) {
    await updateDoc(doc(db, "teachers", mentorId), {
      verificationStatus: "approved",
      rejectionReason: null,
    });
  }

  async function rejectApplication(mentorId, reason) {
    await updateDoc(doc(db, "teachers", mentorId), {
      verificationStatus: "rejected",
      rejectionReason: reason.trim(),
    });
  }

  function openRejectModal(mentorId) {
    setRejectTarget(mentorId);
    setRejectReason("");
    setRejectError("");
  }

  async function submitRejectModal() {
    const trimmed = rejectReason.trim();
    if (trimmed.length < 10 || !/[a-zA-Z]{3,}/.test(trimmed)) {
      setRejectError(
        "Please write at least one full sentence explaining why this is being rejected.",
      );
      return;
    }
    await rejectApplication(rejectTarget, trimmed);
    setRejectTarget(null);
  }

  async function handleDisable(collection_, id, currentStatus) {
    await updateDoc(doc(db, collection_, id), {
      status: currentStatus === "disabled" ? "published" : "disabled",
    });
  }

  async function handleDelete(collection_, id) {
    if (
      !window.confirm(
        "Are you sure you want to delete this? This cannot be undone.",
      )
    )
      return;
    await deleteDoc(doc(db, collection_, id));
  }

  async function handleSaveEdit() {
    if (!editItem || !editType) return;
    setImageUploading(true);
    try {
      const { id, ...data } = editItem;
      console.log("Saving:", id, data); // ← add this
      if (imageFile && editType === "teachers") {
        const url = await uploadMentorImage(imageFile, id);
        data.photoURL = url;
      }
      await updateDoc(doc(db, editType, id), data);
      setEditItem(null);
      setEditType(null);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save. Please try again.");
    } finally {
      setImageUploading(false);
    }
  }

  async function handleAdd() {
    if (!addType) return;
    setAddLoading(true);
    try {
      let photoURL = null;
      if (imageFile && addType === "teachers") {
        const tempId = Date.now().toString();
        photoURL = await uploadMentorImage(imageFile, tempId);
      }
      await addDoc(collection(db, addType), {
        ...addForm,
        teacherId: "admin",
        teacherName: "HappyResearch Team",
        createdAt: new Date(),
        ...(addType === "research" && { status: "published" }),
        ...(addType === "internships" && { status: "open", applicants: 0 }),
        ...(addType === "teachers" && {
          photoURL,
          disabled: false,
          verificationStatus: "approved",
          projects: addForm.projects || [],
        }),
      });
      setAddType(null);
      setAddForm({});
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      alert("Failed to add. Please try again.");
    } finally {
      setAddLoading(false);
    }
  }

  const btnStyle = (color) => ({
    padding: "6px 14px",
    borderRadius: 6,
    border: "none",
    background: color,
    color: "white",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  });

  // ── Login screen ──

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 32,
            width: 360,
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            position: "relative",
          }}
        >
          {/* X button */}
          <a
            href='/'
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "#888",
              fontSize: 22,
              textDecoration: "none",
              lineHeight: 1,
            }}
          >
            ✕
          </a>

          <h2 style={{ marginBottom: 4 }}>🔐 Admin Login</h2>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
            HappyResearch admin only
          </p>
          {error && (
            <p style={{ color: "red", fontSize: 13, marginBottom: 12 }}>
              {error}
            </p>
          )}
          {resetSent && (
            <p style={{ color: "#1f6f4a", fontSize: 13, marginBottom: 12 }}>
              Password reset email sent to {email.trim()}. Check your inbox
              (and spam folder).
            </p>
          )}
          <form onSubmit={handleLogin}>
            <input
              type='email'
              placeholder='Admin email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ddd",
                marginBottom: 10,
                boxSizing: "border-box",
              }}
            />
            <input
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ddd",
                marginBottom: 16,
                boxSizing: "border-box",
              }}
            />
            <button
              type='submit'
              disabled={loading}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "none",
                background: "#2f6175",
                color: "white",
                fontSize: 15,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {loading ? "Logging in..." : "Login →"}
            </button>
          </form>
          <button
            type='button'
            onClick={handleForgotPassword}
            disabled={resetLoading}
            style={{
              display: "block",
              width: "100%",
              marginTop: 14,
              background: "none",
              border: "none",
              color: "#2f6175",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            {resetLoading ? "Sending..." : "Forgot password?"}
          </button>
        </div>
      </div>
    );
  }

  // ── Filters & sorting (client-side, data is already fully loaded) ──
  const filterInputStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 13,
    fontFamily: "inherit",
  };

  function sortByDate(list, field, direction) {
    return [...list].sort((a, b) => {
      const ta = a[field]?.toMillis?.() ?? 0;
      const tb = b[field]?.toMillis?.() ?? 0;
      return direction === "oldest" ? ta - tb : tb - ta;
    });
  }

  let visibleResearch = research.filter((r) => {
    if (
      researchStatusFilter === "active" &&
      r.status === "disabled"
    )
      return false;
    if (researchStatusFilter === "disabled" && r.status !== "disabled")
      return false;
    const q = researchSearch.trim().toLowerCase();
    if (!q) return true;
    return [r.title, r.idea, r.teacherName]
      .filter(Boolean)
      .some((s) => s.toLowerCase().includes(q));
  });
  visibleResearch =
    researchSort === "title"
      ? [...visibleResearch].sort((a, b) =>
          (a.title || "").localeCompare(b.title || ""),
        )
      : sortByDate(visibleResearch, "createdAt", researchSort);

  let visibleInternships = internships.filter((i) => {
    if (internshipStatusFilter === "active" && i.status === "disabled")
      return false;
    if (internshipStatusFilter === "disabled" && i.status !== "disabled")
      return false;
    const q = internshipSearch.trim().toLowerCase();
    if (!q) return true;
    return [i.title, i.field, i.teacherName]
      .filter(Boolean)
      .some((s) => s.toLowerCase().includes(q));
  });
  visibleInternships =
    internshipSort === "title"
      ? [...visibleInternships].sort((a, b) =>
          (a.title || "").localeCompare(b.title || ""),
        )
      : internshipSort === "deadline"
        ? [...visibleInternships].sort((a, b) =>
            (a.deadline || "").localeCompare(b.deadline || ""),
          )
        : sortByDate(visibleInternships, "createdAt", internshipSort);

  let visibleMentors = mentors.filter((m) => {
    if (mentorStatusFilter === "active" && m.disabled) return false;
    if (mentorStatusFilter === "disabled" && !m.disabled) return false;
    if (
      mentorVerificationFilter !== "all" &&
      (m.verificationStatus || "not_started") !== mentorVerificationFilter
    )
      return false;
    const q = mentorSearch.trim().toLowerCase();
    if (!q) return true;
    return [m.name, m.university, m.expertise]
      .filter(Boolean)
      .some((s) => s.toLowerCase().includes(q));
  });
  visibleMentors =
    mentorSort === "name"
      ? [...visibleMentors].sort((a, b) =>
          (a.name || "").localeCompare(b.name || ""),
        )
      : mentorSort === "university"
        ? [...visibleMentors].sort((a, b) =>
            (a.university || "").localeCompare(b.university || ""),
          )
        : sortByDate(visibleMentors, "createdAt", mentorSort);

  let visibleApplications = pendingApplications.filter((m) => {
    if (applicationTypeFilter !== "all" && m.mentorType !== applicationTypeFilter)
      return false;
    const q = applicationSearch.trim().toLowerCase();
    if (!q) return true;
    return [m.name, m.email].filter(Boolean).some((s) => s.toLowerCase().includes(q));
  });
  visibleApplications =
    applicationSort === "name"
      ? [...visibleApplications].sort((a, b) =>
          (a.name || "").localeCompare(b.name || ""),
        )
      : [...visibleApplications].sort((a, b) => {
          const ta = a.submittedAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0;
          const tb = b.submittedAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0;
          return applicationSort === "oldest" ? ta - tb : tb - ta;
        });

  // ── Admin dashboard ──
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: 32 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>🛡 Admin Dashboard</h2>
          <p style={{ color: "#888", fontSize: 14, margin: 0 }}>
            Logged in as {user.email}
          </p>
        </div>
        <button onClick={handleLogout} style={btnStyle("#a01f13")}>
          Logout
        </button>
      </div>

      {/* Main Tabs */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}
      >
        {[
          { id: "research", label: "🔬 Research" },
          { id: "internships", label: "🧪 Internships" },
          { id: "mentors", label: "👩‍🏫 Mentors" },
          {
            id: "applications",
            label: `✅ Applications${pendingApplications.length > 0 ? ` (${pendingApplications.length})` : ""}`,
          },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 20px",
              borderRadius: 20,
              border: "none",
              background: tab === t.id ? "#2f6175" : "#e0e0e0",
              color: tab === t.id ? "white" : "#555",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Research Tab ── */}
      {tab === "research" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <p style={{ color: "#888", margin: 0 }}>
              {visibleResearch.length} of {research.length} research entries
            </p>
            <button
              onClick={() => {
                setAddType("research");
                setAddForm({ title: "", idea: "", impact: "", details: "" });
              }}
              style={btnStyle("#2f6175")}
            >
              + Add Research
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <input
              type='text'
              placeholder='Search title, idea, mentor...'
              value={researchSearch}
              onChange={(e) => setResearchSearch(e.target.value)}
              style={{ ...filterInputStyle, flex: "1 1 220px" }}
            />
            <select
              value={researchStatusFilter}
              onChange={(e) => setResearchStatusFilter(e.target.value)}
              style={filterInputStyle}
            >
              <option value='all'>All statuses</option>
              <option value='active'>Active</option>
              <option value='disabled'>Disabled</option>
            </select>
            <select
              value={researchSort}
              onChange={(e) => setResearchSort(e.target.value)}
              style={filterInputStyle}
            >
              <option value='newest'>Newest first</option>
              <option value='oldest'>Oldest first</option>
              <option value='title'>Title (A-Z)</option>
            </select>
          </div>
          {visibleResearch.length === 0 ? (
            <p style={{ color: "#aaa" }}>No research matches these filters.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {visibleResearch.map((r) => (
                <div
                  key={r.id}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: 20,
                    border: `1px solid ${r.status === "disabled" ? "#fca5a5" : "#eee"}`,
                    opacity: r.status === "disabled" ? 0.7 : 1,
                  }}
                >
                  {r.status === "disabled" && (
                    <span
                      style={{
                        fontSize: 11,
                        background: "#fee2e2",
                        color: "#a01f13",
                        padding: "2px 8px",
                        borderRadius: 20,
                        marginBottom: 8,
                        display: "inline-block",
                      }}
                    >
                      Disabled
                    </span>
                  )}
                  <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>{r.title}</h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#555",
                      marginBottom: 8,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {r.idea}
                  </p>
                  <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
                    👩‍🏫 {r.teacherName}
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() => {
                        setEditItem({ ...r });
                        setEditType("research");
                      }}
                      style={btnStyle("#2f6175")}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDisable("research", r.id, r.status)}
                      style={btnStyle(
                        r.status === "disabled" ? "#1f6f4a" : "#f59e0b",
                      )}
                    >
                      {r.status === "disabled" ? "✅ Enable" : "⏸ Disable"}
                    </button>
                    <button
                      onClick={() => handleDelete("research", r.id)}
                      style={btnStyle("#a01f13")}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Internships Tab ── */}
      {tab === "internships" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <p style={{ color: "#888", margin: 0 }}>
              {visibleInternships.length} of {internships.length} internships
            </p>
            <button
              onClick={() => {
                setAddType("internships");
                setAddForm({
                  title: "",
                  field: "",
                  description: "",
                  requirements: "",
                  outcomes: "",
                  duration: "",
                  mode: "Remote",
                  stipend: "Unpaid",
                  spots: "",
                  deadline: "",
                });
              }}
              style={btnStyle("#2f6175")}
            >
              + Add Internship
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <input
              type='text'
              placeholder='Search title, field, mentor...'
              value={internshipSearch}
              onChange={(e) => setInternshipSearch(e.target.value)}
              style={{ ...filterInputStyle, flex: "1 1 220px" }}
            />
            <select
              value={internshipStatusFilter}
              onChange={(e) => setInternshipStatusFilter(e.target.value)}
              style={filterInputStyle}
            >
              <option value='all'>All statuses</option>
              <option value='active'>Active</option>
              <option value='disabled'>Disabled</option>
            </select>
            <select
              value={internshipSort}
              onChange={(e) => setInternshipSort(e.target.value)}
              style={filterInputStyle}
            >
              <option value='newest'>Newest first</option>
              <option value='oldest'>Oldest first</option>
              <option value='deadline'>Deadline (soonest)</option>
              <option value='title'>Title (A-Z)</option>
            </select>
          </div>
          {visibleInternships.length === 0 ? (
            <p style={{ color: "#aaa" }}>
              No internships match these filters.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {visibleInternships.map((intern) => (
                <div
                  key={intern.id}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: 20,
                    border: `1px solid ${intern.status === "disabled" ? "#fca5a5" : "#eee"}`,
                    opacity: intern.status === "disabled" ? 0.7 : 1,
                  }}
                >
                  {intern.status === "disabled" && (
                    <span
                      style={{
                        fontSize: 11,
                        background: "#fee2e2",
                        color: "#a01f13",
                        padding: "2px 8px",
                        borderRadius: 20,
                        marginBottom: 8,
                        display: "inline-block",
                      }}
                    >
                      Disabled
                    </span>
                  )}
                  <h3 style={{ margin: "0 0 4px", fontSize: 15 }}>
                    {intern.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#2f6175",
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    🔬 {intern.field}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#555",
                      marginBottom: 8,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {intern.description}
                  </p>
                  <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
                    👩‍🏫 {intern.teacherName} · 📅 {intern.deadline}
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() => {
                        setEditItem({ ...intern });
                        setEditType("internships");
                      }}
                      style={btnStyle("#2f6175")}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDisable("internships", intern.id, intern.status)
                      }
                      style={btnStyle(
                        intern.status === "disabled" ? "#1f6f4a" : "#f59e0b",
                      )}
                    >
                      {intern.status === "disabled" ? "✅ Enable" : "⏸ Disable"}
                    </button>
                    <button
                      onClick={() => handleDelete("internships", intern.id)}
                      style={btnStyle("#a01f13")}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Mentors Tab ── */}
      {tab === "applications" && (
        <div>
          <p style={{ color: "#888", marginBottom: 16 }}>
            {visibleApplications.length} of {pendingApplications.length}{" "}
            pending application{pendingApplications.length === 1 ? "" : "s"}
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <input
              type='text'
              placeholder='Search name or email...'
              value={applicationSearch}
              onChange={(e) => setApplicationSearch(e.target.value)}
              style={{ ...filterInputStyle, flex: "1 1 220px" }}
            />
            <select
              value={applicationTypeFilter}
              onChange={(e) => setApplicationTypeFilter(e.target.value)}
              style={filterInputStyle}
            >
              <option value='all'>All types</option>
              <option value='phd_student'>PhD Student</option>
              <option value='phd_graduate'>PhD Graduate</option>
              <option value='faculty'>Faculty</option>
            </select>
            <select
              value={applicationSort}
              onChange={(e) => setApplicationSort(e.target.value)}
              style={filterInputStyle}
            >
              <option value='oldest'>Oldest first</option>
              <option value='newest'>Newest first</option>
              <option value='name'>Name (A-Z)</option>
            </select>
          </div>
          {visibleApplications.length === 0 ? (
            <p style={{ color: "#aaa" }}>
              {pendingApplications.length === 0
                ? "No applications waiting on review."
                : "No applications match these filters."}
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 16,
              }}
            >
              {visibleApplications.map((mentor) => (
                <div
                  key={mentor.id}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: 20,
                    border: "1px solid #eee",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    {mentor.name || "(no name)"}
                  </div>
                  <div style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>
                    {mentor.email}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      background: "#e3eff3",
                      color: "#2f6175",
                      padding: "2px 8px",
                      borderRadius: 20,
                      display: "inline-block",
                      marginBottom: 12,
                    }}
                  >
                    {mentorTypeLabel(mentor.mentorType)}
                  </span>

                  <div style={{ fontSize: 13, color: "#333", marginBottom: 14 }}>
                    {mentor.mentorType === "phd_student" && (
                      <div>
                        Transcript:{" "}
                        {mentor.transcriptURL ? (
                          <a
                            href={mentor.transcriptURL}
                            target='_blank'
                            rel='noopener noreferrer'
                            style={{ color: "#2f6175" }}
                          >
                            View file
                          </a>
                        ) : (
                          <span style={{ color: "#a01f13" }}>Not uploaded</span>
                        )}
                      </div>
                    )}
                    {mentor.mentorType === "phd_graduate" && (
                      <div>
                        Degree certificate:{" "}
                        {mentor.degreeCertificateURL ? (
                          <a
                            href={mentor.degreeCertificateURL}
                            target='_blank'
                            rel='noopener noreferrer'
                            style={{ color: "#2f6175" }}
                          >
                            View file
                          </a>
                        ) : (
                          <span style={{ color: "#a01f13" }}>Not uploaded</span>
                        )}
                      </div>
                    )}
                    {mentor.mentorType === "faculty" && (
                      <>
                        <div>
                          Work email: {mentor.workEmail || "—"}{" "}
                          {mentor.workEmailVerified ? (
                            <span style={{ color: "#14532d" }}>✓ Verified</span>
                          ) : (
                            <span style={{ color: "#a01f13" }}>Not verified</span>
                          )}
                        </div>
                        <div>
                          University profile:{" "}
                          {mentor.universityProfileURL ? (
                            <a
                              href={mentor.universityProfileURL}
                              target='_blank'
                              rel='noopener noreferrer'
                              style={{ color: "#2f6175" }}
                            >
                              View profile
                            </a>
                          ) : (
                            <span style={{ color: "#a01f13" }}>Not provided</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      style={btnStyle("#14532d")}
                      onClick={() => approveApplication(mentor.id)}
                    >
                      Approve
                    </button>
                    <button
                      style={btnStyle("#a01f13")}
                      onClick={() => openRejectModal(mentor.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Reject Application Modal ── */}
      {rejectTarget && (
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
              maxWidth: 480,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h3 style={{ margin: 0 }}>Reject Application</h3>
              <button
                onClick={() => setRejectTarget(null)}
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
            <p style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>
              Explain what needs to change before this can be approved. This
              is shown to the mentor.
            </p>
            <textarea
              autoFocus
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setRejectError("");
              }}
              rows={4}
              placeholder='e.g. "The uploaded transcript is not legible, please re-upload a clearer scan."'
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 14,
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
                marginBottom: 8,
              }}
            />
            {rejectError && (
              <p style={{ color: "#a01f13", fontSize: 13, marginBottom: 12 }}>
                {rejectError}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setRejectTarget(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "white",
                  color: "#555",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button onClick={submitRejectModal} style={btnStyle("#a01f13")}>
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "mentors" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <p style={{ color: "#888", margin: 0 }}>
              {visibleMentors.length} of {mentors.length} mentors
            </p>
            <button
              onClick={() => {
                setAddType("teachers");
                setAddForm({
                  name: "",
                  email: "",
                  bio: "",
                  degree: "",
                  university: "",
                  major: "",
                  expertise: "",
                  researchArea: "",
                  yearsOfExperience: "",
                  languages: "",
                  gender: "Female",
                  projects: [],
                });
                setImageFile(null);
                setImagePreview(null);
              }}
              style={btnStyle("#2f6175")}
            >
              + Add Mentor
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <input
              type='text'
              placeholder='Search name, university, expertise...'
              value={mentorSearch}
              onChange={(e) => setMentorSearch(e.target.value)}
              style={{ ...filterInputStyle, flex: "1 1 220px" }}
            />
            <select
              value={mentorStatusFilter}
              onChange={(e) => setMentorStatusFilter(e.target.value)}
              style={filterInputStyle}
            >
              <option value='all'>All statuses</option>
              <option value='active'>Active</option>
              <option value='disabled'>Disabled</option>
            </select>
            <select
              value={mentorVerificationFilter}
              onChange={(e) => setMentorVerificationFilter(e.target.value)}
              style={filterInputStyle}
            >
              <option value='all'>All verification</option>
              <option value='approved'>Approved</option>
              <option value='pending_review'>Pending Review</option>
              <option value='rejected'>Rejected</option>
              <option value='incomplete'>Incomplete</option>
              <option value='not_started'>Not Started</option>
            </select>
            <select
              value={mentorSort}
              onChange={(e) => setMentorSort(e.target.value)}
              style={filterInputStyle}
            >
              <option value='name'>Name (A-Z)</option>
              <option value='university'>University (A-Z)</option>
              <option value='newest'>Newest first</option>
              <option value='oldest'>Oldest first</option>
            </select>
          </div>
          {visibleMentors.length === 0 ? (
            <p style={{ color: "#aaa" }}>No mentors match these filters.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {visibleMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: 20,
                    border: `1px solid ${mentor.disabled ? "#fca5a5" : "#eee"}`,
                    opacity: mentor.disabled ? 0.7 : 1,
                  }}
                >
                  {mentor.disabled && (
                    <span
                      style={{
                        fontSize: 11,
                        background: "#fee2e2",
                        color: "#a01f13",
                        padding: "2px 8px",
                        borderRadius: 20,
                        marginBottom: 8,
                        display: "inline-block",
                      }}
                    >
                      Disabled
                    </span>
                  )}
                  {/* <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 12,
                    }}
                  > */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 12,
                      flexDirection: "column",
                      textAlign: "center",
                    }}
                  >
                    {mentor.photoURL ? (
                      <img
                        src={mentor.photoURL}
                        alt={mentor.name}
                        style={{
                          width: 96,
                          height: 96,
                          borderRadius: "50%",
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 96,
                          height: 96,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #2f6175, #427e94)",
                          color: "white",
                          fontSize: 36,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {mentor.name
                          ?.split(" ")
                          .slice(-1)[0]
                          ?.charAt(0)
                          .toUpperCase() || "T"}
                      </div>
                    )}
                    {/* {mentor.photoURL ? (
                      <img
                        src={mentor.photoURL}
                        alt={mentor.name}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #2f6175, #427e94)",
                          color: "white",
                          fontSize: 18,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {mentor.name
                          ?.split(" ")
                          .slice(-1)[0]
                          ?.charAt(0)
                          .toUpperCase() || "T"}
                      </div>
                    )} */}
                    <div>
                      <h3 style={{ margin: 0, fontSize: 15 }}>{mentor.name}</h3>
                      <p style={{ margin: 0, fontSize: 12, color: "#2f6175" }}>
                        {mentor.expertise}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                    🎓 {mentor.degree}
                  </p>
                  <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
                    🏛 {mentor.university}
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() => {
                        setEditItem({ major: "", ...mentor });
                        setEditType("teachers");
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      style={btnStyle("#2f6175")}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={async () => {
                        await updateDoc(doc(db, "teachers", mentor.id), {
                          disabled: !mentor.disabled,
                        });
                      }}
                      style={btnStyle(mentor.disabled ? "#1f6f4a" : "#f59e0b")}
                    >
                      {mentor.disabled ? "✅ Enable" : "⏸ Disable"}
                    </button>
                    <button
                      onClick={() => handleDelete("teachers", mentor.id)}
                      style={btnStyle("#a01f13")}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editItem && (
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
              maxWidth: 560,
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
              <h3 style={{ margin: 0 }}>
                ✏️ Edit{" "}
                {editType === "research"
                  ? "Research"
                  : editType === "internships"
                    ? "Internship"
                    : "Mentor"}
              </h3>
              <button
                onClick={() => {
                  setEditItem(null);
                  setEditType(null);
                  setImageFile(null);
                  setImagePreview(null);
                }}
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

            {/* Image upload for mentors */}
            {editType === "teachers" && (
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                {imagePreview || editItem.photoURL ? (
                  <img
                    src={imagePreview || editItem.photoURL}
                    alt='Mentor'
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: 10,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #2f6175, #427e94)",
                      color: "white",
                      fontSize: 32,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                    }}
                  >
                    {editItem.name
                      ?.split(" ")
                      .slice(-1)[0]
                      ?.charAt(0)
                      .toUpperCase() || "T"}
                  </div>
                )}
                <label
                  style={{
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#2f6175",
                    fontWeight: 600,
                  }}
                >
                  📷 {imagePreview ? "Change Photo" : "Upload Photo"}
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            )}

            {Object.entries(editItem)
              .filter(
                ([key]) =>
                  ![
                    "id",
                    "teacherId",
                    "createdAt",
                    "status",
                    "disabled",
                    "photoURL",
                    "applicants",
                    "enrolledCount",
                    "projects",
                  ].includes(key),
              )
              .map(([key, value]) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <label
                    style={{
                      fontSize: 12,
                      color: "#888",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  {key === "gender" ? (
                    <select
                      value={value}
                      onChange={(e) =>
                        setEditItem({ ...editItem, [key]: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                      }}
                    >
                      <option value='Female'>Female</option>
                      <option value='Male'>Male</option>
                    </select>
                  ) : key === "mode" ? (
                    <select
                      value={value}
                      onChange={(e) =>
                        setEditItem({ ...editItem, [key]: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                      }}
                    >
                      <option value='Remote'>Remote</option>
                      <option value='In-Person'>In-Person</option>
                      <option value='Hybrid'>Hybrid</option>
                    </select>
                  ) : key === "stipend" ? (
                    <select
                      value={value}
                      onChange={(e) =>
                        setEditItem({ ...editItem, [key]: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                      }}
                    >
                      <option value='Unpaid'>Unpaid</option>
                      <option value='Paid'>Paid</option>
                      <option value='Academic Credit'>Academic Credit</option>
                    </select>
                  ) : key === "degree" ? (
                    <select
                      value={value}
                      onChange={(e) =>
                        setEditItem({ ...editItem, [key]: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                      }}
                    >
                      <option value=''>Select degree</option>
                      <option value='High School Diploma'>
                        High School Diploma
                      </option>
                      <option value='Bachelor of Science (BS)'>
                        Bachelor of Science (BS)
                      </option>
                      <option value='Bachelor of Arts (BA)'>
                        Bachelor of Arts (BA)
                      </option>
                      <option value='Master of Science (MS)'>
                        Master of Science (MS)
                      </option>
                      <option value='Master of Arts (MA)'>
                        Master of Arts (MA)
                      </option>
                      <option value='Doctor of Philosophy (PhD)'>
                        Doctor of Philosophy (PhD)
                      </option>
                      <option value='Doctor of Medicine (MD)'>
                        Doctor of Medicine (MD)
                      </option>
                      <option value='Other'>Other</option>
                    </select>
                  ) : key === "deadline" ? (
                    <input
                      type='date'
                      value={value}
                      onChange={(e) =>
                        setEditItem({ ...editItem, [key]: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                      }}
                    />
                  ) : typeof value === "string" &&
                    (key === "bio" ||
                      key === "idea" ||
                      key === "impact" ||
                      key === "details" ||
                      key === "description" ||
                      key === "requirements" ||
                      key === "outcomes") ? (
                    <textarea
                      value={value || ""}
                      onChange={(e) =>
                        setEditItem({ ...editItem, [key]: e.target.value })
                      }
                      rows={key === "bio" ? 10 : 5}
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                        resize: "vertical",
                      }}
                    />
                  ) : (
                    <input
                      value={value || ""}
                      onChange={(e) =>
                        setEditItem({ ...editItem, [key]: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                </div>
              ))}

            {/* Projects for mentor editing */}
            {editType === "teachers" && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <label
                    style={{ fontSize: 12, color: "#888", fontWeight: 600 }}
                  >
                    PROJECT IDEAS
                  </label>
                  <button
                    type='button'
                    onClick={() =>
                      setEditItem({
                        ...editItem,
                        projects: [
                          ...(editItem.projects || []),
                          {
                            id: Date.now().toString(),
                            title: "",
                            description: "",
                          },
                        ],
                      })
                    }
                    style={{ ...btnStyle("#2f6175"), fontSize: 12 }}
                  >
                    + Add Project
                  </button>
                </div>
                {(editItem.projects || []).length === 0 && (
                  <p style={{ fontSize: 13, color: "#aaa" }}>
                    No projects yet.
                  </p>
                )}
                {(editItem.projects || []).map((project, index) => (
                  <div
                    key={project.id}
                    style={{
                      background: "#f9fafb",
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 8,
                      border: "1px solid #eee",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <label
                        style={{ fontSize: 12, color: "#888", fontWeight: 600 }}
                      >
                        Project {index + 1}
                      </label>
                      <button
                        type='button'
                        onClick={() =>
                          setEditItem({
                            ...editItem,
                            projects: editItem.projects.filter(
                              (_, i) => i !== index,
                            ),
                          })
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: "#a01f13",
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                    <input
                      placeholder='Project title'
                      value={project.title}
                      onChange={(e) => {
                        const updated = [...editItem.projects];
                        updated[index] = {
                          ...updated[index],
                          title: e.target.value,
                        };
                        setEditItem({ ...editItem, projects: updated });
                      }}
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                        marginBottom: 6,
                      }}
                    />
                    <textarea
                      placeholder='Project description'
                      value={project.description}
                      onChange={(e) => {
                        const updated = [...editItem.projects];
                        updated[index] = {
                          ...updated[index],
                          description: e.target.value,
                        };
                        setEditItem({ ...editItem, projects: updated });
                      }}
                      rows={5}
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                        resize: "vertical",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                onClick={handleSaveEdit}
                disabled={imageUploading}
                style={{ ...btnStyle("#1f6f4a"), flex: 1, padding: 12 }}
              >
                {imageUploading ? "Saving..." : "Save Changes ✓"}
              </button>
              <button
                onClick={() => {
                  setEditItem(null);
                  setEditType(null);
                  setImageFile(null);
                  setImagePreview(null);
                }}
                style={{ ...btnStyle("#888"), flex: 1, padding: 12 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Modal ── */}
      {addType && (
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
              maxWidth: 560,
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
              <h3 style={{ margin: 0 }}>
                ➕ Add{" "}
                {addType === "research"
                  ? "Research"
                  : addType === "internships"
                    ? "Internship"
                    : "Mentor"}
              </h3>
              <button
                onClick={() => {
                  setAddType(null);
                  setAddForm({});
                  setImageFile(null);
                  setImagePreview(null);
                }}
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

            {/* Image upload for adding mentor */}
            {addType === "teachers" && (
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt='Mentor'
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: 10,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #2f6175, #427e94)",
                      color: "white",
                      fontSize: 32,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                    }}
                  >
                    ?
                  </div>
                )}
                <label
                  style={{
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#2f6175",
                    fontWeight: 600,
                  }}
                >
                  📷 {imagePreview ? "Change Photo" : "Upload Photo"}
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            )}

            {Object.entries(addForm)
              .filter(([key]) => key !== "projects")
              .map(([key, value]) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <label
                    style={{
                      fontSize: 12,
                      color: "#888",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  {key === "gender" ? (
                    <select
                      value={value}
                      onChange={(e) =>
                        setAddForm({ ...addForm, [key]: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                      }}
                    >
                      <option value='Female'>Female</option>
                      <option value='Male'>Male</option>
                    </select>
                  ) : key === "mode" ? (
                    <select
                      value={value}
                      onChange={(e) =>
                        setAddForm({ ...addForm, [key]: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                      }}
                    >
                      <option value='Remote'>Remote</option>
                      <option value='In-Person'>In-Person</option>
                      <option value='Hybrid'>Hybrid</option>
                    </select>
                  ) : key === "stipend" ? (
                    <select
                      value={value}
                      onChange={(e) =>
                        setAddForm({ ...addForm, [key]: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                      }}
                    >
                      <option value='Unpaid'>Unpaid</option>
                      <option value='Paid'>Paid</option>
                      <option value='Academic Credit'>Academic Credit</option>
                    </select>
                  ) : key === "degree" ? (
                    <select
                      value={value}
                      onChange={(e) =>
                        setAddForm({ ...addForm, [key]: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                      }}
                    >
                      <option value=''>Select degree</option>
                      <option value='High School Diploma'>
                        High School Diploma
                      </option>
                      <option value='Bachelor of Science (BS)'>
                        Bachelor of Science (BS)
                      </option>
                      <option value='Bachelor of Arts (BA)'>
                        Bachelor of Arts (BA)
                      </option>
                      <option value='Master of Science (MS)'>
                        Master of Science (MS)
                      </option>
                      <option value='Master of Arts (MA)'>
                        Master of Arts (MA)
                      </option>
                      <option value='Doctor of Philosophy (PhD)'>
                        Doctor of Philosophy (PhD)
                      </option>
                      <option value='Doctor of Medicine (MD)'>
                        Doctor of Medicine (MD)
                      </option>
                      <option value='Other'>Other</option>
                    </select>
                  ) : key === "deadline" ? (
                    <input
                      type='date'
                      value={value}
                      onChange={(e) =>
                        setAddForm({ ...addForm, [key]: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                      }}
                    />
                  ) : typeof value === "string" &&
                    (key === "bio" ||
                      key === "idea" ||
                      key === "impact" ||
                      key === "details" ||
                      key === "description" ||
                      key === "requirements" ||
                      key === "outcomes") ? (
                    <textarea
                      value={value}
                      onChange={(e) =>
                        setAddForm({ ...addForm, [key]: e.target.value })
                      }
                      rows={key === "bio" ? 10 : 3}
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                        resize: "vertical",
                      }}
                    />
                  ) : (
                    <input
                      value={value}
                      onChange={(e) =>
                        setAddForm({ ...addForm, [key]: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                </div>
              ))}

            {/* Projects for adding mentor */}
            {addType === "teachers" && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <label
                    style={{ fontSize: 12, color: "#888", fontWeight: 600 }}
                  >
                    PROJECT IDEAS
                  </label>
                  <button
                    type='button'
                    onClick={() =>
                      setAddForm({
                        ...addForm,
                        projects: [
                          ...(addForm.projects || []),
                          {
                            id: Date.now().toString(),
                            title: "",
                            description: "",
                          },
                        ],
                      })
                    }
                    style={{ ...btnStyle("#2f6175"), fontSize: 12 }}
                  >
                    + Add Project
                  </button>
                </div>
                {(addForm.projects || []).length === 0 && (
                  <p style={{ fontSize: 13, color: "#aaa" }}>
                    No projects yet. Click + Add Project.
                  </p>
                )}
                {(addForm.projects || []).map((project, index) => (
                  <div
                    key={project.id}
                    style={{
                      background: "#f9fafb",
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 8,
                      border: "1px solid #eee",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <label
                        style={{ fontSize: 12, color: "#888", fontWeight: 600 }}
                      >
                        Project {index + 1}
                      </label>
                      <button
                        type='button'
                        onClick={() =>
                          setAddForm({
                            ...addForm,
                            projects: addForm.projects.filter(
                              (_, i) => i !== index,
                            ),
                          })
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: "#a01f13",
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                    <input
                      placeholder='Project title'
                      value={project.title}
                      onChange={(e) => {
                        const updated = [...addForm.projects];
                        updated[index] = {
                          ...updated[index],
                          title: e.target.value,
                        };
                        setAddForm({ ...addForm, projects: updated });
                      }}
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                        marginBottom: 6,
                      }}
                    />
                    <textarea
                      placeholder='Project description'
                      value={project.description}
                      onChange={(e) => {
                        const updated = [...addForm.projects];
                        updated[index] = {
                          ...updated[index],
                          description: e.target.value,
                        };
                        setAddForm({ ...addForm, projects: updated });
                      }}
                      rows={5}
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                        resize: "vertical",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                onClick={handleAdd}
                disabled={addLoading}
                style={{ ...btnStyle("#1f6f4a"), flex: 1, padding: 12 }}
              >
                {addLoading ? "Adding..." : "Add ✓"}
              </button>
              <button
                onClick={() => {
                  setAddType(null);
                  setAddForm({});
                  setImageFile(null);
                  setImagePreview(null);
                }}
                style={{ ...btnStyle("#888"), flex: 1, padding: 12 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
