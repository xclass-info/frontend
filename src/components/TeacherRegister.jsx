import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import styles from "./TeacherAuth.module.css";

export default function TeacherRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );
      await setDoc(doc(db, "teachers", user.uid), {
        name: form.name,
        email: form.email,
        createdAt: new Date(),
      });
      navigate("/teacher/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <button className={styles.closeBtn} onClick={() => navigate(-1)}>
          ✕
        </button>
        <h1 className={styles.title}>👩‍🏫 Teacher Register</h1>
        <p className={styles.sub}>
          Create your Happy Programming teacher account
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <input
              className={styles.input}
              name='name'
              value={form.name}
              onChange={handleChange}
              placeholder='Jane Smith'
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              name='email'
              type='email'
              value={form.email}
              onChange={handleChange}
              placeholder='jane@email.com'
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              name='password'
              type='password'
              value={form.password}
              onChange={handleChange}
              placeholder='••••••••'
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <input
              className={styles.input}
              name='confirmPassword'
              type='password'
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder='••••••••'
              required
            />
          </div>
          <button className={styles.btn} type='submit' disabled={loading}>
            {loading ? "Creating account..." : "Register →"}
          </button>
        </form>

        <p className={styles.switch}>
          Already have an account? <Link to='/teacher/login'>Login here</Link>
        </p>
      </div>
    </div>
  );
}
