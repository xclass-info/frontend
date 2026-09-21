// src/components/ResearchForm.jsx
import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import styles from "./TeacherAuth.module.css";

const WORD_LIMITS = { title: 100, idea: 500, impact: 300, details: 300 };

function countWords(str) {
  const trimmed = str.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function WordCount({ count, limit }) {
  return (
    <span style={{ fontSize: 12, color: count >= limit ? "#e74c3c" : "#aaa" }}>
      {count} / {limit} words
    </span>
  );
}

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
    const { name, value } = e.target;
    const limit = WORD_LIMITS[name];
    if (limit && countWords(value) > limit) return;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
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
        {isEditing ? "🔬 Edit Research" : "🔬 Create Research"}
      </h3>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
        {isEditing
          ? "Update your research post."
          : "Share your research with the community."}
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label className={styles.label}>Research Topic *</label>
            <WordCount
              count={countWords(form.title)}
              limit={WORD_LIMITS.title}
            />
          </div>
          <input
            className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
            name='title'
            value={form.title}
            onChange={handleChange}
            placeholder='e.g. Edge Computing in Home Security'
            style={{ fontSize: "1.1rem" }}
          />
          {errors.title && <p className={styles.errorMsg}>{errors.title}</p>}
        </div>

        <div className={styles.field}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label className={styles.label}>Research Idea *</label>
            <WordCount
              count={countWords(form.idea)}
              limit={WORD_LIMITS.idea}
            />
          </div>
          <textarea
            className={`${styles.input} ${styles.textarea} ${errors.idea ? styles.inputError : ""}`}
            name='idea'
            value={form.idea}
            onChange={handleChange}
            placeholder='Describe your research idea...'
            rows={4}
            style={{ fontSize: "1.1rem" }}
          />
          {errors.idea && <p className={styles.errorMsg}>{errors.idea}</p>}
        </div>

        <div className={styles.field}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label className={styles.label}>Research Impact *</label>
            <WordCount
              count={countWords(form.impact)}
              limit={WORD_LIMITS.impact}
            />
          </div>
          <textarea
            className={`${styles.input} ${styles.textarea} ${errors.impact ? styles.inputError : ""}`}
            name='impact'
            value={form.impact}
            onChange={handleChange}
            placeholder='What impact will this research have?'
            rows={3}
            style={{ fontSize: "1.1rem" }}
          />
          {errors.impact && <p className={styles.errorMsg}>{errors.impact}</p>}
        </div>

        <div className={styles.field}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label className={styles.label}>
              Additional Details{" "}
              <span style={{ color: "#aaa", fontWeight: 400 }}>
                (optional)
              </span>
            </label>
            <WordCount
              count={countWords(form.details)}
              limit={WORD_LIMITS.details}
            />
          </div>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            name='details'
            value={form.details}
            onChange={handleChange}
            placeholder='Any additional information...'
            rows={3}
            style={{ fontSize: "1.1rem" }}
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
                : "Creating..."
              : saved
                ? isEditing
                  ? "Saved! ✓"
                  : "Created! ✓"
                : isEditing
                  ? "Save Changes"
                  : "Create Research 🔬"}
          </button>
          {isEditing && onClose && (
            <button
              type='button'
              onClick={onClose}
              style={{
                padding: "14px 28px",
                borderRadius: 50,
                border: "2.5px solid #cbd5e1",
                background: "transparent",
                color: "#475569",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: "1rem",
                fontFamily: "Nunito, sans-serif",
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
