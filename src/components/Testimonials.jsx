import styles from "./Testimonials.module.css";

const TESTIMONIALS = [
  {
    quote:
      "HappyResearch completely changed how I think about science. I worked with Dr. Yang on a covid detection project and actually got to analyze real social media data. I never thought a high schooler like me could do real research!",
    name: "Sophia L.",
    info: "11th Grade · Astrophysics Research Intern",
    initials: "SL",
    gradient: "linear-gradient(135deg, #FF6BA8, #9B6BFF)",
    featured: false,
  },
  {
    quote:
      "I joined the AI research internship not knowing much about machine learning. By the end, I had built my own image classifier and co-authored a research summary. HappyResearch gave me the confidence to apply to top universities with a real research project on my resume.",
    name: "Marcus T.",
    info: "12th Grade · AI & Computer Vision Intern",
    initials: "MT",
    gradient: "linear-gradient(135deg, #FF6B4A, #FF9F1C)",
    featured: true,
  },
  {
    quote:
      "As a parent, I was amazed at how much my daughter grew through HappyResearch. She went from being unsure about her future to presenting her environmental science research at a local symposium. The mentors are world-class and genuinely care about students.",
    name: "Jennifer W.",
    info: "Parent · Environmental Science Program",
    initials: "JW",
    gradient: "linear-gradient(135deg, #4A8FE2, #2DCB85)",
    featured: false,
  },

  {
    quote:
      "I always loved biology but never knew how to turn that passion into something real. Through HappyResearch I worked on a genomics project with Dr. Li and learned bioinformatics tools I never even knew existed. This internship opened my eyes to what a career in science actually looks like.",
    name: "Aiden C.",
    info: "10th Grade · Genomics & Bioinformatics Intern",
    initials: "AC",
    gradient: "linear-gradient(135deg, #11998e, #38ef7d)",
    featured: false,
  },
  {
    quote:
      "HappyResearch matched me with a robotics mentor who was incredibly patient and knowledgeable. I built an autonomous maze-solving robot from scratch over 4 months. I submitted it to my school science fair and won first place. I could not have done this without my mentor's guidance.",
    name: "Priya M.",
    info: "10th Grade · Robotics Research Intern",
    initials: "PM",
    gradient: "linear-gradient(135deg, #f953c6, #b91d73)",
    featured: false,
  },
  {
    quote:
      "I was nervous about doing research as a 10th grader — I thought it was only for college students. But HappyResearch made it so approachable. My mentor Prof. Wang helped me design a real psychology experiment about screen time and attention. I learned more in 3 months than in a whole year of school.",
    name: "Ethan B.",
    info: "10th Grade · Cognitive Psychology Intern",
    initials: "EB",
    gradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
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
          HappyResearch.
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
