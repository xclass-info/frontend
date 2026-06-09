import styles from "./Footer.module.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ background: "#00274c", borderTop: "3px solid #ffcb05" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "48px 24px 32px",
          display: "flex",
          gap: 48,
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {/* Logo & description */}
        <div style={{ maxWidth: 300 }}>
          <Link
            to='/'
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              textDecoration: "none",
              color: "white",
              fontFamily: "Fredoka One, cursive",
            }}
          >
            happy<span style={{ color: "#ffcb05" }}>Research</span>
          </Link>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 14,
              lineHeight: 1.7,
              marginTop: 12,
            }}
          >
            Explore fascinating research ideas across science, technology, and
            beyond — spark your curiosity and take your first step into the
            world of real research.
          </p>
          <div style={{ marginTop: 16 }}>
            <a
              href='mailto:happyprogramming.us@gmail.com'
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                textDecoration: "none",
                marginBottom: 8,
              }}
            >
              📧 happyprogramming.us@gmail.com
            </a>
            <a
              href='tel:+15716929109'
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              📞 (571) 692-9109
            </a>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
          <div>
            <h4
              style={{
                color: "#ffcb05",
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 16,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Platform
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link
                to='/research'
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Research
              </Link>
              <Link
                to='/internship'
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Internships
              </Link>
              <Link
                to='/tutors'
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Mentors
              </Link>
              <Link
                to='/gallery'
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Gallery
              </Link>
              <Link
                to='/teacher/login'
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Mentor Login
              </Link>
            </div>
          </div>

          <div>
            <h4
              style={{
                color: "#ffcb05",
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 16,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Company
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link
                to='/about'
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                About Us
              </Link>
              <Link
                to='/contact'
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Contact Us
              </Link>
              <Link
                to='/'
                onClick={() =>
                  setTimeout(() => {
                    const el = document.getElementById("testimonials");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 300)
                }
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Reviews
              </Link>
              <a
                href='#'
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Privacy Policy
              </a>
              <a
                href='#'
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,203,5,0.2)",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 1100,
          margin: "0 auto",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>
          © 2026 HappyResearch — All rights reserved
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          <a
            href='#'
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Privacy Policy
          </a>
          <a
            href='#'
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
