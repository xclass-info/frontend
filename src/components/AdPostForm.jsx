import { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import styles from "./AdPostForm.module.css";

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
];

const SUBJECTS = [
  // Elementary (K-5)
  "Early Reading & Phonics",
  "Basic Math",
  "Elementary Writing",
  "Elementary Science",
  "Elementary Social Studies",
  "Elementary Art",
  "Elementary Music",
  "Elementary PE",

  // Middle School (6-8)
  "Pre-Algebra",
  "Algebra I",
  "Geometry",
  "Middle School Science",
  "Middle School English",
  "Middle School History",
  "Middle School Geography",
  "Middle School Spanish",
  "Middle School French",
  "Middle School Art",
  "Middle School Music",

  // High School Math
  "Algebra II",
  "Trigonometry",
  "Pre-Calculus",
  "Calculus",
  "Statistics",
  "AP Calculus AB",
  "AP Calculus BC",
  "AP Statistics",

  // High School Science
  "Biology",
  "Chemistry",
  "Physics",
  "Earth Science",
  "Environmental Science",
  "Anatomy & Physiology",
  "Marine Science",
  "AP Biology",
  "AP Chemistry",
  "AP Physics 1",
  "AP Physics 2",
  "AP Physics C: Mechanics",
  "AP Physics C: E&M",
  "AP Environmental Science",

  // High School English
  "English 9",
  "English 10",
  "English 11",
  "English 12",
  "Grammar & Writing",
  "Creative Writing",
  "Literature",
  "Speech & Debate",
  "Journalism",
  "AP English Language & Composition",
  "AP English Literature & Composition",

  // History & Social Studies
  "World History",
  "US History",
  "Government & Politics",
  "Economics",
  "Psychology",
  "Sociology",
  "Philosophy",
  "AP World History",
  "AP US History",
  "AP Government & Politics",
  "AP Economics (Macro)",
  "AP Economics (Micro)",
  "AP Psychology",
  "AP Human Geography",

  // Computer Science
  "Coding for Kids",
  "Scratch Programming",
  "Python",
  "Java",
  "JavaScript",
  "Web Development",
  "App Development",
  "AI & Machine Learning",
  "Data Science",
  "Cybersecurity",
  "AP Computer Science A",
  "AP Computer Science Principles",

  // Foreign Languages
  "Spanish I",
  "Spanish II",
  "Spanish III",
  "AP Spanish Language",
  "AP Spanish Literature",
  "French I",
  "French II",
  "French III",
  "AP French Language",
  "Chinese (Mandarin) I",
  "Chinese (Mandarin) II",
  "AP Chinese Language",
  "German I",
  "German II",
  "AP German Language",
  "Japanese I",
  "Japanese II",
  "AP Japanese Language",
  "Korean I",
  "Korean II",
  "Latin I",
  "Latin II",
  "AP Latin",
  "Italian I",
  "Arabic I",

  // Arts
  "Visual Art",
  "Drawing & Painting",
  "Sculpture",
  "Photography",
  "Digital Art & Graphic Design",
  "AP Art History",
  "AP Studio Art",
  "Music Theory",
  "Band",
  "Orchestra",
  "Choir",
  "AP Music Theory",
  "Drama & Theater",
  "Dance",

  // Career & Technical Education
  "Business",
  "Accounting",
  "Marketing",
  "Entrepreneurship",
  "Personal Finance",
  "Health Science",
  "Culinary Arts",
  "Engineering & Design",
  "Architecture",
  "Auto Technology",

  // Physical Education & Health
  "Physical Education",
  "Health",
  "Nutrition",
  "Sports Science",

  // Test Prep
  "SAT Prep",
  "ACT Prep",
  "PSAT Prep",
  "AP Exam Prep",
  "ISEE / SSAT Prep",

  // Other
  "Study Skills",
  "Homework Help",
  "Special Education",
  "ESL / English as Second Language",
  "College Counseling",
  "College Essay Writing",
];

function formatUrl(url) {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export default function AdPostForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    url: "",
    message: "",
    title: "",
    subject: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", content: "" }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, content: "" }));
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Required";
    if (!form.email.trim()) {
      newErrors.email = "Required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email";
    }
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
      if (imageFile) {
        setUploadingImage(true);
        const imageRef = ref(storage, `posts/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
        setUploadingImage(false);
      }
      await addDoc(collection(db, "adposts"), {
        title: form.title.trim(),
        subject: form.subject || null,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        state: form.state || null,
        city: form.city.trim() || null,
        image: imageUrl,
        url: formatUrl(form.url),
        message: form.message.trim() || null,
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
          <button
            type='button'
            className={styles.closeBtn}
            onClick={() => navigate(-1)}
            aria-label='Close'
          >
            &times;
          </button>
          <div className={styles.successEmoji}>🎉</div>
          <h2 className={styles.successTitle}>Ad submitted!</h2>
          <p className={styles.successSub}>
            Your ad has been submitted and will appear on the homepage shortly.
          </p>
          <button
            type='button'
            className='btn-primary'
            onClick={() => {
              setSubmitted(false);
              setForm({
                name: "",
                email: "",
                phone: "",
                state: "",
                city: "",
                url: "",
                message: "",
                title: "",
                subject: "",
              });
              setImageFile(null);
              setImagePreview("");
              setErrors({});
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
        <button
          type='button'
          className={styles.closeBtn}
          onClick={() => navigate(-1)}
          aria-label='Close'
        >
          &times;
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

              {/* Subject */}
              <div className={styles.field}>
                <label className={styles.label}>
                  Subject <span className={styles.optional}>(optional)</span>
                </label>
                <select
                  className={styles.input}
                  name='subject'
                  value={form.subject}
                  onChange={handleChange}
                >
                  <option value=''>Select a subject</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image */}
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

              {/* State & City */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    State <span className={styles.optional}>(optional)</span>
                  </label>
                  <select
                    className={styles.input}
                    name='state'
                    value={form.state}
                    onChange={handleChange}
                  >
                    <option value=''>Select a state</option>
                    {US_STATES.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    City <span className={styles.optional}>(optional)</span>
                  </label>
                  <input
                    className={styles.input}
                    name='city'
                    value={form.city}
                    onChange={handleChange}
                    placeholder='e.g. Arlington'
                  />
                </div>
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
