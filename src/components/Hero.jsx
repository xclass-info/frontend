import styles from "./Hero.module.css";

export default function Hero() {
  return (
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
      <div className={styles.videoOverlay} />
      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.tag}>
            <span className={styles.tagDot} />
            🔬 Online · All ages · Real research
          </div>
          <h1 className={styles.h1}>Turn curiosity into real research 🔬</h1>
          <p className={styles.sub}>
            Get matched 1-on-1 with a PhD mentor for real research, hands-on
            projects, or focused tutoring — in neuroscience, AI,
            bioinformatics, and more.
          </p>
          <div className={styles.actions}>
            <a
              href='#get-started'
              className='btn-primary'
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("get-started");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              style={{ cursor: "pointer" }}
            >
              Get Started {"→"}
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
  );
}
