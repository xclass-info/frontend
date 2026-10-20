import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import styles from "./ActiveEnrolling.module.css";
import InitialsAvatar from "./InitialsAvatar";
import { formatMentorName } from "../utils/mentorName";
import { mentorBadge } from "../utils/mentorCard";

function Card({ mentor, openKind, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.top}>
        {mentor.photoURL ? (
          <img
            src={mentor.photoURL}
            alt={mentor.name}
            className={styles.avatar}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <InitialsAvatar
            name={mentor.name}
            seed={mentor.id}
            className={styles.avatar}
            fontSize='1rem'
          />
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className={styles.name}>
            {formatMentorName(mentor.name, {
              mentorType: mentor.mentorType,
              degree: mentor.degree,
            })}
          </div>
          <div className={styles.subject}>
            {(mentor.expertise || mentor.researchArea || "Research Mentor").trim()}
          </div>
        </div>
      </div>
      <div className={styles.badge}>{mentorBadge(mentor)}</div>
      <div className={styles.openLine}>
        <span className={styles.liveDot} />
        Enrolling now · {openKind}
      </div>
    </div>
  );
}

export default function ActiveEnrolling() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [research, setResearch] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "teachers"), (snapshot) => {
      setTeachers(
        snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((t) => !t.disabled && t.name && t.verificationStatus === "approved"),
      );
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "research"), (snapshot) => {
      setResearch(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "projects"), (snapshot) => {
      setProjects(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const enrolling = useMemo(() => {
    const openResearch = new Set();
    research.forEach((r) => {
      const left = (r.seats || 0) - (r.enrolledCount || 0);
      if (r.status === "published" && left > 0) openResearch.add(r.teacherId);
    });
    const openProjects = new Set();
    projects.forEach((p) => {
      const left = (p.seats || 0) - (p.enrolledCount || 0);
      if (left > 0) openProjects.add(p.teacherId);
    });

    return teachers
      .filter((t) => openResearch.has(t.id) || openProjects.has(t.id))
      .map((t) => {
        const hasResearch = openResearch.has(t.id);
        const hasProject = openProjects.has(t.id);
        const openKind =
          hasResearch && hasProject
            ? "Research & Project"
            : hasResearch
              ? "Research"
              : "Project";
        return { mentor: t, openKind };
      });
  }, [teachers, research, projects]);

  if (enrolling.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={`${styles.header} reveal`}>
        <div className='section-label' style={{ justifyContent: "center" }}>
          📬 Active Enrolling
        </div>
        <h2>Mentors taking students right now</h2>
        <p className='section-sub' style={{ margin: "0 auto" }}>
          These mentors have open seats in a research or project opening today.
        </p>
      </div>

      <div className={`${styles.marqueeWrap} reveal`}>
        <div className={styles.track}>
          {enrolling.map(({ mentor, openKind }) => (
            <Card
              key={`a-${mentor.id}`}
              mentor={mentor}
              openKind={openKind}
              onClick={() => navigate(`/teacher/${mentor.id}`)}
            />
          ))}
          {enrolling.map(({ mentor, openKind }) => (
            <Card
              key={`b-${mentor.id}`}
              mentor={mentor}
              openKind={openKind}
              onClick={() => navigate(`/teacher/${mentor.id}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
