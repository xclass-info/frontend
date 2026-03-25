import styles from "./Footer.module.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Logo & description */}
        <div className={styles.brand}>
          <Link to='/' className={styles.logo}>
            x<span className={styles.logoClass}>class</span>
            <span className={styles.logoInfo}>.info</span>
          </Link>
          <p className={styles.tagline}>
            The best online tutoring platform for students of all ages.
          </p>
        </div>

        {/* Links */}
        <div className={styles.cols}>
          <div className={styles.col}>
            <h4>Platform</h4>
            <a href='#tutors'>Find tutors</a>
            <a href='#subjects'>Browse subjects</a>
            <Link to='/classes'>Live classes</Link>
            <Link to='/teacher/login'>Tutor login</Link>
          </div>
          <div className={styles.col}>
            <h4>Company</h4>
            <a href='#how'>How it works</a>
            <a href='#testimonials'>Reviews</a>
            <a href='#contact'>Contact</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© 2026 xclass.info — All rights reserved</p>
        <div className={styles.bottomLinks}>
          <a href='#'>Privacy Policy</a>
          <a href='#'>Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
