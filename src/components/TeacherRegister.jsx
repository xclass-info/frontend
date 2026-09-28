import { useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import styles from "./TeacherAuth.module.css";
import Footer from "./Footer";

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
  const [verificationSent, setVerificationSent] = useState(false);

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
    if (form.password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );

      // Send verification email
      await sendEmailVerification(user, {
        url: "https://happyresearch.org/#/teacher/login",
        handleCodeInApp: false,
      });

      // Save teacher to Firestore
      await setDoc(doc(db, "teachers", user.uid), {
        name: form.name,
        email: form.email,
        createdAt: new Date(),
      });

      setVerificationSent(true);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className={styles.page}>
        <div className={styles.card}>
          <button className={styles.closeBtn} onClick={() => navigate("/")}>
            ✕
          </button>

          {verificationSent ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>📧</p>
              <h3 style={{ color: "#00274c", marginBottom: 8 }}>
                Check your email!
              </h3>
              <p
                style={{
                  color: "#64748b",
                  fontSize: 14,
                  lineHeight: 1.6,
                  marginBottom: 20,
                }}
              >
                We sent a verification link to <strong>{form.email}</strong>.
                Please click the link to verify your account before logging in.
              </p>
              <button
                onClick={() => navigate("/teacher/login")}
                className={styles.btn}
              >
                Go to Login →
              </button>
            </div>
          ) : (
            <>
              <h1 className={styles.title}>👩‍🏫 Mentor Register</h1>
              <p className={styles.sub}>
                Create your HappyResearch mentor account
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
                    placeholder='Dr. Jane Smith'
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
                Already have an account?{" "}
                <Link to='/teacher/login'>Login here</Link>
              </p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
