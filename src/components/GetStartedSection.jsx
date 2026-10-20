// src/components/GetStartedSection.jsx
// Homepage entry point offering two paths: browse the structured content
// (1-1 Learning/Projects/Research), or describe what you need and let us
// follow up - for visitors who'd rather not self-serve.
import { Link } from "react-router-dom";
import styles from "./GetStartedSection.module.css";

export default function GetStartedSection() {
  return (
    <section className={styles.section}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className='section-label'>🚀 Get Started</div>
          <h2>However you'd like to begin</h2>
          <p className='section-sub'>
            Browse what's available, or just tell us what you need - either
            way, we'll help you find the right fit.
          </p>
        </div>

        <div className={styles.grid}>
          <Link
            to='/research'
            className={styles.bigButton}
            style={{ "--btn-accent": "#6d3f6b" }}
          >
            🔬 Research
          </Link>

          <Link
            to='/projects'
            className={styles.bigButton}
            style={{ "--btn-accent": "#8a6a25" }}
          >
            💡 Project
          </Link>

          <Link
            to='/tutors'
            className={styles.bigButton}
            style={{ "--btn-accent": "#a0527a" }}
          >
            🧑‍🏫 1-on-1 Learning
          </Link>

          <Link
            to='/tell-us-what-you-need'
            className={styles.bigButton}
            style={{ "--btn-accent": "#9a772b" }}
          >
            💬 On-demand Learning
          </Link>
        </div>
      </div>
    </section>
  );
}
