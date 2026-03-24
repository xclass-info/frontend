import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import styles from "./ClassListing.module.css";

export default function ClassListing() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [booked, setBooked] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "classes"), where("status", "==", "active"));
    const unsub = onSnapshot(q, (snapshot) => {
      setClasses(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Required";
    if (!form.email.trim()) newErrors.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email";
    return newErrors;
  }

  async function handleBook(cls) {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      // Add booking to Firestore
      await addDoc(collection(db, "bookings"), {
        classId: cls.id,
        classTitle: cls.title,
        studentName: form.name,
        studentEmail: form.email,
        date: cls.date,
        time: cls.time,
        bookedAt: new Date(),
      });

      // Update enrolled count
      const classRef = doc(db, "classes", cls.id);
      await updateDoc(classRef, {
        enrolledCount: (cls.enrolledCount || 0) + 1,
      });

      setBooked({ ...booked, [cls.id]: true });
      setBookingId(null);
      setForm({ name: "", email: "" });
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <p>Loading classes...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>📚 Available Classes</h1>
          <p className={styles.sub}>
            Browse and book a seat in one of our live online classes
          </p>
        </div>

        {/* Empty state */}
        {classes.length === 0 ? (
          <div className={styles.empty}>
            <p>😴 No classes available right now. Check back soon!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {classes.map((cls) => {
              const isFull = (cls.enrolledCount || 0) >= cls.maxSeats;
              const isBooked = booked[cls.id];
              const isBooking = bookingId === cls.id;

              return (
                <div key={cls.id} className={styles.card}>
                  {/* Card header */}
                  <div className={styles.cardTop}>
                    <span className={styles.subject}>{cls.subject}</span>
                    <span
                      className={`${styles.seats} ${isFull ? styles.full : ""}`}
                    >
                      {isFull
                        ? "Full"
                        : `${cls.maxSeats - (cls.enrolledCount || 0)} seats left`}
                    </span>
                  </div>

                  <h2 className={styles.cardTitle}>{cls.title}</h2>
                  <p className={styles.cardDesc}>{cls.description}</p>

                  <div className={styles.meta}>
                    <span>📅 {cls.date}</span>
                    <span>⏰ {cls.time}</span>
                    <span>
                      👥 {cls.enrolledCount || 0} / {cls.maxSeats} enrolled
                    </span>
                  </div>

                  {/* Booking form */}
                  {isBooking && !isBooked && (
                    <div className={styles.bookingForm}>
                      <div className={styles.field}>
                        <input
                          className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                          name='name'
                          value={form.name}
                          onChange={handleChange}
                          placeholder='Your full name'
                        />
                        {errors.name && (
                          <p className={styles.errorMsg}>{errors.name}</p>
                        )}
                      </div>
                      <div className={styles.field}>
                        <input
                          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                          name='email'
                          type='email'
                          value={form.email}
                          onChange={handleChange}
                          placeholder='Your email'
                        />
                        {errors.email && (
                          <p className={styles.errorMsg}>{errors.email}</p>
                        )}
                      </div>
                      <div className={styles.bookingBtns}>
                        <button
                          className={styles.confirmBtn}
                          onClick={() => handleBook(cls)}
                          disabled={submitting}
                        >
                          {submitting ? "Booking..." : "Confirm Booking ✓"}
                        </button>
                        <button
                          className={styles.cancelBtn}
                          onClick={() => {
                            setBookingId(null);
                            setForm({ name: "", email: "" });
                            setErrors({});
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action button */}
                  {isBooked ? (
                    <div className={styles.bookedBadge}>✅ You're booked!</div>
                  ) : isFull ? (
                    <div className={styles.fullBadge}>😔 Class is full</div>
                  ) : !isBooking ? (
                    <button
                      className={styles.bookBtn}
                      onClick={() => setBookingId(cls.id)}
                    >
                      Reserve a Seat →
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
