import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Open email client with prefilled content
    const mailtoLink = `mailto:happyresearchinfo@gmail.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.location.href = mailtoLink;
    setSubmitted(true);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Navbar />
      <div
        style={{ maxWidth: 600, margin: "0 auto", padding: "100px 24px 48px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
            📬 Contact Us
          </h1>
          <p style={{ color: "#666" }}>
            Have questions? We'd love to hear from you!
          </p>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            marginBottom: 24,
          }}
        >
          <h3 style={{ margin: "0 0 20px", fontSize: 16 }}>📋 Get in Touch</h3>

          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 24 }}>📧</span>
            <div>
              <p
                style={{
                  fontSize: 12,
                  color: "#aaa",
                  margin: "0 0 2px",
                  fontWeight: 600,
                }}
              >
                Email
              </p>
              <a
                href='mailto:happyrprogramming.us@gmail.com'
                style={{ fontSize: 15, color: "#4a90e2", fontWeight: 600 }}
              >
                happyrprogramming.us@gmail.com
              </a>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 24 }}>📞</span>
            <div>
              <p
                style={{
                  fontSize: 12,
                  color: "#aaa",
                  margin: "0 0 2px",
                  fontWeight: 600,
                }}
              >
                Phone
              </p>
              <a
                href='tel:+15716929109'
                style={{ fontSize: 15, color: "#4a90e2", fontWeight: 600 }}
              >
                (571) 692-9109
              </a>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: 24 }}>🌐</span>
            <div>
              <p
                style={{
                  fontSize: 12,
                  color: "#aaa",
                  margin: "0 0 2px",
                  fontWeight: 600,
                }}
              >
                Website
              </p>
              <a
                href='https://happyresearch.org'
                style={{ fontSize: 15, color: "#4a90e2", fontWeight: 600 }}
              >
                happyresearch.org
              </a>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          }}
        >
          <h3 style={{ margin: "0 0 20px", fontSize: 16 }}>
            ✉️ Send us a Message
          </h3>

          {submitted ? (
            <div style={{ textAlign: "center", padding: 32 }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>✅</p>
              <h3>Message Sent!</h3>
              <p style={{ color: "#888" }}>
                Thank you for reaching out. We'll get back to you soon!
              </p>
              <button
                onClick={() => setSubmitted(false)}
                style={{
                  marginTop: 16,
                  padding: "10px 24px",
                  borderRadius: 8,
                  border: "none",
                  background: "#4a90e2",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontSize: 13,
                    color: "#555",
                    fontWeight: 600,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Your Name *
                </label>
                <input
                  name='name'
                  value={form.name}
                  onChange={handleChange}
                  placeholder='Your full name'
                  required
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontSize: 13,
                    color: "#555",
                    fontWeight: 600,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Email *
                </label>
                <input
                  name='email'
                  type='email'
                  value={form.email}
                  onChange={handleChange}
                  placeholder='your@email.com'
                  required
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontSize: 13,
                    color: "#555",
                    fontWeight: 600,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Subject *
                </label>
                <input
                  name='subject'
                  value={form.subject}
                  onChange={handleChange}
                  placeholder='How can we help?'
                  required
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    fontSize: 13,
                    color: "#555",
                    fontWeight: 600,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Message *
                </label>
                <textarea
                  name='message'
                  value={form.message}
                  onChange={handleChange}
                  placeholder='Tell us more about your question or inquiry...'
                  rows={6}
                  required
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    fontSize: 14,
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>

              <button
                type='submit'
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 10,
                  border: "none",
                  background: "#4a90e2",
                  color: "white",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Send Message 📬
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
