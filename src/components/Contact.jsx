import { useState } from "react";
import emailjs from "@emailjs/browser";
import styles from "./Contact.module.css";

const INFO = [
  {
    icon: "📍",
    label: "Location",
    value:
      "0.3 mile to Longfellow Middle school, Falls Church, VA, 22043 · Also fully online",
  },
  { icon: "📧", label: "Email", value: "happyprogramming.us@gmail.com" },
  { icon: "📞", label: "Phone", value: "(703) 300-0061" },
  { icon: "🕐", label: "Hours", value: "Mon–Fri · 10am–6pm EST" },
];

export default function Contact() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    grade: "",
    interest: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await emailjs.send(
        "service_wr9xuo9",
        "template_hnijil2",
        {
          from_name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          phone: form.phone,
          grade: form.grade,
          interest: form.interest,
          message: form.message,
        },
        "JONB48oxCEi-3bv9i",
      );
      setSent(true);
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id='contact' className={styles.section}>
      <div className={styles.inner}>
        <div className='reveal'>
          <div className='section-label'>Contact</div>
          <h2>Ready to Start?</h2>
          <p className='section-sub'>
            Reach out and we'll help you pick the right course. We reply within
            one business day.
          </p>
          <div className={styles.infoList}>
            {INFO.map((item) => (
              <div key={item.label} className={styles.infoItem}>
                <div className={styles.infoIcon}>{item.icon}</div>
                <div>
                  <h4>{item.label}</h4>
                  <p>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.formCard} reveal`}>
          <h3>Get In Touch</h3>
          <p className={styles.formSub}>
            Tell us about your goals and we'll find the perfect fit.
          </p>

          {sent ? (
            <div className={styles.success}>
              <div className={styles.successIcon}>🎉</div>
              <h4>Message sent!</h4>
              <p>
                We'll get back to you within one business day. Welcome to Happy
                AI!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.fg}>
                  <label>First Name</label>
                  <input
                    name='firstName'
                    placeholder='Alex'
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.fg}>
                  <label>Last Name</label>
                  <input
                    name='lastName'
                    placeholder='Johnson'
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className={styles.fg}>
                <label>Email</label>
                <input
                  name='email'
                  type='email'
                  placeholder='alex@email.com'
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.fg}>
                <label>Phone Number</label>
                <input
                  name='phone'
                  type='tel'
                  placeholder='(703) 000-0192'
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.fg}>
                <label>Grade Level</label>
                <select
                  name='grade'
                  value={form.grade}
                  onChange={handleChange}
                  required
                >
                  <option value=''>Select grade...</option>
                  <option>Grade 7</option>
                  <option>Grade 8</option>
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>
              <div className={styles.fg}>
                <label>I'm interested in</label>
                <select
                  name='interest'
                  value={form.interest}
                  onChange={handleChange}
                  required
                >
                  <option value=''>Select...</option>
                  <option>Intro to Python</option>
                  <option>Intro to Java</option>
                  <option>AI Camp I - AI explore</option>
                  <option>AI Camp I - Computer Vision</option>
                  <option>AI Camp III - Generative AI (LLM)</option>
                  <option>Research Camp</option>
                  <option>Private Lessons</option>
                  <option>Others</option>
                </select>
              </div>
              <div className={styles.fg}>
                <label>Message</label>
                <textarea
                  name='message'
                  placeholder='Questions, goals, or anything else...'
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <button
                type='submit'
                className={styles.submit}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message 🚀"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
