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

    // Fetch available slots
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

  // if (loading) {
  //   return (
  //     <section id='tutors' className={styles.section}>
  //       <p className={styles.loading}>Loading tutors...</p>
  //     </section>
  //   );
  // }

  // Replace your loading state:
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
              <div key={teacher.id} className={styles.card}>
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
                <p className={styles.bio}>{teacher.bio}</p>

                <div className={styles.rating}>
                  <span className={styles.stars}>
                    {"★".repeat(Math.round(teacher.rating || 0))}
                    {"☆".repeat(5 - Math.round(teacher.rating || 0))}
                  </span>
                  <span className={styles.ratingNum}>
                    {teacher.rating ? teacher.rating.toFixed(1) : "New"}
                  </span>
                </div>

                <button
                  className={styles.bookBtn}
                  onClick={() => openBooking(teacher)}
                >
                  📅 Book a Session
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
                        {slot.duration} min)
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
