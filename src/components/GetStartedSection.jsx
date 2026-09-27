// src/components/GetStartedSection.jsx
// Homepage entry point offering two paths: browse the structured content
// (Courses/1-1 Learning/Projects/Research), or describe what you need and
// let us follow up - for visitors who'd rather not self-serve.
import { Link } from "react-router-dom";
import styles from "./GetStartedSection.module.css";

export default function GetStartedSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={`${styles.top} reveal`}>
          <div className='section-label'>🚀 Get Started</div>
          <h2>However you'd like to begin</h2>
          <p className='section-sub'>
            Browse what's available, or just tell us what you need - either
            way, we'll help you find the right fit.
          </p>
        </div>

        <div className={styles.grid}>
          <div className={`${styles.card} reveal`}>
            <div className={styles.iconBox} style={{ background: "#4a8fe222", color: "#4a8fe2" }}>
              🔎
            </div>
            <h3 className={styles.cardTitle}>Explore Learning Resources</h3>
            <p className={styles.cardDesc}>
              Browse courses, 1-on-1 mentor sessions, hands-on projects, and
              research opportunities.
            </p>
            <Link to='/explore' className={styles.requestBtn}>
              Explore →
            </Link>
          </div>

          <div className={`${styles.card} reveal`}>
            <div className={styles.iconBox} style={{ background: "#ff9f1c22", color: "#ff9f1c" }}>
              💬
            </div>
            <h3 className={styles.cardTitle}>Tell Us What You Need</h3>
            <p className={styles.cardDesc}>
              Not sure where to start? Describe what you need help with -
              even attach a photo of your homework or project - and we'll
              point you in the right direction.
            </p>
            <Link to='/tell-us-what-you-need' className={styles.requestBtn}>
              Get Started →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
