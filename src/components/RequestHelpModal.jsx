// src/components/RequestHelpModal.jsx
// "Tell us what you need" - a free-text (+ optional photo) request that gets
// emailed straight to the team, for visitors who don't want to browse
// Courses/Projects/Research/1-1 themselves and would rather just describe
// what they need help with.
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

const MAX_IMAGE_MB = 5;

export default function RequestHelpModal({ onClose }) {
  const [form, setForm] = useState({ name: "", email: "", details: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors({ ...errors, image: "Please attach an image file." });
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors({ ...errors, image: `Image must be under ${MAX_IMAGE_MB}MB.` });
      return;
    }
    setErrors({ ...errors, image: "" });
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.details.trim()) e.details = "Please describe what you need";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      let imageUrl = "";
      if (imageFile) {
        const imageRef = ref(
          storage,
          `requests/${Date.now()}_${imageFile.name}`,
        );
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          subject: "New request: Tell us what you need",
          message:
            form.details.trim() +
            (imageUrl ? `\n\nAttached image: ${imageUrl}` : ""),
          to_email: "happyprogramming.us@gmail.com",
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );
      setDone(true);
    } catch (err) {
      console.error(err);
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: `1px solid ${hasError ? "#e74c3c" : "#ddd"}`,
    marginBottom: 4,
    boxSizing: "border-box",
    fontSize: 14,
    fontFamily: "inherit",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 32,
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <p style={{ fontSize: 48 }}>✅</p>
            <h3>Got it!</h3>
            <p style={{ color: "#888", marginBottom: 20 }}>
              We'll follow up at {form.email} to help find the right fit.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: "10px 24px",
                borderRadius: 8,
                border: "none",
                background: "#00274c",
                color: "white",
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <h3 style={{ margin: 0 }}>💬 Tell Us What You Need</h3>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>
              Not sure where to start? Describe what you need help with and
              we'll point you in the right direction.
            </p>

            <form onSubmit={handleSubmit}>
              <input
                placeholder="Your name"
                name="name"
                value={form.name}
                onChange={handleChange}
                style={inputStyle(errors.name)}
              />
              {errors.name && (
                <p style={{ color: "#e74c3c", fontSize: 12, margin: "0 0 8px" }}>
                  {errors.name}
                </p>
              )}

              <input
                placeholder="Your email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                style={inputStyle(errors.email)}
              />
              {errors.email && (
                <p style={{ color: "#e74c3c", fontSize: 12, margin: "0 0 8px" }}>
                  {errors.email}
                </p>
              )}

              <textarea
                placeholder="What do you need help with? (a course, a project idea, homework, exam prep, anything)"
                name="details"
                value={form.details}
                onChange={handleChange}
                rows={5}
                style={{ ...inputStyle(errors.details), resize: "vertical" }}
              />
              {errors.details && (
                <p style={{ color: "#e74c3c", fontSize: 12, margin: "0 0 8px" }}>
                  {errors.details}
                </p>
              )}

              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  color: "#555",
                  fontWeight: 600,
                  margin: "8px 0 6px",
                }}
              >
                Attach an image (optional) - a photo of homework, a project,
                etc.
              </label>
              {imagePreview ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Attachment preview"
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    style={{
                      background: "none",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      padding: "6px 12px",
                      fontSize: 12,
                      cursor: "pointer",
                      color: "#e74c3c",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ marginBottom: 8, fontSize: 13 }}
                />
              )}
              {errors.image && (
                <p style={{ color: "#e74c3c", fontSize: 12, margin: "0 0 8px" }}>
                  {errors.image}
                </p>
              )}

              {submitError && (
                <p style={{ color: "#e74c3c", fontSize: 13, margin: "8px 0" }}>
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: 12,
                  marginTop: 8,
                  borderRadius: 8,
                  border: "none",
                  background: "#00274c",
                  color: "white",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? "Sending..." : "Send Request"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
