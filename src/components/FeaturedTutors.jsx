import styles from "./FeaturedTutors.module.css";

const TUTORS = [
  {
    name: "Sarah Johnson",
    subject: "Math & Physics",
    rating: 5.0,
    reviews: 128,
    price: 45,
    emoji: "👩‍🏫",
    tag: "Top Rated",
  },
  {
    name: "James Lee",
    subject: "Python & AI",
    rating: 4.9,
    reviews: 96,
    price: 55,
    emoji: "👨‍💻",
    tag: "Popular",
  },
  {
    name: "Maria Garcia",
    subject: "English & Writing",
    rating: 5.0,
    reviews: 214,
    price: 40,
    emoji: "👩‍🎓",
    tag: "Best Value",
  },
  {
    name: "David Chen",
    subject: "Business & Finance",
    rating: 4.8,
    reviews: 73,
    price: 60,
    emoji: "👨‍💼",
    tag: "Expert",
  },
];

export default function FeaturedTutors() {
  return (
    <section id='tutors' className={styles.section}>
      <div className={styles.inner}>
        <div className={`${styles.top} reveal`}>
          <div className='section-label'>🌟 Featured Tutors</div>
          <h2>Meet our top tutors 🌟</h2>
          <p className='section-sub'>
            Handpicked experts with proven track records and glowing reviews.
          </p>
        </div>

        <div className={styles.grid}>
          {TUTORS.map((t) => (
            <div key={t.name} className={`${styles.card} reveal`}>
              <div className={styles.avatarWrap}>
                <div className={styles.avatar}>{t.emoji}</div>
                <span className={styles.tag}>{t.tag}</span>
              </div>
              <h3 className={styles.name}>{t.name}</h3>
              <p className={styles.subject}>{t.subject}</p>
              <div className={styles.stars}>
                {"★★★★★"}
                <span className={styles.rating}>
                  {t.rating} ({t.reviews})
                </span>
              </div>
              <div className={styles.footer}>
                <span className={styles.price}>
                  ${t.price}
                  <span className={styles.perHr}>/hr</span>
                </span>
                <button className={styles.bookBtn}>Book →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
