import { useState } from "react";
import styles from "./Navbar.module.css";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Replace with this:
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
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
        happy<span className={styles.logoClass}>Research</span>
        {/* <span className={styles.logoInfo}>.org</span> */}
      </Link>

      <ul className={styles.links}>
        <li>
          <a onClick={scrollToTop} style={{ cursor: "pointer" }}>
            🏠 Home
          </a>
        </li>
        <li>
          <Link to='/internship'>🧪 Internship</Link>
        </li>

        <li>
          <Link to='/research?type=publication'>🔬 Research</Link>
        </li>

        {/* <li>
          <a onClick={() => scrollTo("tutors")} style={{ cursor: "pointer" }}>
            👩‍🏫 Mentor
          </a>
        </li> */}
        <li>
          <Link to='/tutors'>👩‍🏫 Mentor</Link>
        </li>
        <li>
          <Link to='/about'>💡 About Us</Link>
        </li>
        <li>
          <Link to='/contact'>📬 Contact</Link>
        </li>
      </ul>

      {/* Desktop right side buttons */}
      <div className={styles.navRight}>
        <Link to='/teacher/login' className={styles.teacherBtn}>
          👩‍🏫 Mentor Login
        </Link>
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
              🏠 Home
            </a>
          </li>
          <li>
            <Link to='/internship'>🧪 Internship</Link>
          </li>

          <li>
            <Link to='/research?type=publication'>🔬 Research</Link>
          </li>

          <li>
            <a onClick={() => scrollTo("tutors")} style={{ cursor: "pointer" }}>
              👩‍🏫 Mentor
            </a>
          </li>
          <li>
            <Link to='/about'>💡 About Us</Link>
          </li>
          <li>
            <Link to='/contact'>📬 Contact</Link>
          </li>
          <li>
            <Link to='/teacher/login'>👩‍🏫 Mentor Login</Link>
          </li>
          {/* <li>
            <Link to='/register'>Student Login →</Link>
          </li> */}
        </ul>
      )}
    </nav>
  );
}
