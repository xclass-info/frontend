import { useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import styles from "./TeacherAuth.module.css";

export default function CreateClass() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    dates: [],
    startTime: "",
    endTime: "",
    maxSeats: "",
    price: "", // ← added
  });
  const [newDate, setNewDate] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function addDate() {
    if (!newDate) return;
    if (form.dates.includes(newDate)) {
      setNewDate("");
      return;
    }
    setForm({ ...form, dates: [...form.dates, newDate].sort() });
    setErrors({ ...errors, dates: "" });
    setNewDate("");
  }

  function removeDate(d) {
    setForm({ ...form, dates: form.dates.filter((date) => date !== d) });
  }

  function validate() {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Required";
    if (!form.description.trim()) newErrors.description = "Required";
    if (form.dates.length === 0) newErrors.dates = "Add at least one date";
    if (!form.startTime) newErrors.startTime = "Required";
    if (!form.endTime) newErrors.endTime = "Required";
    else if (form.startTime && form.endTime <= form.startTime)
      newErrors.endTime = "Must be after start time";
    if (!form.maxSeats) newErrors.maxSeats = "Required";
    else if (isNaN(form.maxSeats) || Number(form.maxSeats) < 1)
      newErrors.maxSeats = "Must be at least 1";
    if (form.price === "") newErrors.price = "Required";
    else if (isNaN(form.price) || Number(form.price) < 0)
      newErrors.price = "Must be a valid price";
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, "classes"), {
        title: form.title,
        description: form.description,
        dates: form.dates,
        startTime: form.startTime,
        endTime: form.endTime,
        maxSeats: Number(form.maxSeats),
        price: Number(form.price), // ← added
        teacherId: user.uid,
        enrolledCount: 0,
        status: "active",
        createdAt: new Date(),
      });
      navigate("/teacher/dashboard");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to='/teacher/dashboard' className={styles.back}>
          ← Back to Dashboard
        </Link>
        <h1 className={styles.title}>📚 Create a Class</h1>
        <p className={styles.sub}>Fill in the details for your new class</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Title */}
          <div className={styles.field}>
            <label className={styles.label}>Class Title</label>
            <input
              className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
              name='title'
              value={form.title}
              onChange={handleChange}
              placeholder='e.g. Introduction to Python'
            />
            {errors.title && <p className={styles.errorMsg}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={`${styles.input} ${styles.textarea} ${errors.description ? styles.inputError : ""}`}
              name='description'
              value={form.description}
              onChange={handleChange}
              placeholder='What will students learn in this class?'
              rows={3}
            />
            {errors.description && (
              <p className={styles.errorMsg}>{errors.description}</p>
            )}
          </div>

          {/* Dates */}
          <div className={styles.field}>
            <label className={styles.label}>Dates</label>
            {form.dates.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                {form.dates.map((d) => (
                  <span
                    key={d}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 10px",
                      borderRadius: 20,
                      background: "#f0f4ff",
                      color: "#00274c",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    📅 {d}
                    <button
                      type='button'
                      onClick={() => removeDate(d)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#e74c3c",
                        cursor: "pointer",
                        fontSize: 14,
                        lineHeight: 1,
                        padding: 0,
                      }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className={`${styles.input} ${errors.dates ? styles.inputError : ""}`}
                type='date'
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
              <button
                type='button'
                onClick={addDate}
                style={{
                  padding: "0 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#00274c",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                + Add Date
              </button>
            </div>
            {errors.dates && <p className={styles.errorMsg}>{errors.dates}</p>}
          </div>

          {/* Start & End Time */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Start Time</label>
              <input
                className={`${styles.input} ${errors.startTime ? styles.inputError : ""}`}
                name='startTime'
                type='time'
                value={form.startTime}
                onChange={handleChange}
              />
              {errors.startTime && (
                <p className={styles.errorMsg}>{errors.startTime}</p>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>End Time</label>
              <input
                className={`${styles.input} ${errors.endTime ? styles.inputError : ""}`}
                name='endTime'
                type='time'
                value={form.endTime}
                onChange={handleChange}
              />
              {errors.endTime && (
                <p className={styles.errorMsg}>{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Max Seats */}
          <div className={styles.field}>
            <label className={styles.label}>Max Seats</label>
            <input
              className={`${styles.input} ${errors.maxSeats ? styles.inputError : ""}`}
              name='maxSeats'
              type='number'
              min='1'
              max='50'
              value={form.maxSeats}
              onChange={handleChange}
              placeholder='e.g. 10'
            />
            {errors.maxSeats && (
              <p className={styles.errorMsg}>{errors.maxSeats}</p>
            )}
          </div>

          {/* Price ← added */}
          <div className={styles.field}>
            <label className={styles.label}>Price (USD)</label>
            <input
              className={`${styles.input} ${errors.price ? styles.inputError : ""}`}
              name='price'
              type='number'
              min='0'
              step='0.01'
              value={form.price}
              onChange={handleChange}
              placeholder='e.g. 25.00 (enter 0 for free)'
            />
            {errors.price && <p className={styles.errorMsg}>{errors.price}</p>}
          </div>

          <button className={styles.btn} type='submit' disabled={loading}>
            {loading ? "Creating..." : "Create Class 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
