// src/components/RealWorkSection.jsx
// Real photos on the homepage, showing what Projects/Research/Courses
// actually look like in practice - not just icons or illustrations.
import { Link } from "react-router-dom";
import styles from "./RealWorkSection.module.css";

const ITEMS = [
  {
    to: "/projects",
    photo: "/landing/projects.jpg",
    tag: "💡 Projects",
    title: "Build something real",
    desc: "Hands-on projects you build alongside a mentor, from first idea to a working prototype.",
    link: "Explore Projects →",
  },
  {
    to: "/research",
    photo: "/landing/research.jpg",
    tag: "🔬 Research",
    title: "Do real research",
    desc: "Work 1-on-1 with a mentor on a real research question, from idea to a finished paper.",
    link: "Explore Research →",
  },
  {
    to: "/courses",
    photo: "/landing/courses.jpg",
    tag: "📚 Courses",
    title: "Learn from a mentor",
    desc: "Live online courses taught by mentors who've done the work themselves.",
    link: "Explore Courses →",
  },
];

export default function RealWorkSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={`${styles.top} reveal`}>
          <div className='section-label'>📸 See It In Action</div>
          <h2>This is what it actually looks like</h2>
          <p className='section-sub'>
            Real students, working on real work - not just homework.
          </p>
        </div>

        <div className={styles.grid}>
          {ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`${styles.card} reveal`}
            >
              <img src={item.photo} alt={item.title} className={styles.photo} />
              <div className={styles.overlay}>
                <span className={styles.tag}>{item.tag}</span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.desc}</p>
                <span className={styles.cardLink}>{item.link}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
