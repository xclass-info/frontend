import styles from "./Footer.module.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Logo & description */}
        <div className={styles.brand}>
          <Link to='/' className={styles.logo}>
            happy<span className={styles.logoClass}>Research</span>
          </Link>
          <p className={styles.tagline}>
            Explore fascinating research ideas across science, technology, and
            beyond — spark your curiosity and take your first step into the
            world of real research.
          </p>
          {/* Contact info */}
          <div style={{ marginTop: 16 }}>
            <a
              href='mailto:happyresearchinfo@gmail.com'
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#aaa",
                fontSize: 14,
                textDecoration: "none",
                marginBottom: 8,
              }}
            >
              📧 happyresearchinfo@gmail.com
            </a>
            <a
              href='tel:+15716929109'
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#aaa",
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              📞 (571) 692-9109
            </a>
          </div>
        </div>

        {/* Links */}
        <div className={styles.cols}>
          <div className={styles.col}>
            <h4>Platform</h4>
            <Link to='/research'>Research</Link>
            <Link to='/internship'>Internships</Link>
            <Link to='/teacher/login'>Mentor Login</Link>
            <Link to='/admin'>Admin</Link>
          </div>
          <div className={styles.col}>
            <h4>Company</h4>
            <Link to='/contact'>Contact Us</Link>
            <a href='#testimonials'>Reviews</a>
            <a href='#'>Privacy Policy</a>
            <a href='#'>Terms of Service</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© 2026 HappyResearch — All rights reserved</p>
        <div className={styles.bottomLinks}>
          <a href='#'>Privacy Policy</a>
          <a href='#'>Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
