import styles from "./About.module.css";

const FEATURES = [
  {
    icon: "🚀",
    title: "Project-Based Learning",
    desc: "Every course builds toward a real, deployable project you can put on your college application or GitHub.",
  },
  {
    icon: "👨‍🏫",
    title: "Real-World Instructors",
    desc: "Our mentors are active engineers and AI researchers — not just teachers who read from a textbook.",
  },
  {
    icon: "🔬",
    title: "Small Cohorts",
    desc: "Max 8 students per class so every student gets personal attention and support.",
  },
];

const STATS = [
  {
    num: "200+",
    label: "Students have trained with us since we opened",
    color: "cyan",
  },
  {
    num: "4.9★",
    label: "Average instructor rating across all courses",
    color: "purple",
  },
  {
    num: "40+",
    label: "Partner schools across the DC metro area",
    color: "pink",
  },
  {
    num: "100%",
    label: "Of graduates finish with a real deployed project",
    color: "green",
  },
];

export default function About() {
  return (
    <section id='about' className={styles.section}>
      <div className={styles.inner}>
        <div className='reveal'>
          <div className='section-label'>About Us</div>
          <h2>Built for the Next Generation of Builders</h2>
          <p className='section-sub'>
            Happy Programming was founded by experienced engineers and educators
            with a shared belief: every school student deserves access to
            world-class technology education. We empower students to develop
            strong analytical thinking, cultivate curiosity, unlock their
            potential, and create innovative ideas—preparing them to confidently
            navigate the rapidly changing world of technology and inspiring them
            to use their talents to contribute to a better world.
          </p>
          <div className={styles.features}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.feat}>
                <div className={styles.icon}>{f.icon}</div>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`${styles.statsGrid} reveal`}>
          {STATS.map((s) => (
            <div key={s.num} className={styles.stat}>
              <div className={`${styles.statNum} ${styles[s.color]}`}>
                {s.num}
              </div>
              <p>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
