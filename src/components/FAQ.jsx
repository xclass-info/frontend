import { useState } from "react";
import styles from "./FAQ.module.css";

const FAQS = [
  {
    q: "Do I need any prior experience to enroll?",
    a: "Not at all! Our Beginner courses (Intro to Python, Intro to Java, Web Development) are designed for students with zero experience. We start from the very basics and build up from there.",
  },
  {
    q: "What age group do you teach?",
    a: "Our programs are designed for middle and high school students in grades 7–12. All content, pacing, and projects are tailored to this age group.",
  },
  {
    q: "Are classes in-person or online?",
    a: "We offer both! Group courses are available in-person at our Mclean, VA location and fully online. Private lessons can be done either way — your choice.",
  },
  {
    q: "How many students are in each class?",
    a: "We cap group courses at 8 students to ensure every student gets personal attention from the instructor. For private lessons, it's just you and your mentor.",
  },
  {
    q: "Will I get a certificate when I finish?",
    a: "Yes! All students who complete a course receive a certificate of completion. Academy plan students also receive a LinkedIn badge they can add to their profile.",
  },
  {
    q: "When do new cohorts start?",
    a: "New cohorts begin every 6 weeks. Seats are limited, so we recommend enrolling early. Reach out via the contact form and we'll let you know the next available start date.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section id='faq' className={styles.section}>
      <div className={`${styles.header} reveal`}>
        <div className='section-label'>FAQ</div>
        <h2>Frequently Asked Questions</h2>
      </div>
      <div className={styles.list}>
        {FAQS.map((item, i) => (
          <div key={i} className={styles.item}>
            <button
              className={styles.question}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span>{item.q}</span>
              <span
                className={`${styles.icon} ${open === i ? styles.iconOpen : ""}`}
              >
                +
              </span>
            </button>
            <div
              className={`${styles.answer} ${open === i ? styles.answerOpen : ""}`}
            >
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
