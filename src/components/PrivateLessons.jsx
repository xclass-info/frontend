import styles from "./PrivateLessons.module.css";

const FEATURES = [
  {
    icon: "🎯",
    title: "Fully Personalized",
    desc: "Sessions are tailored entirely to your goals, pace, and project — no fixed curriculum.",
    color: "#FF6B4A",
    bg: "rgba(255,107,74,0.1)",
  },
  {
    icon: "🗓️",
    title: "Flexible Scheduling",
    desc: "Book sessions when it suits you — evenings, weekends, or after school.",
    color: "#4A8FE2",
    bg: "rgba(74,143,226,0.1)",
  },
  {
    icon: "⚡",
    title: "Expert Instructors",
    desc: "Work directly with engineers who build AI and software for a living.",
    color: "#FFD23F",
    bg: "rgba(255,210,63,0.1)",
  },
  {
    icon: "📁",
    title: "Session Resources",
    desc: "Every session ends with notes, code snippets, and resources to keep you progressing.",
    color: "#2DCB85",
    bg: "rgba(45,203,133,0.1)",
  },
];

export default function PrivateLessons() {
  return (
    <section id='private' className={styles.section}>
      <div className={styles.inner}>
        <div className='reveal'>
          <div className='section-label'>Private Lessons</div>
          <h2>One-on-One Mentorship</h2>
          <p className='section-sub'>
            For students who want personalized attention, faster progress, or
            help with a specific school courses/tests, project or concept.
          </p>
          <div className={styles.features}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.feat}>
                <div
                  className={styles.featIcon}
                  style={{ background: f.bg, borderColor: f.color }}
                >
                  {f.icon}
                </div>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='reveal'>
          <div className={styles.visual}>
            <div className={styles.mentorCard}>
              <div className={styles.avatar}>DR</div>
              <div className={styles.mentorInfo}>
                <strong>Dr. Reyes</strong>
                <span>AI Researcher · 8 yrs experience</span>
              </div>
              <span className={styles.avail}>● Available</span>
            </div>
            <div className={styles.detailsGrid}>
              {[
                ["Duration", "1 hr"],
                ["Rate", "$100"],
                ["Format", "Online / In-person"],
                ["Topics", "Any"],
              ].map(([label, val]) => (
                <div key={label} className={styles.detail}>
                  <div className={styles.detailLabel}>{label}</div>
                  <div className={styles.detailVal}>{val}</div>
                </div>
              ))}
            </div>
            <a href='#contact' className={styles.bookBtn}>
              Book a Private Session →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
