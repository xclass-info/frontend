import { useState } from "react";
import styles from "./Navbar.module.css";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <a href='#' className={styles.logo}>
        Happy Programming
      </a>

      {/* Desktop links */}
      <ul className={styles.links}>
        <li>
          <a
            href='#courses'
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <span className={styles.fire}>🔥</span>
            <span className={styles.summerLink}>2026 Summer Camp</span>
          </a>
        </li>
        <li>
          <Link to='/classes'>📚 Classes</Link>
        </li>{" "}
        {/* ← added */}
        <li>
          <a href='#private'>Private</a>
        </li>
        <li>
          <a href='#about'>About</a>
        </li>
        <li>
          <a href='#faq'>FAQ</a>
        </li>
      </ul>

      {/* Desktop right side buttons */}
      <div className={styles.navRight}>
        <a href='#contact' className={styles.cta}>
          Contact Us
        </a>
        <Link to='/teacher/login' className={styles.teacherBtn}>
          👩‍🏫 Teacher Login
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
            <a href='#courses'>🔥 2026 Summer Camp</a>
          </li>
          <li>
            <Link to='/classes'>📚 Classes</Link>
          </li>{" "}
          {/* ← added */}
          <li>
            <a href='#private'>Private</a>
          </li>
          <li>
            <a href='#about'>About</a>
          </li>
          <li>
            <a href='#faq'>FAQ</a>
          </li>
          <li>
            <a href='#contact'>Contact Us</a>
          </li>
          <li>
            <Link to='/teacher/login'>👩‍🏫 Teacher Login</Link>
          </li>
        </ul>
      )}
    </nav>
  );
}
