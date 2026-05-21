import styles from "./HowItWorks.module.css";

const STEPS = [
  {
    icon: "🔍",
    title: "Find a tutor",
    desc: "Browse hundreds of expert tutors by subject, rating, price, and availability.",
    color: "#34d399",
  },
  {
    icon: "📅",
    title: "Book a session",
    desc: "Pick a time that works for you and book instantly — no back and forth.",
    color: "#4a8fe2",
  },
  {
    icon: "🎥",
    title: "Learn live",
    desc: "Join your session via our built-in video classroom with chat and whiteboard.",
    color: "#9b6bff",
  },
  {
    icon: "⭐",
    title: "Rate & grow",
    desc: "Leave a review and track your progress over time.",
    color: "#ff6ba8",
  },
];

export default function HowItWorks() {
  return (
    <section id='how' className={styles.section}>
      <div className={styles.inner}>
        <div className={`${styles.top} reveal`}>
          <div className='section-label'>✨ How it works</div>
          <h2>Start learning in minutes 🎯</h2>
          <p className='section-sub'>
            From finding a tutor to your first session — it takes less than 5
            minutes.
          </p>
        </div>

        <div className={styles.grid}>
          {STEPS.map((step, i) => (
            <div key={i} className={`${styles.card} reveal`}>
              {i < STEPS.length - 1 && <div className={styles.connector} />}
              <div
                className={styles.iconBox}
                style={{ background: `${step.color}22`, color: step.color }}
              >
                {step.icon}
              </div>
              <div className={styles.stepNum}>0{i + 1}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
