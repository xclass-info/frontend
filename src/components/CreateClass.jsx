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
    date: "",
    time: "",
    maxSeats: "",
    subject: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function validate() {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Required";
    if (!form.description.trim()) newErrors.description = "Required";
    if (!form.date) newErrors.date = "Required";
    if (!form.time) newErrors.time = "Required";
    if (!form.maxSeats) newErrors.maxSeats = "Required";
    else if (isNaN(form.maxSeats) || Number(form.maxSeats) < 1)
      newErrors.maxSeats = "Must be at least 1";
    if (!form.subject) newErrors.subject = "Required";
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
      const docRef = await addDoc(collection(db, "classes"), {
        title: form.title,
        description: form.description,
        date: form.date,
        time: form.time,
        maxSeats: Number(form.maxSeats),
        subject: form.subject,
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

          {/* Subject */}
          <div className={styles.field}>
            <label className={styles.label}>Subject</label>
            <select
              className={`${styles.input} ${errors.subject ? styles.inputError : ""}`}
              name='subject'
              value={form.subject}
              onChange={handleChange}
            >
              <option value=''>Select subject</option>
              <option value='Python'>Python</option>
              <option value='AI & Machine Learning'>
                AI & Machine Learning
              </option>
              <option value='Web Development'>Web Development</option>
              <option value='Self-Driving Cars'>Self-Driving Cars</option>
              <option value='AP Computer Science'>AP Computer Science</option>
              <option value='Other'>Other</option>
            </select>
            {errors.subject && (
              <p className={styles.errorMsg}>{errors.subject}</p>
            )}
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

          {/* Date & Time */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Date</label>
              <input
                className={`${styles.input} ${errors.date ? styles.inputError : ""}`}
                name='date'
                type='date'
                value={form.date}
                onChange={handleChange}
              />
              {errors.date && <p className={styles.errorMsg}>{errors.date}</p>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Time</label>
              <input
                className={`${styles.input} ${errors.time ? styles.inputError : ""}`}
                name='time'
                type='time'
                value={form.time}
                onChange={handleChange}
              />
              {errors.time && <p className={styles.errorMsg}>{errors.time}</p>}
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

          <button className={styles.btn} type='submit' disabled={loading}>
            {loading ? "Creating..." : "Create Class 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
