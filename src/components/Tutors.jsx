// src/components/Tutors.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import styles from "./Tutors.module.css";
import { SkeletonCard } from "./Skeleton";
import { useNavigate } from "react-router-dom";

export default function Tutors() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "teachers"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.log("Teachers loaded:", data);
      setTeachers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <section id='tutors' className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <h2 className={styles.title}>👩‍🏫 Meet Our Tutors</h2>
            <p className={styles.sub}>
              Expert tutors ready to help you learn anything.
            </p>
          </div>
          <div className={styles.grid}>
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id='tutors' className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>👩‍🏫 Meet Our Research Tutors</h2>
          <p className={styles.sub}>
            Join world-class researchers and explore cutting-edge research
            topics that match your passion, curiosity, and future ambitions.
          </p>
        </div>

        {teachers.length === 0 ? (
          <div className={styles.empty}>
            <p>😴 No tutors registered yet. Check back soon!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className={styles.card}
                onClick={() => navigate(`/teacher/${teacher.id}`)}
                style={{ cursor: "pointer" }}
              >
                {/* Avatar */}
                <div className={styles.avatarWrapper}>
                  {teacher.photoURL ? (
                    <img
                      src={teacher.photoURL}
                      alt={teacher.name}
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarFallback}>
                      {teacher.name?.charAt(0).toUpperCase() || "T"}
                    </div>
                  )}
                </div>

                <h3 className={styles.name}>{teacher.name}</h3>

                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  {teacher.gender && (
                    <span
                      style={{
                        fontSize: 11,
                        background: "#f0f4ff",
                        color: "#4a90e2",
                        padding: "2px 10px",
                        borderRadius: 20,
                        fontWeight: 600,
                      }}
                    >
                      {teacher.gender === "Male" ? "👨" : "👩"} {teacher.gender}
                    </span>
                  )}
                  {teacher.degree && (
                    <span
                      style={{
                        fontSize: 11,
                        background: "#f0fdf4",
                        color: "#16a34a",
                        padding: "2px 10px",
                        borderRadius: 20,
                        fontWeight: 600,
                      }}
                    >
                      🎓 {teacher.degree}
                    </span>
                  )}
                </div>

                {teacher.expertise && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "#555",
                      marginBottom: 6,
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    💡 {teacher.expertise}
                  </p>
                )}

                {teacher.bio && <p className={styles.bio}>{teacher.bio}</p>}

                {teacher.projects && teacher.projects.length > 0 && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#888",
                      marginBottom: 6,
                      textAlign: "center",
                    }}
                  >
                    💡 {teacher.projects.length} project idea
                    {teacher.projects.length > 1 ? "s" : ""} available
                  </p>
                )}

                <div className={styles.rating}>
                  <span className={styles.stars}>
                    {"★".repeat(Math.round(teacher.rating || 0))}
                    {"☆".repeat(5 - Math.round(teacher.rating || 0))}
                  </span>
                  <span className={styles.ratingNum}>
                    {teacher.rating ? teacher.rating.toFixed(1) : "New"}
                  </span>
                </div>

                <p style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>
                  Click to view full profile →
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
