import styles from "./ClassPosts.module.css";

const POSTS = [
  {
    title: "Python for Beginners",
    tutor: "James Lee",
    date: "Mon, Mar 25",
    time: "4:00 PM",
    seats: 3,
    price: 20,
    emoji: "🐍",
    tag: "Live",
  },
  {
    title: "SAT Math Prep",
    tutor: "Sarah Johnson",
    date: "Tue, Mar 26",
    time: "6:00 PM",
    seats: 5,
    price: 25,
    emoji: "📐",
    tag: "Upcoming",
  },
  {
    title: "AI & ChatGPT Basics",
    tutor: "James Lee",
    date: "Wed, Mar 27",
    time: "5:00 PM",
    seats: 8,
    price: 30,
    emoji: "🤖",
    tag: "Upcoming",
  },
];

export default function ClassPosts() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={`${styles.top} reveal`}>
          <div className='section-label'>🎥 Upcoming Classes</div>
          <h2>Join a live class today 🎥</h2>
          <p className='section-sub'>
            Book a seat in one of our upcoming group sessions.
          </p>
        </div>

        <div className={styles.grid}>
          {POSTS.map((p) => (
            <div key={p.title} className={`${styles.card} reveal`}>
              <div className={styles.cardTop}>
                <span className={styles.emoji}>{p.emoji}</span>
                <span
                  className={`${styles.tag} ${p.tag === "Live" ? styles.tagLive : styles.tagUpcoming}`}
                >
                  {p.tag === "Live" ? "🔴 Live" : p.tag}
                </span>
              </div>
              <h3 className={styles.title}>{p.title}</h3>
              <p className={styles.tutor}>by {p.tutor}</p>
              <div className={styles.meta}>
                <span>
                  📅 {p.date} at {p.time}
                </span>
                <span>👥 {p.seats} seats left</span>
              </div>
              <div className={styles.footer}>
                <span className={styles.price}>${p.price}</span>
                <button className={styles.bookBtn}>Book seat →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
