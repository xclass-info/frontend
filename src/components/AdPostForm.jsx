import { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import styles from "./AdPostForm.module.css";

function formatUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
}

export default function AdPostForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    url: "",
    message: "",
    title: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "", content: "" });
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors({ ...errors, content: "" });
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Required";
    if (!form.email.trim()) newErrors.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email";
    if (!form.title.trim()) newErrors.title = "Required";
    if (!imageFile && !form.url.trim() && !form.message.trim()) {
      newErrors.content = "At least one of image, URL, or message is required";
    }
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;

      // Upload image if selected
      if (imageFile) {
        setUploadingImage(true);
        const imageRef = ref(storage, `posts/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
        setUploadingImage(false);
      }

      await addDoc(collection(db, "adposts"), {
        title: form.title,
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        image: imageUrl,
        url: formatUrl(form.url),
        message: form.message || null,
        createdAt: new Date(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <button className={styles.closeBtn} onClick={() => navigate(-1)}>
            ✕
          </button>
          <div className={styles.successEmoji}>🎉</div>
          <h2 className={styles.successTitle}>Ad submitted!</h2>
          <p className={styles.successSub}>
            Your ad has been submitted and will appear on the homepage shortly.
          </p>
          <button
            className='btn-primary'
            onClick={() => {
              setSubmitted(false);
              setForm({
                name: "",
                email: "",
                phone: "",
                url: "",
                message: "",
                title: "",
              });
              setImageFile(null);
              setImagePreview("");
            }}
          >
            Submit another ad
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* X close button */}
        <button className={styles.closeBtn} onClick={() => navigate(-1)}>
          ✕
        </button>

        <h1 className={styles.title}>📌 Post an Ad</h1>
        <p className={styles.sub}>
          Share a resource, announcement, or message with the xclass community.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Section 1 — Contact Info */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>1</span>
              <div>
                <h3 className={styles.sectionTitle}>Contact Info</h3>
                <p className={styles.sectionDesc}>How others can reach you</p>
              </div>
            </div>
            <div className={styles.fields}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Full Name *</label>
                  <input
                    className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                    name='name'
                    value={form.name}
                    onChange={handleChange}
                    placeholder='Jane Smith'
                  />
                  {errors.name && <p className={styles.error}>{errors.name}</p>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Phone <span className={styles.optional}>(optional)</span>
                  </label>
                  <input
                    className={styles.input}
                    name='phone'
                    type='tel'
                    value={form.phone}
                    onChange={handleChange}
                    placeholder='(555) 000-0000'
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email *</label>
                <input
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  name='email'
                  type='email'
                  value={form.email}
                  onChange={handleChange}
                  placeholder='jane@email.com'
                />
                {errors.email && <p className={styles.error}>{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Section 2 — Ad Info */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>2</span>
              <div>
                <h3 className={styles.sectionTitle}>Ad Info</h3>
                <p className={styles.sectionDesc}>
                  At least one of image, URL or message is required
                </p>
              </div>
            </div>

            {errors.content && (
              <p className={`${styles.error} ${styles.contentError}`}>
                ⚠️ {errors.content}
              </p>
            )}

            <div className={styles.fields}>
              {/* Title */}
              <div className={styles.field}>
                <label className={styles.label}>Title *</label>
                <input
                  className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
                  name='title'
                  value={form.title}
                  onChange={handleChange}
                  placeholder='e.g. Python Tutor Available'
                />
                {errors.title && <p className={styles.error}>{errors.title}</p>}
              </div>

              {/* Image upload */}
              <div className={styles.field}>
                <label className={styles.label}>
                  Image <span className={styles.optional}>(optional)</span>
                </label>
                <label className={styles.uploadLabel}>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageChange}
                    className={styles.fileInput}
                  />
                  <div
                    className={`${styles.uploadBox} ${errors.content ? styles.inputError : ""}`}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt='preview'
                        className={styles.imagePreview}
                      />
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <span className={styles.uploadIcon}>📷</span>
                        <span className={styles.uploadText}>
                          Click to upload an image
                        </span>
                        <span className={styles.uploadHint}>
                          PNG, JPG, GIF up to 10MB
                        </span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* URL */}
              <div className={styles.field}>
                <label className={styles.label}>
                  Link URL <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  className={`${styles.input} ${errors.content ? styles.inputError : ""}`}
                  name='url'
                  value={form.url}
                  onChange={handleChange}
                  placeholder='https://example.com'
                />
              </div>

              {/* Message */}
              <div className={styles.field}>
                <label className={styles.label}>
                  Message <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  className={`${styles.input} ${styles.textarea} ${errors.content ? styles.inputError : ""}`}
                  name='message'
                  value={form.message}
                  onChange={handleChange}
                  placeholder='Share something with the community...'
                  rows={4}
                />
              </div>
            </div>
          </div>

          <button className='btn-primary' type='submit' disabled={loading}>
            {uploadingImage
              ? "Uploading image..."
              : loading
                ? "Submitting..."
                : "Submit Ad →"}
          </button>
        </form>
      </div>
    </div>
  );
}
