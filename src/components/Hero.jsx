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
          <h1 className={styles.h1}>
            Your Mentor for Research, Projects &amp; 1-on-1 Learning.
          </h1>
          <p className={styles.sub}>
            For high school students: work with a PhD mentor on real
            research, a hands-on project, or focused 1-on-1 tutoring — in any
            subject you're curious about. Don't see your topic? Just tell us
            what you need.
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
