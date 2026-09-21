// src/components/ProjectForm.jsx
import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import styles from "./TeacherAuth.module.css";

export default function ProjectForm({ project, onClose }) {
  const isEditing = Boolean(project);
  const [form, setForm] = useState({
    title: project?.title || "",
    description: project?.description || "",
    learning: project?.learning || "",
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
    if (!form.learning.trim()) newErrors.learning = "Required";
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
        description: form.description.trim(),
        learning: form.learning.trim(),
      };
      if (isEditing) {
        await updateDoc(doc(db, "projects", project.id), {
          ...payload,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, "projects"), {
          ...payload,
          teacherId: user.uid,
          teacherName: user.displayName || "Teacher",
          createdAt: new Date(),
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
        {isEditing ? "💡 Edit Project" : "💡 Create Project"}
      </h3>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
        {isEditing
          ? "Update your project post."
          : "Share a project idea students can work on with you."}
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>Project Title *</label>
          <input
            className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
            name='title'
            value={form.title}
            onChange={handleChange}
            placeholder='e.g. Build a chatbot with Python'
            style={{ fontSize: "1.1rem" }}
          />
          {errors.title && <p className={styles.errorMsg}>{errors.title}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Project Description *</label>
          <textarea
            className={`${styles.input} ${styles.textarea} ${errors.description ? styles.inputError : ""}`}
            name='description'
            value={form.description}
            onChange={handleChange}
            placeholder='Describe what the project involves...'
            rows={4}
            style={{ fontSize: "1.1rem" }}
          />
          {errors.description && (
            <p className={styles.errorMsg}>{errors.description}</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>What Students Will Learn *</label>
          <textarea
            className={`${styles.input} ${styles.textarea} ${errors.learning ? styles.inputError : ""}`}
            name='learning'
            value={form.learning}
            onChange={handleChange}
            placeholder='What skills or knowledge will students gain?'
            rows={3}
            style={{ fontSize: "1.1rem" }}
          />
          {errors.learning && (
            <p className={styles.errorMsg}>{errors.learning}</p>
          )}
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
                  : "Create Project 💡"}
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
