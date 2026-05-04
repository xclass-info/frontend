// src/components/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

const ADMIN_EMAIL = "xclassinfo@gmail.com";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("pending");
  const [selectedAd, setSelectedAd] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u && u.email === ADMIN_EMAIL) {
        setUser(u);
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "adposts"), where("status", "==", tab));
    const unsub = onSnapshot(q, (snap) => {
      setAds(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user, tab]);

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

  async function handleApprove(adId) {
    await updateDoc(doc(db, "adposts", adId), { status: "approved" });
  }

  async function handleReject(adId) {
    await updateDoc(doc(db, "adposts", adId), { status: "rejected" });
  }

  async function handleLogout() {
    await signOut(auth);
    setUser(null);
  }

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
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: "none",
            background: "#e74c3c",
            color: "white",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["pending", "approved", "rejected"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 20px",
              borderRadius: 20,
              border: "none",
              background: tab === t ? "#4a90e2" : "#e0e0e0",
              color: tab === t ? "white" : "#555",
              cursor: "pointer",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {t === "pending" ? "⏳" : t === "approved" ? "✅" : "❌"} {t}
          </button>
        ))}
      </div>

      {/* Ads list */}
      {ads.length === 0 ? (
        <p style={{ color: "#aaa" }}>No {tab} ads.</p>
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
              {/* Image */}
              {ad.image && (
                <img
                  src={ad.image}
                  alt={ad.title}
                  style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                />
              )}

              {/* Title & Subject */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <h3 style={{ margin: 0, fontSize: 16 }}>{ad.title}</h3>
                {ad.subject && (
                  <span
                    style={{
                      fontSize: 12,
                      background: "#eff6ff",
                      color: "#3b82f6",
                      padding: "2px 10px",
                      borderRadius: 20,
                    }}
                  >
                    {ad.subject}
                  </span>
                )}
              </div>

              {/* Class type */}
              {ad.classType && (
                <span
                  style={{
                    fontSize: 12,
                    background: "#f0fdf4",
                    color: "#16a34a",
                    padding: "2px 10px",
                    borderRadius: 20,
                    marginBottom: 8,
                    display: "inline-block",
                  }}
                >
                  {ad.classType}
                </span>
              )}

              {/* Message */}
              {ad.message && (
                <p
                  style={{
                    color: "#555",
                    fontSize: 14,
                    marginBottom: 10,
                    lineHeight: 1.5,
                  }}
                >
                  {ad.message}
                </p>
              )}

              {/* URL */}
              {ad.url && (
                <a
                  href={ad.url}
                  target='_blank'
                  rel='noreferrer'
                  style={{
                    fontSize: 13,
                    color: "#4a90e2",
                    display: "block",
                    marginBottom: 10,
                    wordBreak: "break-all",
                  }}
                >
                  {ad.url}
                </a>
              )}

              {/* Contact info */}
              <div
                style={{
                  borderTop: "1px solid #f0f0f0",
                  marginBottom: 10,
                  paddingTop: 10,
                }}
              >
                <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>
                  👤 <strong>{ad.name}</strong>
                </div>
                <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>
                  📧 {ad.email}
                </div>
                {ad.phone && (
                  <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>
                    📞 {ad.phone}
                  </div>
                )}
                {(ad.state || ad.city) && (
                  <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>
                    📍 {[ad.city, ad.state].filter(Boolean).join(", ")}
                  </div>
                )}
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 6 }}>
                  🕐{" "}
                  {ad.createdAt?.toDate?.().toLocaleDateString() ||
                    "Unknown date"}
                </div>
              </div>

              {/* View details button */}
              <button
                onClick={() => setSelectedAd(ad)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  marginBottom: 8,
                  fontSize: 14,
                  color: "#555",
                }}
              >
                👁 View Full Details
              </button>

              {/* Action buttons */}
              {tab === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleApprove(ad.id)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: 8,
                      border: "none",
                      background: "#27ae60",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleReject(ad.id)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: 8,
                      border: "none",
                      background: "#e74c3c",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    ❌ Reject
                  </button>
                </div>
              )}
              {tab === "approved" && (
                <button
                  onClick={() => handleReject(ad.id)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: 8,
                    border: "none",
                    background: "#e74c3c",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  ❌ Remove
                </button>
              )}
              {tab === "rejected" && (
                <button
                  onClick={() => handleApprove(ad.id)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: 8,
                    border: "none",
                    background: "#27ae60",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  ✅ Approve
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Detail Modal ── */}
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
            {/* Header */}
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

            {/* Image */}
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

            {/* Title & badges */}
            <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>
              {selectedAd.title}
            </h2>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              {selectedAd.subject && (
                <span
                  style={{
                    fontSize: 12,
                    background: "#eff6ff",
                    color: "#3b82f6",
                    padding: "4px 12px",
                    borderRadius: 20,
                  }}
                >
                  📚 {selectedAd.subject}
                </span>
              )}
              {selectedAd.classType && (
                <span
                  style={{
                    fontSize: 12,
                    background: "#f0fdf4",
                    color: "#16a34a",
                    padding: "4px 12px",
                    borderRadius: 20,
                  }}
                >
                  🏫 {selectedAd.classType}
                </span>
              )}
              <span
                style={{
                  fontSize: 12,
                  background: "#fffbeb",
                  color: "#d97706",
                  padding: "4px 12px",
                  borderRadius: 20,
                }}
              >
                ⏳ {selectedAd.status}
              </span>
            </div>

            {/* Message */}
            {selectedAd.message && (
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: 8,
                  padding: 14,
                  marginBottom: 16,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "#555",
                    lineHeight: 1.6,
                  }}
                >
                  {selectedAd.message}
                </p>
              </div>
            )}

            {/* URL */}
            {selectedAd.url && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 4px" }}>
                  Link
                </p>
                <a
                  href={selectedAd.url}
                  target='_blank'
                  rel='noreferrer'
                  style={{
                    fontSize: 14,
                    color: "#4a90e2",
                    wordBreak: "break-all",
                  }}
                >
                  🔗 {selectedAd.url}
                </a>
              </div>
            )}

            {/* Contact info */}
            <div
              style={{
                borderTop: "1px solid #f0f0f0",
                paddingTop: 16,
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 10px" }}>
                Contact Information
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 2px" }}>
                    Name
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#333",
                      margin: 0,
                      fontWeight: 600,
                    }}
                  >
                    {selectedAd.name}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 2px" }}>
                    Email
                  </p>
                  <p style={{ fontSize: 14, color: "#333", margin: 0 }}>
                    {selectedAd.email}
                  </p>
                </div>
                {selectedAd.phone && (
                  <div>
                    <p
                      style={{ fontSize: 12, color: "#aaa", margin: "0 0 2px" }}
                    >
                      Phone
                    </p>
                    <p style={{ fontSize: 14, color: "#333", margin: 0 }}>
                      {selectedAd.phone}
                    </p>
                  </div>
                )}
                {(selectedAd.city || selectedAd.state) && (
                  <div>
                    <p
                      style={{ fontSize: 12, color: "#aaa", margin: "0 0 2px" }}
                    >
                      Location
                    </p>
                    <p style={{ fontSize: 14, color: "#333", margin: 0 }}>
                      {[selectedAd.city, selectedAd.state]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Date */}
            <p style={{ fontSize: 12, color: "#aaa", marginBottom: 20 }}>
              🕐 Submitted:{" "}
              {selectedAd.createdAt?.toDate?.().toLocaleString() || "Unknown"}
            </p>

            {/* Action buttons */}
            {selectedAd.status === "pending" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    handleApprove(selectedAd.id);
                    setSelectedAd(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 8,
                    border: "none",
                    background: "#27ae60",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedAd.id);
                    setSelectedAd(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 8,
                    border: "none",
                    background: "#e74c3c",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  ❌ Reject
                </button>
              </div>
            )}
            {selectedAd.status === "approved" && (
              <button
                onClick={() => {
                  handleReject(selectedAd.id);
                  setSelectedAd(null);
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 8,
                  border: "none",
                  background: "#e74c3c",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ❌ Remove
              </button>
            )}
            {selectedAd.status === "rejected" && (
              <button
                onClick={() => {
                  handleApprove(selectedAd.id);
                  setSelectedAd(null);
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 8,
                  border: "none",
                  background: "#27ae60",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ✅ Approve
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
