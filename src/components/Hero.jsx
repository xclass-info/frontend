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
            🔬 Online · All ages · Real research
          </div>
          <h1 className={styles.h1}>
            <span className='grad-text'>
              Turn curiosity into real research 🔬
            </span>
          </h1>
          <p className={styles.sub}>
            Get matched 1-on-1 with a PhD research mentor in neuroscience, AI,
            bioinformatics, and more — and work on real research, not just
            homework.
          </p>
          <div className={styles.actions}>
            <a
              href='#tutors'
              className='btn-primary'
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("tutors");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              style={{ cursor: "pointer" }}
            >
              Find a Mentor {"\u2192"}
            </a>
            <a
              href='#how'
              className='btn-ghost'
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("how");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              style={{ cursor: "pointer" }}
            >
              How it works
            </a>
          </div>
          <div className={styles.stats}>
            {[
              ["5", "Research areas"],
              ["PhD", "Led mentors"],
              ["1:1", "Mentor sessions"],
              ["100%", "Online"],
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
              <div className={styles.tutorAvatar}>🧑‍🔬</div>
              <div>
                <div className={styles.tutorName}>Dr. Sarah Johnson</div>
                <div className={styles.tutorSubject}>Neuroscience Mentor</div>
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
                  <span className={styles.tutorStatNum}>32</span>
                  <span className={styles.tutorStatLabel}>Mentees</span>
                </div>
              </div>
              <div className={styles.tutorTags}>
                {["Cognitive Science", "Neural Circuits", "Neuroimaging", "Mental Health"].map((t) => (
                  <span key={t} className={styles.tutorTag}>
                    {t}
                  </span>
                ))}
              </div>
              <button className={styles.bookBtn}>Book a Session →</button>
            </div>
          </div>

          {/* Live session pill */}
          <div className={styles.aiPill}>
            <div className={styles.aiIcon}>🔬</div>
            <div>
              <strong>Live Session in Progress</strong>
              <p>Neuroscience Journal Club · 8 students joined</p>
            </div>
            <div className={styles.liveDot} />
          </div>
        </div>
      </div>
    </section>
  );
}
