import { useState } from "react";
import styles from "./Navbar.module.css";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
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
          <a onClick={() => scrollTo("how")} style={{ cursor: "pointer" }}>
            How it works
          </a>
        </li>
        <li>
          <a onClick={() => scrollTo("subjects")} style={{ cursor: "pointer" }}>
            Subjects
          </a>
        </li>
        <li>
          <a onClick={() => scrollTo("tutors")} style={{ cursor: "pointer" }}>
            Tutors
          </a>
        </li>
        <li>
          <Link to='/classes'>📚 Classes</Link>
        </li>
        <li>
          <Link to='/adpost'>📌 Post Ad</Link>
        </li>
      </ul>

      {/* Desktop right side buttons */}
      <div className={styles.navRight}>
        <Link to='/teacher/login' className={styles.teacherBtn}>
          👩‍🏫 Tutor Login
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
            <a onClick={() => scrollTo("how")} style={{ cursor: "pointer" }}>
              How it works
            </a>
          </li>
          <li>
            <a
              onClick={() => scrollTo("subjects")}
              style={{ cursor: "pointer" }}
            >
              Subjects
            </a>
          </li>
          <li>
            <a onClick={() => scrollTo("tutors")} style={{ cursor: "pointer" }}>
              Tutors
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
