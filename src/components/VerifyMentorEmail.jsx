// src/components/VerifyMentorEmail.jsx
// Landing page for the link sent to a faculty mentor's work email. Reads
// ?uid=&token= from the URL, and if they match what's on the teacher doc,
// marks the work email verified. No backend needed - just a Firestore
// read + conditional write, same trust model as the rest of this app.
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function VerifyMentorEmail() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const [status, setStatus] = useState("checking"); // checking | success | invalid | error

  useEffect(() => {
    async function run() {
      if (!uid || !token) {
        setStatus("invalid");
        return;
      }
      try {
        const ref = doc(db, "teachers", uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setStatus("invalid");
          return;
        }
        const data = snap.data();
        if (data.workEmailVerified) {
          setStatus("success");
          return;
        }
        if (!data.workEmailToken || data.workEmailToken !== token) {
          setStatus("invalid");
          return;
        }
        await updateDoc(ref, { workEmailVerified: true, workEmailToken: null });
        setStatus("success");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }
    run();
  }, [uid, token]);

  const CARD = {
    background: "white",
    borderRadius: 16,
    padding: 40,
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    textAlign: "center",
  };

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
                Head back to your dashboard to finish your mentor
                application.
              </p>
              <Link
                to='/teacher/dashboard'
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
                Go to Dashboard →
              </Link>
            </>
          )}
          {status === "invalid" && (
            <>
              <p style={{ fontSize: 48, marginBottom: 8 }}>⚠️</p>
              <h2 style={{ margin: "0 0 8px" }}>Link not valid</h2>
              <p style={{ color: "#666", fontSize: 14 }}>
                This verification link is invalid or has already been used.
                You can request a new one from your dashboard's Verification
                tab.
              </p>
            </>
          )}
          {status === "error" && (
            <>
              <p style={{ fontSize: 48, marginBottom: 8 }}>❌</p>
              <h2 style={{ margin: "0 0 8px" }}>Something went wrong</h2>
              <p style={{ color: "#666", fontSize: 14 }}>
                Please try again, or request a new link from your dashboard.
              </p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
