import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import styles from "./TeacherAuth.module.css";

export default function CreateClass() {
  const navigate = useNavigate();
  const location = useLocation();
  const editCourseId = location.state?.editCourseId || null;
  const isEditing = Boolean(editCourseId);
  const [form, setForm] = useState({
    title: "",
    description: "",
    maxSeats: "",
    price: "", // ← added
  });
  const [lessons, setLessons] = useState([]);
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [editingDate, setEditingDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(isEditing);

  useEffect(() => {
    if (!editCourseId) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "classes", editCourseId));
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            title: data.title || "",
            description: data.description || "",
            maxSeats: data.maxSeats ?? "",
            price: data.price ?? "",
          });
          setLessons(data.lessons || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCourse(false);
      }
    })();
  }, [editCourseId]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function saveLesson() {
    if (!newDate || !newStartTime || !newEndTime) {
      return setErrors({
        ...errors,
        lessons: "Set a date, start time, and end time",
      });
    }
    if (newEndTime <= newStartTime) {
      return setErrors({
        ...errors,
        lessons: "End time must be after start time",
      });
    }
    const isDuplicate = lessons.some(
      (l) => l.date === newDate && l.date !== editingDate,
    );
    if (isDuplicate) {
      setErrors({ ...errors, lessons: "That date is already added" });
      return;
    }
    const lesson = { date: newDate, startTime: newStartTime, endTime: newEndTime };
    const updated = editingDate
      ? lessons.map((l) => (l.date === editingDate ? lesson : l))
      : [...lessons, lesson];
    setLessons(updated.sort((a, b) => a.date.localeCompare(b.date)));
    setErrors({ ...errors, lessons: "" });
    setNewDate("");
    setEditingDate(null);
  }

  function editLesson(lesson) {
    setNewDate(lesson.date);
    setNewStartTime(lesson.startTime);
    setNewEndTime(lesson.endTime);
    setEditingDate(lesson.date);
    setErrors({ ...errors, lessons: "" });
  }

  function cancelEdit() {
    setNewDate("");
    setNewStartTime("");
    setNewEndTime("");
    setEditingDate(null);
  }

  function removeLesson(date) {
    setLessons(lessons.filter((l) => l.date !== date));
    if (editingDate === date) cancelEdit();
  }

  function validate() {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Required";
    if (!form.description.trim()) newErrors.description = "Required";
    if (lessons.length === 0) newErrors.lessons = "Add at least one lesson";
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
      const payload = {
        title: form.title,
        description: form.description,
        lessons,
        maxSeats: Number(form.maxSeats),
        price: Number(form.price), // ← added
      };
      if (isEditing) {
        await updateDoc(doc(db, "classes", editCourseId), {
          ...payload,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, "classes"), {
          ...payload,
          teacherId: user.uid,
          enrolledCount: 0,
          status: "registration",
          createdAt: new Date(),
        });
      }
      navigate("/teacher/dashboard");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingCourse) {
    return (
      <div className={styles.page}>
        <div className={styles.card} style={{ maxWidth: 760 }}>
          <p style={{ textAlign: "center", color: "#aaa", padding: "40px 0" }}>
            Loading course...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ maxWidth: 760 }}>
        <Link to='/teacher/dashboard' className={styles.back}>
          ← Back to Dashboard
        </Link>
        <h1 className={styles.title}>
          {isEditing ? "📚 Edit Course" : "📚 Create a Course"}
        </h1>
        <p className={styles.sub}>
          {isEditing
            ? "Update your course details"
            : "Fill in the details for your new course"}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Title */}
          <div className={styles.field}>
            <label className={styles.label}>Course Title</label>
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
              placeholder='What will students learn in this course?'
              rows={3}
            />
            {errors.description && (
              <p className={styles.errorMsg}>{errors.description}</p>
            )}
          </div>

          {/* Lessons */}
          <div className={styles.field}>
            <label className={styles.label}>Lessons</label>
            {lessons.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                {lessons.map((lesson) => (
                  <div
                    key={lesson.date}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: 8,
                      background:
                        editingDate === lesson.date ? "#fff4d6" : "#f0f4ff",
                      color: "#00274c",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <span>
                      📅 {lesson.date} · {lesson.startTime}–{lesson.endTime}
                    </span>
                    <span style={{ display: "flex", gap: 10 }}>
                      <button
                        type='button'
                        onClick={() => editLesson(lesson)}
                        title='Edit lesson'
                        style={{
                          background: "none",
                          border: "none",
                          color: "#00274c",
                          cursor: "pointer",
                          fontSize: 14,
                          lineHeight: 1,
                          padding: 0,
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        type='button'
                        onClick={() => removeLesson(lesson.date)}
                        title='Remove lesson'
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
                  </div>
                ))}
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "flex-end",
              }}
            >
              <div>
                <label style={{ fontSize: 11, color: "#888" }}>Date</label>
                <input
                  className={`${styles.input} ${errors.lessons ? styles.inputError : ""}`}
                  type='date'
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#888" }}>
                  Start Time
                </label>
                <input
                  className={`${styles.input} ${errors.lessons ? styles.inputError : ""}`}
                  type='time'
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#888" }}>
                  End Time
                </label>
                <input
                  className={`${styles.input} ${errors.lessons ? styles.inputError : ""}`}
                  type='time'
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                />
              </div>
              <button
                type='button'
                onClick={saveLesson}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#00274c",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {editingDate ? "Update Lesson" : "+ Add Lesson"}
              </button>
              {editingDate && (
                <button
                  type='button'
                  onClick={cancelEdit}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    background: "white",
                    color: "#555",
                    cursor: "pointer",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
            {errors.lessons && (
              <p className={styles.errorMsg}>{errors.lessons}</p>
            )}
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
            {loading
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save Changes"
                : "Create Course 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
