import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import styles from "./Hero.module.css";

function mentorTags(teacher) {
  const raw = [teacher.expertise, teacher.researchArea]
    .filter(Boolean)
    .flatMap((s) => s.split(/&|,|\//))
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(raw)].slice(0, 4);
}

function mentorBadge(teacher) {
  if (typeof teacher.rating === "number" && teacher.rating >= 4.5) {
    return "Top Rated";
  }
  if (/phd|doctor/i.test(teacher.degree || "")) return "PhD Mentor";
  return "Featured Mentor";
}

function mentorStats(teacher) {
  const stats = [];
  if (typeof teacher.rating === "number") {
    stats.push([`${teacher.rating.toFixed(1)}★`, "Rating"]);
  }
  if (teacher.yearsOfExperience) {
    stats.push([teacher.yearsOfExperience, "Years exp."]);
  }
  if (/phd|doctor/i.test(teacher.degree || "")) {
    stats.push(["PhD", "Degree"]);
  } else if (teacher.degree) {
    stats.push([teacher.degree.split(" ")[0], "Degree"]);
  }
  if (teacher.projects?.length) {
    stats.push([`${teacher.projects.length}`, "Project ideas"]);
  }
  return stats.slice(0, 3);
}

export default function Hero() {
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "teachers"), (snapshot) => {
      const data = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => !t.disabled && t.name);
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
        {mentor && (
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
                  <div className={styles.tutorAvatar}>🧑‍🔬</div>
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

            {/* Live session pill */}
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
          </div>
        )}
      </div>
    </section>
  );
}
