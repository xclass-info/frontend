// src/components/StudentRegistrations.jsx
// A logged-in student's own registrations (research / projects / courses).
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { formatMentorName } from "../utils/mentorName";

const KIND_LABEL = {
  research: "🔬 Research",
  project: "💡 Project",
  course: "📚 Course",
};

export default function StudentRegistrations() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [student, setStudent] = useState(null);
  const [regs, setRegs] = useState([]);
  const [mentors, setMentors] = useState({});

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      // Only verified student accounts belong here.
      if (!user || !user.emailVerified) {
        navigate("/student/login");
        return;
      }
      try {
        const studentSnap = await getDoc(doc(db, "students", user.uid));
        if (!studentSnap.exists()) {
          navigate("/student/login");
          return;
        }
        setStudent(studentSnap.data());

        // Match on the login email (Firebase lowercases it). Older
        // registrations only have studentEmail; newer ones also have
        // studentEmailLower, so check both and merge.
        const email = user.email.toLowerCase();
        const [a, b] = await Promise.all([
          getDocs(
            query(collection(db, "registrations"), where("studentEmail", "==", email)),
          ),
          getDocs(
            query(
              collection(db, "registrations"),
              where("studentEmailLower", "==", email),
            ),
          ),
        ]);
        const merged = new Map();
        [...a.docs, ...b.docs].forEach((d) =>
          merged.set(d.id, { id: d.id, ...d.data() }),
        );
        const list = [...merged.values()].sort(
          (x, y) => (y.createdAt?.seconds || 0) - (x.createdAt?.seconds || 0),
        );
        setRegs(list);

        const teacherIds = [...new Set(list.map((r) => r.teacherId).filter(Boolean))];
        const entries = await Promise.all(
          teacherIds.map(async (id) => {
            const t = await getDoc(doc(db, "teachers", id));
            return [id, t.exists() ? t.data().name : null];
          }),
        );
        setMentors(Object.fromEntries(entries));
      } catch (err) {
        console.error(err);
      } finally {
        setReady(true);
      }
    });
    return () => unsub();
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Navbar />
      <div
        style={{ maxWidth: 800, margin: "0 auto", padding: "100px 24px 48px" }}
      >
        <h1 style={{ fontSize: "2rem", margin: "0 0 4px" }}>
          🎓 My Registrations
        </h1>
        {student && (
          <p style={{ color: "#666", margin: "0 0 28px" }}>
            Welcome, {student.name}
          </p>
        )}

        {!ready ? (
          <p style={{ color: "#aaa" }}>Loading...</p>
        ) : regs.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 32,
              textAlign: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            }}
          >
            <p style={{ margin: "0 0 12px", color: "#555" }}>
              You haven't registered for anything yet.
            </p>
            <p style={{ margin: 0, fontSize: 14 }}>
              <Link to='/research' style={{ color: "#00274c" }}>
                Browse research
              </Link>{" "}
              ·{" "}
              <Link to='/tutors' style={{ color: "#00274c" }}>
                Meet our mentors
              </Link>
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {regs.map((r) => (
              <div
                key={r.id}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: 22,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#00274c",
                    background: "#f0f4ff",
                    padding: "3px 10px",
                    borderRadius: 50,
                  }}
                >
                  {KIND_LABEL[r.kind] || "Registration"}
                </span>
                <h3 style={{ margin: "10px 0 6px", fontSize: 18 }}>
                  {r.itemTitle}
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
                  Registered{" "}
                  {r.createdAt?.toDate
                    ? r.createdAt.toDate().toLocaleDateString()
                    : ""}
                  {mentors[r.teacherId] && (
                    <>
                      {" "}
                      · Mentored by:{" "}
                      <Link
                        to={`/teacher/${r.teacherId}`}
                        style={{ color: "#00274c", textDecoration: "underline" }}
                      >
                        {formatMentorName(mentors[r.teacherId])}
                      </Link>
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
