import { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import styles from "./TeacherAuth.module.css";
import Footer from "./Footer";

export default function TeacherLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

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

  // async function handleForgotPassword() {
  //   if (!form.email.trim()) {
  //     setError("Please enter your email address first");
  //     return;
  //   }
  //   setResetLoading(true);
  //   try {
  //     await sendPasswordResetEmail(auth, form.email);
  //     setResetSent(true);
  //     setError("");
  //   } catch (err) {
  //     setError("Could not send reset email. Please check your email address.");
  //   } finally {
  //     setResetLoading(false);
  //   }
  // }

  async function handleForgotPassword() {
    if (!form.email.trim()) {
      setError("Please enter your email address first");
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, form.email, {
        url: "https://happyresearch.org/#/teacher/login", // ← redirect here after reset
        handleCodeInApp: false,
      });
      setResetSent(true);
      setError("");
    } catch (err) {
      console.error("Reset error:", err.code, err.message); // ← add this
      setError("Could not send reset email. Please check your email address.");
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <>
      <div className={styles.page}>
        <div className={styles.card}>
          <button className={styles.closeBtn} onClick={() => navigate("/")}>
            ✕
          </button>
          <h1 className={styles.title}>👩‍🏫 Teacher Login</h1>
          <p className={styles.sub}>Welcome back to HappyResearch</p>

          {error && <p className={styles.error}>{error}</p>}

          {resetSent && (
            <p
              style={{
                color: "#27ae60",
                fontSize: 14,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              ✅ Password reset email sent! Check your inbox.
            </p>
          )}

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

            {/* Forgot password */}
            <div style={{ textAlign: "right", marginBottom: 12 }}>
              <button
                type='button'
                onClick={handleForgotPassword}
                disabled={resetLoading}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4a90e2",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                {resetLoading ? "Sending..." : "Forgot password?"}
              </button>
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
      <Footer />;
    </>
  );
}
