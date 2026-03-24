import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import styles from "./TeacherAuth.module.css";

export default function TeacherLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/teacher/dashboard");
    } catch (err) {
      setError("Invalid email or password");
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
        <h1 className={styles.title}>👩‍🏫 Teacher Login</h1>
        <p className={styles.sub}>Welcome back to Happy Programming</p>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
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
          <button className={styles.btn} type='submit' disabled={loading}>
            {loading ? "Logging in..." : "Login →"}
          </button>
        </form>

        <p className={styles.switch}>
          Don't have an account?{" "}
          <Link to='/teacher/register'>Register here</Link>
        </p>
      </div>
    </div>
  );
}
