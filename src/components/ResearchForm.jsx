// src/components/ResearchForm.jsx
import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import styles from "./TeacherAuth.module.css";

export default function ResearchForm({ onClose }) {
  const [form, setForm] = useState({
    title: "",
    idea: "",
    impact: "",
    details: "",
    type: "exploration", // ← added
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
    if (!form.idea.trim()) newErrors.idea = "Required";
    if (!form.impact.trim()) newErrors.impact = "Required";
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
      await addDoc(collection(db, "research"), {
        title: form.title.trim(),
        idea: form.idea.trim(),
        impact: form.impact.trim(),
        details: form.details.trim() || null,
        type: form.type, // ← added
        teacherId: user.uid,
        teacherName: user.displayName || "Teacher",
        createdAt: new Date(),
        status: "published",
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
      <h3 style={{ marginBottom: 4 }}>🔬 Post Research</h3>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
        Share your research with the community.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Research Type */}
        <div className={styles.field}>
          <label className={styles.label}>Research Track *</label>
          <select
            className={styles.input}
            name='type'
            value={form.type}
            onChange={handleChange}
          >
            <option value='exploration'>🧪 Research Exploration Track</option>
            <option value='publication'>📄 Research Publication Track</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Research Topic *</label>
          <input
            className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
            name='title'
            value={form.title}
            onChange={handleChange}
            placeholder='e.g. Edge Computing in Home Security'
          />
          {errors.title && <p className={styles.errorMsg}>{errors.title}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Research Idea *</label>
          <textarea
            className={`${styles.input} ${styles.textarea} ${errors.idea ? styles.inputError : ""}`}
            name='idea'
            value={form.idea}
            onChange={handleChange}
            placeholder='Describe your research idea...'
            rows={4}
          />
          {errors.idea && <p className={styles.errorMsg}>{errors.idea}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Research Impact *</label>
          <textarea
            className={`${styles.input} ${styles.textarea} ${errors.impact ? styles.inputError : ""}`}
            name='impact'
            value={form.impact}
            onChange={handleChange}
            placeholder='What impact will this research have?'
            rows={3}
          />
          {errors.impact && <p className={styles.errorMsg}>{errors.impact}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Additional Details{" "}
            <span style={{ color: "#aaa", fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            name='details'
            value={form.details}
            onChange={handleChange}
            placeholder='Any additional information...'
            rows={3}
          />
        </div>

        <button
          className={styles.btn}
          type='submit'
          disabled={loading}
          style={{ background: saved ? "#27ae60" : undefined }}
        >
          {loading ? "Posting..." : saved ? "Posted! ✓" : "Post Research 🔬"}
        </button>
      </form>
    </div>
  );
}
