import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import styles from "./Hero.module.css";
import InitialsAvatar from "./InitialsAvatar";
import { mentorTags, mentorBadge, mentorStats } from "../utils/mentorCard";

export default function Hero() {
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "teachers"), (snapshot) => {
      const data = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (t) => !t.disabled && t.name && t.verificationStatus === "approved",
        );
      data.sort((a, b) => {
        const ratingA = typeof a.rating === "number" ? a.rating : -1;
        const ratingB = typeof b.rating === "number" ? b.rating : -1;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return (b.photoURL ? 1 : 0) - (a.photoURL ? 1 : 0);
      });
      setMentor(data[0] || null);
    });
    return () => unsub();
  }, []);

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
      </div>
    </section>

    {mentor && (
      <section className={styles.mentorShowcase}>
        <div className={styles.visual}>
          {/* Mentor card */}
          <div className={styles.terminal}>
            <div className={styles.termBar}>
              {mentor.photoURL ? (
                <img
                  src={mentor.photoURL}
                  alt={mentor.name}
                  className={styles.tutorAvatar}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <InitialsAvatar
                  name={mentor.name}
                  seed={mentor.id}
                  className={styles.tutorAvatar}
                  fontSize='1.1rem'
                />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className={styles.tutorName}>{mentor.name}</div>
                <div
                  className={styles.tutorSubject}
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {(mentor.expertise || mentor.researchArea || "Research Mentor").trim()}
                </div>
              </div>
              <div className={styles.tutorBadge}>{mentorBadge(mentor)}</div>
            </div>
            <div className={styles.termBody}>
              <div className={styles.tutorStats}>
                {mentorStats(mentor).map(([num, label]) => (
                  <div className={styles.tutorStat} key={label}>
                    <span className={styles.tutorStatNum}>{num}</span>
                    <span className={styles.tutorStatLabel}>{label}</span>
                  </div>
                ))}
              </div>
              <div className={styles.tutorTags}>
                {mentorTags(mentor).map((t) => (
                  <span key={t} className={styles.tutorTag}>
                    {t}
                  </span>
                ))}
              </div>
              <button
                className={styles.bookBtn}
                onClick={() => navigate(`/teacher/${mentor.id}`)}
              >
                View Profile →
              </button>
            </div>
          </div>
        </div>
      </section>
      )}

      {mentor && (
      <section className={styles.liveSession}>
        <div className={styles.aiPill}>
          <div className={styles.aiIcon}>🔬</div>
          <div>
            <strong>Live Session in Progress</strong>
            <p>
              {mentorTags(mentor)[0] || "Research"} Journal Club · 8
              students joined
            </p>
          </div>
          <div className={styles.liveDot} />
        </div>
      </section>
      )}
    </>
  );
}
