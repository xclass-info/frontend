import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />
      <div className={styles.inner}>
        {/* Left content */}
        <div className={styles.content}>
          <div className={styles.tag}>
            <span className={styles.tagDot} />
            🌍 Online · All ages · Any subject
          </div>
          <h1 className={styles.h1}>
            <span className='grad-text'>
              Learn from the best tutors online 🚀
            </span>
          </h1>
          <p className={styles.sub}>
            Connect with expert tutors for live 1-on-1 sessions, group classes,
            and courses — in any subject, at any level. Start free today!
          </p>
          <div className={styles.actions}>
            <a href='#tutors' className='btn-primary'>
              Find a Tutor →
            </a>
            <a href='#how' className='btn-ghost'>
              How it works
            </a>
          </div>
          <div className={styles.stats}>
            {[
              ["10K+", "Students"],
              ["500+", "Tutors"],
              ["50+", "Subjects"],
              ["4.9★", "Avg rating"],
            ].map(([num, label]) => (
              <div key={label}>
                <div className={styles.statNum}>{num}</div>
                <div className={styles.statLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right visual */}
        <div className={styles.visual}>
          {/* Tutor card */}
          <div className={styles.terminal}>
            <div className={styles.termBar}>
              <div className={styles.tutorAvatar}>👩‍🏫</div>
              <div>
                <div className={styles.tutorName}>Sarah Johnson</div>
                <div className={styles.tutorSubject}>Math & Physics</div>
              </div>
              <div className={styles.tutorBadge}>Top Rated</div>
            </div>
            <div className={styles.termBody}>
              <div className={styles.tutorStats}>
                <div className={styles.tutorStat}>
                  <span className={styles.tutorStatNum}>128</span>
                  <span className={styles.tutorStatLabel}>Sessions</span>
                </div>
                <div className={styles.tutorStat}>
                  <span className={styles.tutorStatNum}>4.9★</span>
                  <span className={styles.tutorStatLabel}>Rating</span>
                </div>
                <div className={styles.tutorStat}>
                  <span className={styles.tutorStatNum}>$45</span>
                  <span className={styles.tutorStatLabel}>Per hour</span>
                </div>
              </div>
              <div className={styles.tutorTags}>
                {["Algebra", "Calculus", "SAT Prep", "AP Physics"].map((t) => (
                  <span key={t} className={styles.tutorTag}>
                    {t}
                  </span>
                ))}
              </div>
              <button className={styles.bookBtn}>Book a Session →</button>
            </div>
          </div>

          {/* Live class pill */}
          <div className={styles.aiPill}>
            <div className={styles.aiIcon}>🎥</div>
            <div>
              <strong>Live Class in Progress</strong>
              <p>Python for Beginners · 12 students joined</p>
            </div>
            <div className={styles.liveDot} />
          </div>
        </div>
      </div>
    </section>
  );
}
