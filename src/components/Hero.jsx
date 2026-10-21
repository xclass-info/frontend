import { Link } from "react-router-dom";
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
          <h1 className={styles.h1}>From Curiosity to Real Results.</h1>
          <p className={styles.sub}>
            Connect with PhD and faculty mentors from top research
            universities, explore exciting research opportunities, and turn
            your curiosity into meaningful discoveries.
          </p>
          <div className={styles.actions}>
            <Link to='/research' className='btn-primary'>
              Explore Research Projects {"→"}
            </Link>
            <Link to='/tutors' className='btn-ghost'>
              Find Your Mentor {"→"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
