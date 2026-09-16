import styles from "./HowItWorks.module.css";

const STEPS = [
  {
    icon: "🔍",
    title: "Choose a research area",
    desc: "Pick from neuroscience, AI, public health, bioinformatics, and more.",
    color: "#34d399",
  },
  {
    icon: "🧑‍🔬",
    title: "Get matched with a mentor",
    desc: "Connect with a PhD mentor from a top university who guides your project.",
    color: "#4a8fe2",
  },
  {
    icon: "🎥",
    title: "Do the research",
    desc: "Work 1-on-1 with your mentor via live video sessions, chat, and shared docs.",
    color: "#9b6bff",
  },
  {
    icon: "📄",
    title: "Present & publish",
    desc: "Turn your project into a paper, presentation, or portfolio piece.",
    color: "#ff6ba8",
  },
];

export default function HowItWorks() {
  return (
    <section id='how' className={styles.section}>
      <div className={styles.inner}>
        <div className={`${styles.top} reveal`}>
          <div className='section-label'>✨ How it works</div>
          <h2>From curiosity to research 🎯</h2>
          <p className='section-sub'>
            From choosing a research area to your first mentor session — it
            takes less than 5 minutes to get started.
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
