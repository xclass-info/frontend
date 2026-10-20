import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <>
    <section className={styles.hero}>
      <video
        className={styles.videoBg}
        src='/hero-bg.mp4'
        poster='/hero-poster.jpg'
        autoPlay
        muted
        loop
        playsInline
      />
    </section>

    <section className={styles.heroText}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.tag}>
            <span className={styles.tagDot} />
            🔬 Online · All ages · Real research
          </div>
          <h1 className={styles.h1}>Turn curiosity into real research 🔬</h1>
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
              Find a Mentor {"→"}
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
        </div>
      </div>
    </section>
    </>
  );
}
