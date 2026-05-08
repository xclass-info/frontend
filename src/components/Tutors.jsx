// src/components/Tutors.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, addDoc, getDocs } from "firebase/firestore";
import styles from "./Tutors.module.css";
import { SkeletonCard } from "./Skeleton";

export default function Tutors() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const [profileTeacher, setProfileTeacher] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "teachers"), (snapshot) => {
      setTeachers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function openBooking(teacher) {
    setSelectedTeacher(teacher);
    setSelectedSlot(null);
    setBooked(false);
    setForm({ name: "", email: "" });

    const snap = await getDocs(
      collection(db, "teachers", teacher.id, "availability"),
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
        teacherId: selectedTeacher.id,
        teacherName: selectedTeacher.name,
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
      <section id='tutors' className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <h2 className={styles.title}>👩‍🏫 Meet Our Tutors</h2>
            <p className={styles.sub}>
              Expert tutors ready to help you learn anything.
            </p>
          </div>
          <div className={styles.grid}>
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id='tutors' className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>👩‍🏫 Meet Our Tutors</h2>
          <p className={styles.sub}>
            Expert tutors ready to help you learn anything, at any level.
          </p>
        </div>

        {teachers.length === 0 ? (
          <div className={styles.empty}>
            <p>😴 No tutors registered yet. Check back soon!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className={styles.card}
                onClick={() => setProfileTeacher(teacher)}
                style={{ cursor: "pointer" }}
              >
                {/* Avatar */}
                <div className={styles.avatarWrapper}>
                  {teacher.photoURL ? (
                    <img
                      src={teacher.photoURL}
                      alt={teacher.name}
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarFallback}>
                      {teacher.name?.charAt(0).toUpperCase() || "T"}
                    </div>
                  )}
                </div>

                <h3 className={styles.name}>{teacher.name}</h3>

                {/* Gender + Degree badges */}
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  {teacher.gender && (
                    <span
                      style={{
                        fontSize: 11,
                        background: "#f0f4ff",
                        color: "#4a90e2",
                        padding: "2px 10px",
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
                        fontSize: 11,
                        background: "#f0fdf4",
                        color: "#16a34a",
                        padding: "2px 10px",
                        borderRadius: 20,
                        fontWeight: 600,
                      }}
                    >
                      🎓 {teacher.degree}
                    </span>
                  )}
                </div>

                {teacher.expertise && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "#555",
                      marginBottom: 6,
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    💡 {teacher.expertise}
                  </p>
                )}

                {teacher.bio && <p className={styles.bio}>{teacher.bio}</p>}

                <div className={styles.rating}>
                  <span className={styles.stars}>
                    {"★".repeat(Math.round(teacher.rating || 0))}
                    {"☆".repeat(5 - Math.round(teacher.rating || 0))}
                  </span>
                  <span className={styles.ratingNum}>
                    {teacher.rating ? teacher.rating.toFixed(1) : "New"}
                  </span>
                </div>

                <p style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>
                  Click to view full profile
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Teacher Profile Modal ── */}
      {profileTeacher && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 32,
              width: "100%",
              maxWidth: 520,
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
                marginBottom: 24,
              }}
            >
              <h3 style={{ margin: 0 }}>👤 Teacher Profile</h3>
              <button
                onClick={() => setProfileTeacher(null)}
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

            {/* Avatar + Name */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              {profileTeacher.photoURL ? (
                <img
                  src={profileTeacher.photoURL}
                  alt={profileTeacher.name}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: 12,
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
                    margin: "0 auto 12px",
                  }}
                >
                  {profileTeacher.name?.charAt(0).toUpperCase() || "T"}
                </div>
              )}
              <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>
                {profileTeacher.name}
              </h2>

              {/* Badges */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {profileTeacher.gender && (
                  <span
                    style={{
                      fontSize: 12,
                      background: "#f0f4ff",
                      color: "#4a90e2",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontWeight: 600,
                    }}
                  >
                    {profileTeacher.gender === "Male" ? "👨" : "👩"}{" "}
                    {profileTeacher.gender}
                  </span>
                )}
                {profileTeacher.degree && (
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
                    🎓 {profileTeacher.degree}
                  </span>
                )}
                {profileTeacher.rating > 0 && (
                  <span
                    style={{
                      fontSize: 12,
                      background: "#fffbeb",
                      color: "#d97706",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontWeight: 600,
                    }}
                  >
                    ⭐ {profileTeacher.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Info rows */}
            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 16 }}>
              {profileTeacher.university && (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 18 }}>🏛</span>
                  <div>
                    <p
                      style={{ fontSize: 12, color: "#aaa", margin: "0 0 2px" }}
                    >
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
                      {profileTeacher.university}
                    </p>
                  </div>
                </div>
              )}

              {profileTeacher.expertise && (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 18 }}>💡</span>
                  <div>
                    <p
                      style={{ fontSize: 12, color: "#aaa", margin: "0 0 2px" }}
                    >
                      Area of Expertise
                    </p>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#333",
                        margin: 0,
                        fontWeight: 600,
                      }}
                    >
                      {profileTeacher.expertise}
                    </p>
                  </div>
                </div>
              )}

              {profileTeacher.researchArea && (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 18 }}>🔬</span>
                  <div>
                    <p
                      style={{ fontSize: 12, color: "#aaa", margin: "0 0 2px" }}
                    >
                      Research Area
                    </p>
                    <p style={{ fontSize: 14, color: "#333", margin: 0 }}>
                      {profileTeacher.researchArea}
                    </p>
                  </div>
                </div>
              )}

              {profileTeacher.yearsOfExperience && (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 18 }}>📆</span>
                  <div>
                    <p
                      style={{ fontSize: 12, color: "#aaa", margin: "0 0 2px" }}
                    >
                      Teaching Experience
                    </p>
                    <p style={{ fontSize: 14, color: "#333", margin: 0 }}>
                      {profileTeacher.yearsOfExperience}{" "}
                      {Number(profileTeacher.yearsOfExperience) === 1
                        ? "year"
                        : "years"}
                    </p>
                  </div>
                </div>
              )}

              {profileTeacher.languages && (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 18 }}>🌍</span>
                  <div>
                    <p
                      style={{ fontSize: 12, color: "#aaa", margin: "0 0 2px" }}
                    >
                      Languages Spoken
                    </p>
                    <p style={{ fontSize: 14, color: "#333", margin: 0 }}>
                      {profileTeacher.languages}
                    </p>
                  </div>
                </div>
              )}

              {profileTeacher.website && (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 18 }}>🔗</span>
                  <div>
                    <p
                      style={{ fontSize: 12, color: "#aaa", margin: "0 0 2px" }}
                    >
                      Website / LinkedIn
                    </p>
                    <a
                      href={profileTeacher.website}
                      target='_blank'
                      rel='noreferrer'
                      style={{ fontSize: 14, color: "#4a90e2" }}
                    >
                      {profileTeacher.website}
                    </a>
                  </div>
                </div>
              )}

              {profileTeacher.bio && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    background: "#f9fafb",
                    borderRadius: 8,
                  }}
                >
                  <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 8px" }}>
                    About
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#555",
                      margin: 0,
                      lineHeight: 1.7,
                    }}
                  >
                    {profileTeacher.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Book button */}
            <button
              onClick={() => {
                setProfileTeacher(null);
                openBooking(profileTeacher);
              }}
              style={{
                width: "100%",
                marginTop: 24,
                padding: "14px",
                borderRadius: 10,
                border: "none",
                background: "#4a90e2",
                color: "white",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              📅 Book a Session with {profileTeacher.name}
            </button>
          </div>
        </div>
      )}

      {/* ── Booking Modal ── */}
      {selectedTeacher && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
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
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {booked ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <p style={{ fontSize: 48 }}>✅</p>
                <h3>Booking Request Sent!</h3>
                <p style={{ color: "#888", marginBottom: 20 }}>
                  {selectedTeacher.name} will confirm your session soon.
                </p>
                <button
                  onClick={() => setSelectedTeacher(null)}
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
                  <h3 style={{ margin: 0 }}>
                    Book a session with {selectedTeacher.name}
                  </h3>
                  <button
                    onClick={() => setSelectedTeacher(null)}
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

                {/* Time slots */}
                <h4 style={{ marginBottom: 8 }}>Available Slots</h4>
                {slots.length === 0 ? (
                  <p style={{ color: "#888", fontSize: 14, marginBottom: 16 }}>
                    No available slots at the moment.
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
                          border: `2px solid ${selectedSlot?.id === slot.id ? "#4a90e2" : "#eee"}`,
                          background:
                            selectedSlot?.id === slot.id ? "#eff6ff" : "white",
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        📅 {slot.date} &nbsp; ⏰ {slot.time} &nbsp; (
                        {slot.duration} min) &nbsp;
                        {slot.price > 0 ? `💰 $${slot.price}` : "🆓 Free"}
                      </div>
                    ))}
                  </div>
                )}

                {/* Student info */}
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
                    background: "#4a90e2",
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
    </section>
  );
}
