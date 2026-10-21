import { useState } from "react";
import { register } from "../auth";
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
  const [emailFailed, setEmailFailed] = useState(false);

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
      // Creates the account and its mentor record (verificationStatus
      // "incomplete"), and emails the verification link.
      const { emailSent } = await register({
        kind: "teacher",
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setEmailFailed(!emailSent);
      setVerificationSent(true);
    } catch (err) {
      if (err.code === "EMAIL_IN_USE") {
        setError("This email is already registered. Please login instead.");
      } else if (err.code === "WEAK_PASSWORD") {
        setError("Password should be at least 6 characters.");
      } else if (err.code === "INVALID_EMAIL") {
        setError("Please enter a valid email address.");
      } else {
        setError(err.detail || "Something went wrong. Please try again.");
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
              <h3 style={{ color: "#2f6175", marginBottom: 8 }}>
                {emailFailed ? "Account created" : "Check your email!"}
              </h3>
              <p
                style={{
                  color: "#64748b",
                  fontSize: 14,
                  lineHeight: 1.6,
                  marginBottom: 20,
                }}
              >
                {emailFailed ? (
                  <>
                    We couldn't send the verification email to{" "}
                    <strong>{form.email}</strong>. Go to Login and choose
                    "Resend Verification Email".
                  </>
                ) : (
                  <>
                    We sent a verification link to <strong>{form.email}</strong>
                    . Please click the link to verify your account before
                    logging in.
                  </>
                )}
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
