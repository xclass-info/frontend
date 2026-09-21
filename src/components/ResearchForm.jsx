// src/components/ResearchForm.jsx
import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import styles from "./TeacherAuth.module.css";

export default function ResearchForm({ research, onClose }) {
  const isEditing = Boolean(research);
  const [form, setForm] = useState({
    title: research?.title || "",
    idea: research?.idea || "",
    impact: research?.impact || "",
    details: research?.details || "",
    type: research?.type || "exploration",
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
      const payload = {
        title: form.title.trim(),
        idea: form.idea.trim(),
        impact: form.impact.trim(),
        details: form.details.trim() || null,
        type: form.type,
      };
      if (isEditing) {
        await updateDoc(doc(db, "research", research.id), {
          ...payload,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, "research"), {
          ...payload,
          teacherId: user.uid,
          teacherName: user.displayName || "Teacher",
          createdAt: new Date(),
          status: "published",
          stage: "active",
        });
      }
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
      {onClose && (
        <button
          type='button'
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#00274c",
            cursor: "pointer",
            fontSize: 14,
            marginBottom: 12,
            padding: 0,
          }}
        >
          ← Back
        </button>
      )}
      <h3 style={{ marginBottom: 4 }}>
        {isEditing ? "🔬 Edit Research" : "🔬 Post Research"}
      </h3>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
        {isEditing
          ? "Update your research post."
          : "Share your research with the community."}
      </p>

      <form onSubmit={handleSubmit}>
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

        <div style={{ display: "flex", gap: 12 }}>
          <button
            className={styles.btn}
            type='submit'
            disabled={loading}
            style={{ background: saved ? "#27ae60" : undefined }}
          >
            {loading
              ? isEditing
                ? "Saving..."
                : "Posting..."
              : saved
                ? isEditing
                  ? "Saved! ✓"
                  : "Posted! ✓"
                : isEditing
                  ? "Save Changes"
                  : "Post Research 🔬"}
          </button>
          {isEditing && onClose && (
            <button
              type='button'
              onClick={onClose}
              style={{
                padding: "8px 24px",
                borderRadius: 50,
                border: "2.5px solid #e2e8f0",
                background: "transparent",
                color: "#64748b",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: "0.95rem",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
