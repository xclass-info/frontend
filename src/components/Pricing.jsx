import styles from "./Pricing.module.css";

const PLANS = [
  {
    name: "Starter",
    price: "299",
    period: "per course · one-time",
    features: [
      "Access to 1 course of your choice",
      "Weekly group sessions (2hrs)",
      "Project feedback from instructor",
      "Course completion certificate",
      "Community Discord access",
    ],
    btnClass: "outline",
    featured: false,
  },
  {
    name: "Academy",
    price: "599",
    period: "per semester · 2 courses",
    features: [
      "Access to any 2 courses",
      "Weekly group sessions (2hrs)",
      "1-on-1 mentor check-in monthly",
      "Priority project feedback",
      "Portfolio review & coaching",
      "Certificate + LinkedIn badge",
    ],
    btnClass: "fill",
    featured: true,
  },
  {
    name: "Private",
    price: "200",
    period: "per session · 1 hr",
    features: [
      "100% personalized to you",
      "Choose any topic or project",
      "Flexible scheduling",
      "Dedicated expert mentor",
      "Session notes & resources",
    ],
    btnClass: "outline",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id='pricing' className={styles.section}>
      <div className='reveal' style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className='section-label'>Pricing</div>
        <h2>Simple, Transparent Pricing</h2>
        <p className='section-sub'>
          No hidden fees. Pick the plan that fits your goals and schedule.
        </p>
      </div>
      <div className={styles.grid}>
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`${styles.card} ${plan.featured ? styles.featured : ""} reveal`}
          >
            {plan.featured && (
              <div className={styles.popularBadge}>MOST POPULAR</div>
            )}
            <div className={styles.name}>{plan.name}</div>
            <div className={styles.price}>
              <span>$</span>
              {plan.price}
            </div>
            <div className={styles.period}>{plan.period}</div>
            <ul className={styles.features}>
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a
              href='#contact'
              className={`${styles.btn} ${styles[plan.btnClass]}`}
            >
              {plan.featured
                ? "Enroll Now"
                : plan.name === "Private"
                  ? "Book a Session"
                  : "Get Started"}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
