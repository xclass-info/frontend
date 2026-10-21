// src/components/ResetPassword.jsx
// Our own landing page for Firebase Authentication's email links, so they
// point at happyresearch.org/reset-password instead of
// xclass-3e2f3.firebaseapp.com/__/auth/action. Set as the custom action URL
// in Firebase console > Authentication > Templates. Firebase appends
// ?mode=...&oobCode=...; we finish the action with the Firebase SDK.
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  applyActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { firebaseAuth } from "../firebase";
import styles from "./TeacherAuth.module.css";
import Footer from "./Footer";

// Only send people back to our own site after a reset.
function safeContinueUrl(url) {
  try {
    const u = new URL(url);
    return u.origin === window.location.origin ? u.pathname + u.search : null;
  } catch {
    return null;
  }
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");
  const continuePath = safeContinueUrl(searchParams.get("continueUrl"));

  // checking | form | done | invalid | applied
  const [status, setStatus] = useState("checking");
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setStatus("invalid");
      return;
    }
    if (mode === "resetPassword") {
      verifyPasswordResetCode(firebaseAuth, oobCode)
        .then((addr) => {
          setEmail(addr);
          setStatus("form");
        })
        .catch(() => setStatus("invalid"));
    } else if (mode === "verifyEmail" || mode === "recoverEmail") {
      applyActionCode(firebaseAuth, oobCode)
        .then(() => setStatus("applied"))
        .catch(() => setStatus("invalid"));
    } else {
      setStatus("invalid");
    }
  }, [mode, oobCode]);

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
      await confirmPasswordReset(firebaseAuth, oobCode, form.password);
      setStatus("done");
    } catch (err) {
      if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (
        err.code === "auth/expired-action-code" ||
        err.code === "auth/invalid-action-code"
      ) {
        setStatus("invalid");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const loginLinks = continuePath ? (
    <Link to={continuePath} className={styles.btn} style={{ textDecoration: "none" }}>
      Go to Login →
    </Link>
  ) : (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
      <Link to='/student/login' className={styles.btn} style={{ textDecoration: "none" }}>
        Student Login →
      </Link>
      <Link to='/teacher/login' className={styles.btn} style={{ textDecoration: "none" }}>
        Mentor Login →
      </Link>
    </div>
  );

  const message = (icon, title, text, action) => (
    <div style={{ textAlign: "center", padding: 20 }}>
      <p style={{ fontSize: 48, marginBottom: 12 }}>{icon}</p>
      <h3 style={{ color: "var(--primary-hover)", marginBottom: 8 }}>{title}</h3>
      <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
        {text}
      </p>
      {action}
    </div>
  );

  return (
    <>
      <div className={styles.page}>
        <div className={styles.card}>
          <button className={styles.closeBtn} onClick={() => navigate("/")}>
            ✕
          </button>

          {status === "checking" && message("⏳", "Checking your link...", "")}

          {status === "invalid" &&
            message(
              "⚠️",
              "Link not valid",
              "This link is invalid, has expired, or has already been used. Request a new one with \"Forgot password?\" on the login page.",
              loginLinks,
            )}

          {status === "applied" &&
            message("✅", "All set", "Your account has been updated. You can log in now.", loginLinks)}

          {status === "done" &&
            message(
              "✅",
              "Password updated",
              "You can now log in with your new password.",
              loginLinks,
            )}

          {status === "form" && (
            <>
              <h1 className={styles.title}>🔑 Choose a New Password</h1>
              <p className={styles.sub}>
                For <strong>{email}</strong>
              </p>

              {error && <p className={styles.error}>{error}</p>}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>New Password</label>
                  <input
                    className={styles.input}
                    name='password'
                    type='password'
                    value={form.password}
                    onChange={handleChange}
                    placeholder='At least 6 characters'
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
                  {loading ? "Saving..." : "Save Password →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
