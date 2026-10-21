// src/components/VerifyAccountEmail.jsx
// Landing page for the account-verification link emailed via EmailJS (see
// utils/accountVerification.js). Reads ?kind=student|teacher&uid=&token=
// from the URL and, if the token matches what's on that account's doc,
// marks it verified. Same trust model as VerifyMentorEmail.jsx.
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "./Navbar";
import Footer from "./Footer";

const COLLECTION = { student: "students", teacher: "teachers" };
const LOGIN_PATH = { student: "/student/login", teacher: "/teacher/login" };
const LOGIN_LABEL = { student: "Student Login", teacher: "Mentor Login" };

export default function VerifyAccountEmail() {
  const [searchParams] = useSearchParams();
  const kind = searchParams.get("kind");
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const [status, setStatus] = useState("checking"); // checking | success | invalid | error

  useEffect(() => {
    async function run() {
      const collection = COLLECTION[kind];
      if (!collection || !uid || !token) {
        setStatus("invalid");
        return;
      }
      try {
        const ref = doc(db, collection, uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setStatus("invalid");
          return;
        }
        const data = snap.data();
        if (data.accountEmailVerified) {
          setStatus("success");
          return;
        }
        if (!data.accountEmailToken || data.accountEmailToken !== token) {
          setStatus("invalid");
          return;
        }
        await updateDoc(ref, {
          accountEmailVerified: true,
          accountEmailToken: null,
        });
        setStatus("success");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }
    run();
  }, [kind, uid, token]);

  const CARD = {
    background: "white",
    borderRadius: 16,
    padding: 40,
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    textAlign: "center",
  };

  const loginPath = LOGIN_PATH[kind] || "/";
  const loginLabel = LOGIN_LABEL[kind] || "Login";

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Navbar />
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "140px 24px 80px" }}>
        <div style={CARD}>
          {status === "checking" && (
            <>
              <p style={{ fontSize: 40, marginBottom: 8 }}>⏳</p>
              <h2 style={{ margin: "0 0 8px" }}>Verifying...</h2>
            </>
          )}
          {status === "success" && (
            <>
              <p style={{ fontSize: 48, marginBottom: 8 }}>✅</p>
              <h2 style={{ margin: "0 0 8px" }}>Email verified!</h2>
              <p style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>
                Your account is now active. You can log in.
              </p>
              <Link
                to={loginPath}
                style={{
                  display: "inline-block",
                  padding: "12px 28px",
                  borderRadius: 8,
                  background: "#2f6175",
                  color: "white",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                {loginLabel} →
              </Link>
            </>
          )}
          {status === "invalid" && (
            <>
              <p style={{ fontSize: 48, marginBottom: 8 }}>⚠️</p>
              <h2 style={{ margin: "0 0 8px" }}>Link not valid</h2>
              <p style={{ color: "#666", fontSize: 14 }}>
                This verification link is invalid or has already been used.
                You can request a new one from the login page.
              </p>
            </>
          )}
          {status === "error" && (
            <>
              <p style={{ fontSize: 48, marginBottom: 8 }}>❌</p>
              <h2 style={{ margin: "0 0 8px" }}>Something went wrong</h2>
              <p style={{ color: "#666", fontSize: 14 }}>
                Please try again, or request a new link from the login page.
              </p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
