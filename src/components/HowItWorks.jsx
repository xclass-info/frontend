import styles from "./HowItWorks.module.css";

const STEPS = [
  {
    icon: "🔍",
    title: "Pick your path",
    desc: "Browse Research, Projects, or 1-on-1 Learning — or tell us what you need and we'll help you find the right fit.",
    color: "#427e94",
  },
  {
    icon: "🧑‍🔬",
    title: "Get matched with a mentor",
    desc: "Connect with a PhD mentor from a top university who reviews your request and confirms your spot.",
    color: "#9a772b",
  },
  {
    icon: "🎥",
    title: "Work together",
    desc: "Meet with your mentor via live video sessions, chat, and shared docs — guided every step of the way.",
    color: "#427e94",
  },
  {
    icon: "📄",
    title: "Walk away with something real",
    desc: "A finished paper, a project you built, or a skill you finally understand — your call.",
    color: "#9a772b",
  },
];

export default function HowItWorks() {
  return (
    <section id='how' className={styles.section}>
      <div className={styles.inner}>
        <div className={`${styles.top} reveal`}>
          <div className='section-label'>✨ How it works</div>
          <h2>From interest to real work 🎯</h2>
          <p className='section-sub' style={{ margin: "0 auto" }}>
            Whether it's a research paper, a hands-on project, or 1-on-1
            help — here's what to expect, start to finish.
          </p>
        </div>

        <div className={`${styles.banner} reveal`}>
          <img
            src='/photos/howitworks-banner.jpg'
            alt='A mentor explaining a concept to a student in person'
            className={styles.bannerImg}
          />
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
