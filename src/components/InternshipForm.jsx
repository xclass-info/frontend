// src/components/InternshipForm.jsx
import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import styles from "./TeacherAuth.module.css";

export default function InternshipForm({ onClose }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    field: "",
    duration: "",
    mode: "Remote",
    requirements: "",
    outcomes: "",
    spots: "",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function validate() {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Required";
    if (!form.description.trim()) newErrors.description = "Required";
    if (!form.field.trim()) newErrors.field = "Required";
    if (!form.duration.trim()) newErrors.duration = "Required";
    if (!form.requirements.trim()) newErrors.requirements = "Required";
    if (!form.outcomes.trim()) newErrors.outcomes = "Required";
    if (!form.spots) newErrors.spots = "Required";
    if (!form.deadline) newErrors.deadline = "Required";
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
      await addDoc(collection(db, "internships"), {
        title: form.title.trim(),
        description: form.description.trim(),
        field: form.field.trim(),
        duration: form.duration.trim(),
        mode: form.mode,
        requirements: form.requirements.trim(),
        outcomes: form.outcomes.trim(),
        stipend: form.stipend,
        spots: Number(form.spots),
        deadline: form.deadline,
        teacherId: user.uid,
        teacherName: user.displayName || "Teacher",
        applicants: 0,
        status: "open",
        createdAt: new Date(),
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose?.();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h3 style={{ marginBottom: 4 }}>🧪 Post Internship</h3>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
        Share an internship opportunity with students.
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>Internship Title *</label>
          <input
            className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
            name='title'
            value={form.title}
            onChange={handleChange}
            placeholder='e.g. AI Research Intern'
          />
          {errors.title && <p className={styles.errorMsg}>{errors.title}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Research Field *</label>
          <input
            className={`${styles.input} ${errors.field ? styles.inputError : ""}`}
            name='field'
            value={form.field}
            onChange={handleChange}
            placeholder='e.g. Computer Science, Biology, Physics'
          />
          {errors.field && <p className={styles.errorMsg}>{errors.field}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Project Description *</label>
          <textarea
            className={`${styles.input} ${styles.textarea} ${errors.description ? styles.inputError : ""}`}
            name='description'
            value={form.description}
            onChange={handleChange}
            placeholder='Describe the internship project...'
            rows={4}
          />
          {errors.description && (
            <p className={styles.errorMsg}>{errors.description}</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Requirements *</label>
          <textarea
            className={`${styles.input} ${styles.textarea} ${errors.requirements ? styles.inputError : ""}`}
            name='requirements'
            value={form.requirements}
            onChange={handleChange}
            placeholder='e.g. Basic Python, curiosity about AI...'
            rows={3}
          />
          {errors.requirements && (
            <p className={styles.errorMsg}>{errors.requirements}</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Learning Outcomes *</label>
          <textarea
            className={`${styles.input} ${styles.textarea} ${errors.outcomes ? styles.inputError : ""}`}
            name='outcomes'
            value={form.outcomes}
            onChange={handleChange}
            placeholder='What will the student gain from this internship?'
            rows={3}
          />
          {errors.outcomes && (
            <p className={styles.errorMsg}>{errors.outcomes}</p>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Duration *</label>
            <input
              className={`${styles.input} ${errors.duration ? styles.inputError : ""}`}
              name='duration'
              value={form.duration}
              onChange={handleChange}
              placeholder='e.g. 3 months'
            />
            {errors.duration && (
              <p className={styles.errorMsg}>{errors.duration}</p>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Available Spots *</label>
            <input
              className={`${styles.input} ${errors.spots ? styles.inputError : ""}`}
              name='spots'
              type='number'
              min='1'
              value={form.spots}
              onChange={handleChange}
              placeholder='e.g. 3'
            />
            {errors.spots && <p className={styles.errorMsg}>{errors.spots}</p>}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Application Deadline *</label>
          <input
            className={`${styles.input} ${errors.deadline ? styles.inputError : ""}`}
            name='deadline'
            type='date'
            value={form.deadline}
            onChange={handleChange}
          />
          {errors.deadline && (
            <p className={styles.errorMsg}>{errors.deadline}</p>
          )}
        </div>

        <button
          className={styles.btn}
          type='submit'
          disabled={loading}
          style={{ background: saved ? "#27ae60" : undefined }}
        >
          {loading ? "Posting..." : saved ? "Posted! ✓" : "Post Internship 🧪"}
        </button>
      </form>
    </div>
  );
}
