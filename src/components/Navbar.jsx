import { useState } from "react";
import styles from "./Navbar.module.css";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Replace with this:
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
        x<span className={styles.logoClass}>class</span>
        <span className={styles.logoInfo}>.info</span>
      </Link>

      {/* Desktop links */}
      <ul className={styles.links}>
        <li>
          <a onClick={scrollToTop} style={{ cursor: "pointer" }}>
            🏠 Home
          </a>
        </li>
        <li>
          <a onClick={() => scrollTo("tutors")} style={{ cursor: "pointer" }}>
            👩‍🏫 Teacher
          </a>
        </li>
        <li>
          <Link to='/classes'>📚 Classes</Link>
        </li>
        <li>
          <Link to='/adpost'>📌 Post Resources</Link>
        </li>
      </ul>

      {/* Desktop right side buttons */}
      <div className={styles.navRight}>
        <Link to='/teacher/login' className={styles.teacherBtn}>
          👩‍🏫 Teacher Login
        </Link>
        <Link to='/register' className={styles.cta}>
          Get Started →
        </Link>
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
              🏠 Home
            </a>
          </li>
          <li>
            <a onClick={() => scrollTo("tutors")} style={{ cursor: "pointer" }}>
              👩‍🏫 Tutors
            </a>
          </li>
          <li>
            <Link to='/classes'>📚 Classes</Link>
          </li>
          <li>
            <Link to='/adpost'>📌 Post Ad</Link>
          </li>
          <li>
            <Link to='/teacher/login'>👩‍🏫 Tutor Login</Link>
          </li>
          <li>
            <Link to='/register'>Get Started →</Link>
          </li>
        </ul>
      )}
    </nav>
  );
}
