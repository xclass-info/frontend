import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ background: "#ffffff", borderTop: "1px solid #d5dde2" }}>
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
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "1.4rem",
              fontWeight: 700,
              textDecoration: "none",
              color: "#1a1a1a",
              fontFamily: "'Source Serif 4', Georgia, serif",
            }}
          >
            <svg width='30' height='30' viewBox='0 0 100 100' aria-hidden='true'>
              <rect width='100' height='100' rx='22' fill='#2f6175' />
              <path
                d='M78,15 L80,20 L85,22 L80,24 L78,29 L76,24 L71,22 L76,20 Z'
                fill='#ffffff'
              />
              <path
                d='M43,17 L57,17 L57,37 L71,78 C72.5,83 69,87 63,87 L37,87 C31,87 27.5,83 29,78 L43,37 Z'
                fill='none'
                stroke='#9a772b'
                strokeWidth='6'
                strokeLinejoin='round'
              />
              <path
                d='M33.5,68 L29,78 C27.5,83 31,87 37,87 L63,87 C69,87 72.5,83 71,78 L66.5,68 Z'
                fill='#ffffff'
              />
              <circle cx='46' cy='76' r='3' fill='#9a772b' />
              <circle cx='56' cy='80' r='2.3' fill='#9a772b' />
              <circle cx='50' cy='71' r='2' fill='#9a772b' />
            </svg>
            happy<span style={{ color: "#2f6175" }}>Research</span>
          </Link>
          <p
            style={{
              color: "#555f66",
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
                color: "#555f66",
                fontSize: 13,
                textDecoration: "none",
                marginBottom: 8,
              }}
            >
              📧 happyprogramming.us@gmail.com
            </a>
            <a
              href='tel:+17033000061'
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#555f66",
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              📞 (703)-300-0061
            </a>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
          <div>
            <h4
              style={{
                color: "#555f66",
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
                  color: "#555f66",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Research
              </Link>
              <Link
                to='/tutors'
                style={{
                  color: "#555f66",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Mentors
              </Link>
              <Link
                to='/gallery'
                style={{
                  color: "#555f66",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Gallery
              </Link>
              <Link
                to='/teacher/login'
                style={{
                  color: "#555f66",
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
                color: "#555f66",
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
                  color: "#555f66",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                About Us
              </Link>
              <Link
                to='/contact'
                style={{
                  color: "#555f66",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Contact Us
              </Link>
              <Link
                to='/become-a-mentor'
                style={{
                  color: "#555f66",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Become a Mentor
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
                  color: "#555f66",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Reviews
              </Link>
              <a
                href='#'
                style={{
                  color: "#555f66",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Privacy Policy
              </a>
              <a
                href='#'
                style={{
                  color: "#555f66",
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
          borderTop: "1px solid #d5dde2",
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
        <p style={{ color: "#8a98a0", fontSize: 13, margin: 0 }}>
          © 2026 HappyResearch — All rights reserved
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          <a
            href='#'
            style={{
              color: "#8a98a0",
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Privacy Policy
          </a>
          <a
            href='#'
            style={{
              color: "#8a98a0",
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
