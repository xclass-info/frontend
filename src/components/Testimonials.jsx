import styles from "./Testimonials.module.css";

const TESTIMONIALS = [
  {
    quote:
      "I found the perfect math tutor in minutes. My SAT score went up 200 points in just 6 weeks. The live classroom is so easy to use and my tutor was incredibly patient.",
    name: "Emily R.",
    info: "10th Grade · SAT Math Prep",
    initials: "ER",
    gradient: "linear-gradient(135deg, #FF6BA8, #9B6BFF)",
    featured: false,
  },
  {
    quote:
      "xclass matched me with an AI tutor who actually knew what they were teaching. I went from zero Python knowledge to building my own ML model in 8 weeks. Absolutely worth it!",
    name: "Michael T.",
    info: "College Student · Python & AI",
    initials: "MT",
    gradient: "linear-gradient(135deg, #FF6B4A, #FF9F1C)",
    featured: true,
  },
  {
    quote:
      "My daughter's confidence has skyrocketed. Her tutor doesn't just teach — she inspires. We tried other platforms but xclass is in a different league.",
    name: "Lisa K.",
    info: "Parent · 7th Grade Math",
    initials: "LK",
    gradient: "linear-gradient(135deg, #4A8FE2, #2DCB85)",
    featured: false,
  },
];

export default function Testimonials() {
  return (
    <section id='testimonials' className={styles.section}>
      <div className={`${styles.header} reveal`}>
        <div className='section-label' style={{ justifyContent: "center" }}>
          ❤️ Student Stories
        </div>
        <h2>What our students say 🌟</h2>
        <p className='section-sub' style={{ margin: "0 auto" }}>
          Join thousands of happy learners who found their perfect tutor on
          xclass.
        </p>
      </div>
      <div className={styles.grid}>
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            className={`${styles.card} ${t.featured ? styles.featured : ""} reveal`}
          >
            <div className={styles.stars}>★★★★★</div>
            <blockquote>{t.quote}</blockquote>
            <div className={styles.author}>
              <div className={styles.avatar} style={{ background: t.gradient }}>
                {t.initials}
              </div>
              <div>
                <span className={styles.name}>{t.name}</span>
                <span className={styles.info}>{t.info}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
