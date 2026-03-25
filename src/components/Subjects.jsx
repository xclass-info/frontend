import styles from "./Subjects.module.css";

const SUBJECTS = [
  { icon: "🧮", name: "Mathematics", tutors: 48, color: "#9b6bff" },
  { icon: "🔬", name: "Science", tutors: 36, color: "#4a8fe2" },
  { icon: "💻", name: "Programming", tutors: 62, color: "#ff6ba8" },
  { icon: "🤖", name: "AI & ML", tutors: 24, color: "#ff9f1c" },
  { icon: "📝", name: "English", tutors: 55, color: "#34d399" },
  { icon: "🎨", name: "Design", tutors: 31, color: "#ffd23f" },
  { icon: "🌍", name: "Languages", tutors: 44, color: "#ff6b4a" },
  { icon: "📊", name: "Business", tutors: 28, color: "#4a8fe2" },
];

export default function Subjects() {
  return (
    <section id='subjects' className={styles.section}>
      <div className={styles.inner}>
        <div className={`${styles.top} reveal`}>
          <div className='section-label'>📚 Subjects</div>
          <h2>Learn anything 📚</h2>
          <p className='section-sub'>
            From math to machine learning — we have expert tutors for every
            subject.
          </p>
        </div>

        <div className={styles.grid}>
          {SUBJECTS.map((s) => (
            <div key={s.name} className={`${styles.card} reveal`}>
              <div
                className={styles.iconBox}
                style={{
                  background: `${s.color}22`,
                  color: s.color,
                }}
              >
                {s.icon}
              </div>
              <h3 className={styles.name}>{s.name}</h3>
              <p className={styles.count}>{s.tutors} tutors</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
