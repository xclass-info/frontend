import { useEffect, useState } from "react";
import styles from "./Navbar.module.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Replace with this:
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [student, setStudent] = useState(null);

  // Mentors are logged-in users too, so a student is someone with a
  // students record.
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setStudent(null);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "students", user.uid));
        setStudent(snap.exists() ? { name: snap.data().name } : null);
      } catch {
        setStudent(null);
      }
    });
    return () => unsub();
  }, []);

  async function handleStudentLogout() {
    await signOut(auth);
    setStudent(null);
    navigate("/");
  }

  function scrollTo(id) {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }

  function scrollToTop() {
    if (location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <nav className={styles.nav}>
      {/* Logo */}
      <Link to='/' className={styles.logo}>
        happy<span className={styles.logoClass}>Class</span>
        {/* <span className={styles.logoInfo}>.org</span> */}
      </Link>

      <ul className={styles.links}>
        <li>
          <a onClick={scrollToTop} style={{ cursor: "pointer" }}>
            Home
          </a>
        </li>
        {/* <li>
          <Link to='/internship'>Internship</Link>
        </li> */}

        <li>
          <Link to='/courses'>Courses</Link>
        </li>
        <li>
          <Link to='/projects'>Projects</Link>
        </li>
        <li>
          <Link to='/research'>Research</Link>
        </li>
        <li>
          <Link to='/showcase'>Student Work</Link>
        </li>
        <li>
          <Link to='/tutors'>Mentor</Link>
        </li>
        <li>
          <Link to='/gallery'>Gallery</Link>
        </li>
        <li>
          <Link to='/about'>About Us</Link>
        </li>
        <li>
          <Link to='/contact'>Contact</Link>
        </li>
      </ul>

      {/* Desktop right side buttons */}
      <div className={styles.navRight}>
        {student ? (
          <button
            className={styles.teacherBtn}
            onClick={handleStudentLogout}
            style={{ cursor: "pointer" }}
          >
            Logout
          </button>
        ) : (
          <>
            <Link to='/student/login' className={styles.teacherBtn}>
              Student Login
            </Link>
            <Link to='/teacher/login' className={styles.teacherBtn}>
              Mentor Login
            </Link>
          </>
        )}
        {/* <Link to='/register' className={styles.cta}>
          Student Login →
        </Link> */}
      </div>

      {/* Hamburger button */}
      <button className={styles.hamburger} onClick={() => setOpen(!open)}>
        {open ? "✕" : "☰"}
      </button>

      {/* Mobile menu */}
      {open && (
        <ul className={styles.mobileMenu} onClick={() => setOpen(false)}>
          <li>
            <a onClick={scrollToTop} style={{ cursor: "pointer" }}>
              Home
            </a>
          </li>
          {/* <li>
            <Link to='/internship'>🧪 Internship</Link>
          </li> */}

          <li>
            <Link to='/courses'>📚 Courses</Link>
          </li>
          <li>
            <Link to='/projects'>💡 Projects</Link>
          </li>
          <li>
            <Link to='/research'>🔬 Research</Link>
          </li>
          <li>
            <Link to='/showcase'>🏆 Student Work</Link>
          </li>

          <li>
            <a onClick={() => scrollTo("tutors")} style={{ cursor: "pointer" }}>
              Mentor
            </a>
          </li>
          <li>
            <Link to='/gallery'>Gallery</Link>
          </li>
          <li>
            <Link to='/about'>About Us</Link>
          </li>
          <li>
            <Link to='/contact'>Contact</Link>
          </li>
          {student ? (
            <>
              <li>
                <Link to='/student/dashboard'>My Dashboard</Link>
              </li>
              <li>
                <a onClick={handleStudentLogout} style={{ cursor: "pointer" }}>
                  Logout
                </a>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to='/student/login'>Student Login</Link>
              </li>
              <li>
                <Link to='/teacher/login'>Mentor Login</Link>
              </li>
            </>
          )}
          {/* <li>
            <Link to='/register'>Student Login →</Link>
          </li> */}
        </ul>
      )}
    </nav>
  );
}
