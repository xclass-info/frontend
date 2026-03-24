import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import styles from "./TeacherDashboard.module.css";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/teacher/login");
        return;
      }

      // Get teacher profile
      const teacherDoc = await getDoc(doc(db, "teachers", user.uid));
      if (teacherDoc.exists()) {
        setTeacher(teacherDoc.data());
      }

      // Get teacher's classes
      const q = query(
        collection(db, "classes"),
        where("teacherId", "==", user.uid),
      );
      const unsubscribeClasses = onSnapshot(q, (snapshot) => {
        setClasses(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });

      return () => unsubscribeClasses();
    });

    return () => unsubscribeAuth();
  }, []);

  async function handleLogout() {
    await signOut(auth);
    navigate("/teacher/login");
  }

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logo}>💻 Happy Programming</h1>
          <p className={styles.welcome}>
            Welcome back, <strong>{teacher?.name}</strong> 👋
          </p>
        </div>
        <div className={styles.headerRight}>
          <Link to='/teacher/create-class' className={styles.createBtn}>
            + Create Class
          </Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{classes.length}</span>
          <span className={styles.statLabel}>Total Classes</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>
            {classes.filter((c) => c.status === "active").length}
          </span>
          <span className={styles.statLabel}>Active Classes</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>
            {classes.reduce((acc, c) => acc + (c.enrolledCount || 0), 0)}
          </span>
          <span className={styles.statLabel}>Total Students</span>
        </div>
      </div>

      {/* Classes */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Your Classes</h2>

        {classes.length === 0 ? (
          <div className={styles.empty}>
            <p>🎒 No classes yet!</p>
            <Link to='/teacher/create-class' className={styles.createBtn}>
              + Create your first class
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {classes.map((cls) => (
              <div key={cls.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <h3 className={styles.cardTitle}>{cls.title}</h3>
                  <span
                    className={`${styles.badge} ${cls.status === "active" ? styles.active : styles.draft}`}
                  >
                    {cls.status || "draft"}
                  </span>
                </div>
                <p className={styles.cardDesc}>{cls.description}</p>
                <div className={styles.cardMeta}>
                  <span>
                    📅 {cls.date} at {cls.time}
                  </span>
                  <span>
                    👥 {cls.enrolledCount || 0} / {cls.maxSeats} seats
                  </span>
                </div>
                <div className={styles.cardFooter}>
                  <Link to={`/classroom/${cls.id}`} className={styles.joinBtn}>
                    🎥 Start Class
                  </Link>
                  <button
                    className={styles.copyBtn}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/classroom/${cls.id}`,
                      );
                      alert("Link copied!");
                    }}
                  >
                    📋 Copy Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
