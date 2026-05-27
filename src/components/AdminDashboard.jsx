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
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

const ADMIN_EMAIL = "xclassinfo@gmail.com";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("ads");

  const [ads, setAds] = useState([]);
  const [research, setResearch] = useState([]);
  const [internships, setInternships] = useState([]);
  const [mentors, setMentors] = useState([]);

  const [selectedAd, setSelectedAd] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editType, setEditType] = useState(null);
  const [adTab, setAdTab] = useState("pending");

  const [addType, setAddType] = useState(null);
  const [addForm, setAddForm] = useState({});
  const [addLoading, setAddLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u && u.email === ADMIN_EMAIL) setUser(u);
      else setUser(null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "adposts"), where("status", "==", adTab));
    const unsub = onSnapshot(q, (snap) => {
      setAds(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user, adTab]);

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
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        setError("You are not authorized as admin.");
      }
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setUser(null);
  }

  async function handleApprove(adId) {
    await updateDoc(doc(db, "adposts", adId), { status: "approved" });
  }

  async function handleReject(adId) {
    await updateDoc(doc(db, "adposts", adId), { status: "rejected" });
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
          }}
        >
          <h2 style={{ marginBottom: 4 }}>🔐 Admin Login</h2>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
            xclass admin only
          </p>
          {error && (
            <p style={{ color: "red", fontSize: 13, marginBottom: 12 }}>
              {error}
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
                background: "#4a90e2",
                color: "white",
                fontSize: 15,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {loading ? "Logging in..." : "Login →"}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
        <button onClick={handleLogout} style={btnStyle("#e74c3c")}>
          Logout
        </button>
      </div>

      {/* Main Tabs */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}
      >
        {[
          { id: "ads", label: "📌 Ads" },
          { id: "research", label: "🔬 Research" },
          { id: "internships", label: "🧪 Internships" },
          { id: "mentors", label: "👩‍🏫 Mentors" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 20px",
              borderRadius: 20,
              border: "none",
              background: tab === t.id ? "#4a90e2" : "#e0e0e0",
              color: tab === t.id ? "white" : "#555",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Ads Tab ── */}
      {tab === "ads" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {["pending", "approved", "rejected"].map((t) => (
              <button
                key={t}
                onClick={() => setAdTab(t)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 20,
                  border: "none",
                  background: adTab === t ? "#4a90e2" : "#e0e0e0",
                  color: adTab === t ? "white" : "#555",
                  cursor: "pointer",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {t === "pending" ? "⏳" : t === "approved" ? "✅" : "❌"} {t}
              </button>
            ))}
          </div>
          {ads.length === 0 ? (
            <p style={{ color: "#aaa" }}>No {adTab} ads.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: 20,
                    border: "1px solid #eee",
                  }}
                >
                  {ad.image && (
                    <img
                      src={ad.image}
                      alt={ad.title}
                      style={{
                        width: "100%",
                        height: 160,
                        objectFit: "cover",
                        borderRadius: 8,
                        marginBottom: 12,
                      }}
                    />
                  )}
                  <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>
                    {ad.title}
                  </h3>
                  {ad.message && (
                    <p style={{ color: "#555", fontSize: 13, marginBottom: 8 }}>
                      {ad.message}
                    </p>
                  )}
                  <div
                    style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}
                  >
                    👤 {ad.name} · {ad.email}
                  </div>
                  <button
                    onClick={() => setSelectedAd(ad)}
                    style={{
                      ...btnStyle("#555"),
                      width: "100%",
                      marginBottom: 8,
                    }}
                  >
                    👁 View Details
                  </button>
                  <div style={{ display: "flex", gap: 8 }}>
                    {adTab === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(ad.id)}
                          style={{ ...btnStyle("#27ae60"), flex: 1 }}
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleReject(ad.id)}
                          style={{ ...btnStyle("#e74c3c"), flex: 1 }}
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                    {adTab === "approved" && (
                      <button
                        onClick={() => handleReject(ad.id)}
                        style={{ ...btnStyle("#e74c3c"), width: "100%" }}
                      >
                        ❌ Remove
                      </button>
                    )}
                    {adTab === "rejected" && (
                      <button
                        onClick={() => handleApprove(ad.id)}
                        style={{ ...btnStyle("#27ae60"), width: "100%" }}
                      >
                        ✅ Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
              {research.length} research entries
            </p>
            <button
              onClick={() => {
                setAddType("research");
                setAddForm({ title: "", idea: "", impact: "", details: "" });
              }}
              style={btnStyle("#4a90e2")}
            >
              + Add Research
            </button>
          </div>
          {research.length === 0 ? (
            <p style={{ color: "#aaa" }}>No research yet.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {research.map((r) => (
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
                        color: "#e74c3c",
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
                      style={btnStyle("#4a90e2")}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDisable("research", r.id, r.status)}
                      style={btnStyle(
                        r.status === "disabled" ? "#27ae60" : "#f59e0b",
                      )}
                    >
                      {r.status === "disabled" ? "✅ Enable" : "⏸ Disable"}
                    </button>
                    <button
                      onClick={() => handleDelete("research", r.id)}
                      style={btnStyle("#e74c3c")}
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
              {internships.length} internships
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
              style={btnStyle("#4a90e2")}
            >
              + Add Internship
            </button>
          </div>
          {internships.length === 0 ? (
            <p style={{ color: "#aaa" }}>No internships yet.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {internships.map((intern) => (
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
                        color: "#e74c3c",
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
                      color: "#4a90e2",
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
                      style={btnStyle("#4a90e2")}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDisable("internships", intern.id, intern.status)
                      }
                      style={btnStyle(
                        intern.status === "disabled" ? "#27ae60" : "#f59e0b",
                      )}
                    >
                      {intern.status === "disabled" ? "✅ Enable" : "⏸ Disable"}
                    </button>
                    <button
                      onClick={() => handleDelete("internships", intern.id)}
                      style={btnStyle("#e74c3c")}
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
            <p style={{ color: "#888", margin: 0 }}>{mentors.length} mentors</p>
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
              style={btnStyle("#4a90e2")}
            >
              + Add Mentor
            </button>
          </div>
          {mentors.length === 0 ? (
            <p style={{ color: "#aaa" }}>No mentors yet.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {mentors.map((mentor) => (
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
                        color: "#e74c3c",
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
                            "linear-gradient(135deg, #667eea, #764ba2)",
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
                            "linear-gradient(135deg, #667eea, #764ba2)",
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
                      <p style={{ margin: 0, fontSize: 12, color: "#4a90e2" }}>
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
                      style={btnStyle("#4a90e2")}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={async () => {
                        await updateDoc(doc(db, "teachers", mentor.id), {
                          disabled: !mentor.disabled,
                        });
                      }}
                      style={btnStyle(mentor.disabled ? "#27ae60" : "#f59e0b")}
                    >
                      {mentor.disabled ? "✅ Enable" : "⏸ Disable"}
                    </button>
                    <button
                      onClick={() => handleDelete("teachers", mentor.id)}
                      style={btnStyle("#e74c3c")}
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

      {/* ── Ad Detail Modal ── */}
      {selectedAd && (
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
              <h3 style={{ margin: 0 }}>📋 Ad Details</h3>
              <button
                onClick={() => setSelectedAd(null)}
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
            {selectedAd.image && (
              <img
                src={selectedAd.image}
                alt={selectedAd.title}
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                  borderRadius: 10,
                  marginBottom: 16,
                }}
              />
            )}
            <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>
              {selectedAd.title}
            </h2>
            {selectedAd.message && (
              <p
                style={{
                  fontSize: 14,
                  color: "#555",
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                {selectedAd.message}
              </p>
            )}
            {selectedAd.url && (
              <a
                href={selectedAd.url}
                target='_blank'
                rel='noreferrer'
                style={{
                  fontSize: 14,
                  color: "#4a90e2",
                  display: "block",
                  marginBottom: 16,
                }}
              >
                🔗 {selectedAd.url}
              </a>
            )}
            <div
              style={{
                borderTop: "1px solid #f0f0f0",
                paddingTop: 16,
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 13, color: "#555", margin: "0 0 4px" }}>
                👤 {selectedAd.name}
              </p>
              <p style={{ fontSize: 13, color: "#555", margin: "0 0 4px" }}>
                📧 {selectedAd.email}
              </p>
              {selectedAd.phone && (
                <p style={{ fontSize: 13, color: "#555", margin: "0 0 4px" }}>
                  📞 {selectedAd.phone}
                </p>
              )}
              {(selectedAd.city || selectedAd.state) && (
                <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
                  📍{" "}
                  {[selectedAd.city, selectedAd.state]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
            {selectedAd.status === "pending" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    handleApprove(selectedAd.id);
                    setSelectedAd(null);
                  }}
                  style={{ ...btnStyle("#27ae60"), flex: 1, padding: 12 }}
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedAd.id);
                    setSelectedAd(null);
                  }}
                  style={{ ...btnStyle("#e74c3c"), flex: 1, padding: 12 }}
                >
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
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
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
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
                    color: "#4a90e2",
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
                      rows={3}
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
                    style={{ ...btnStyle("#4a90e2"), fontSize: 12 }}
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
                          color: "#e74c3c",
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
                      rows={2}
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
                style={{ ...btnStyle("#27ae60"), flex: 1, padding: 12 }}
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
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
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
                    color: "#4a90e2",
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
                      rows={3}
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
                    style={{ ...btnStyle("#4a90e2"), fontSize: 12 }}
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
                          color: "#e74c3c",
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
                      rows={2}
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
                style={{ ...btnStyle("#27ae60"), flex: 1, padding: 12 }}
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
