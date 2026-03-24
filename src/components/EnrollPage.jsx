import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { COURSES } from "../data/courses";
import styles from "./EnrollPage.module.css";
import emailjs from "@emailjs/browser";

const GRADES = ["7th", "8th", "9th", "10th", "11th", "12th"];

const PAYMENT_METHODS = [
  { id: "zelle", label: "Zelle", detail: "703-300-0061" },
  { id: "paypal", label: "PayPal", detail: "zhenhepan@gmail.com" },
  {
    id: "check",
    label: "Check",
    detail: "Make check payable to Happy EduHub, LLC",
  },
];

export default function EnrollPage() {
  const [loading, setLoading] = useState(false);
  const { courseTitle } = useParams();
  const navigate = useNavigate();
  const course = COURSES.find(
    (c) => c.title === decodeURIComponent(courseTitle),
  );

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    studentFirstName: "",
    studentLastName: "",
    studentGrade: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    payment: "",
  });
  const [errors, setErrors] = useState({});

  if (!course) {
    return (
      <div className={styles.notFound}>
        <p>Course not found.</p>
        <Link to='/' className={styles.backLink}>
          ← Back to courses
        </Link>
      </div>
    );
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function validate() {
    const newErrors = {};
    if (!form.studentFirstName.trim()) newErrors.studentFirstName = "Required";
    if (!form.studentLastName.trim()) newErrors.studentLastName = "Required";
    if (!form.studentGrade) newErrors.studentGrade = "Required";
    if (!form.parentName.trim()) newErrors.parentName = "Required";
    if (!form.parentEmail.trim()) newErrors.parentEmail = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.parentEmail))
      newErrors.parentEmail = "Invalid email";
    if (!form.parentPhone.trim()) newErrors.parentPhone = "Required";
    if (!selectedSlot) newErrors.slot = "Please select a time slot";
    if (!form.payment) newErrors.payment = "Please select a payment method";
    return newErrors;
  }

  const handleConfirm = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const slot = course.slots.find((s) => s.id === selectedSlot);
    const paymentMethod = PAYMENT_METHODS.find((m) => m.id === form.payment);

    setLoading(true);
    try {
      await emailjs.send(
        "service_1ap8j5m",
        "template_j5m56lk",
        {
          // existing fields...
          student_name: `${form.studentFirstName} ${form.studentLastName}`,
          student_grade: form.studentGrade,
          parent_name: form.parentName,
          parent_email: form.parentEmail,
          parent_phone: form.parentPhone,
          course_title: course.title,
          course_price: course.price,
          slot_label: slot.label,
          slot_time: slot.time,
          slot_dates: slot.dates,
          payment_method: paymentMethod.label,
          payment_detail: paymentMethod.detail,

          // ADD THESE to match your template's From Name + Reply To:
          name: form.parentName,
          email: form.parentEmail,
        },

        "JONB48oxCEi-3bv9i",
      );
      setSubmitted(true);
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const slot = course.slots.find((s) => s.id === selectedSlot);
    return (
      <div className={styles.page}>
        <div className={styles.successCard} style={{ "--line": course.line }}>
          <div className={styles.successEmoji}>🎉</div>
          <h2 className={styles.successTitle}>You're enrolled!</h2>
          <p className={styles.successCourse}>
            {course.icon} {course.title}
          </p>
          <div className={styles.successSlot}>
            <span>{slot.label}</span>
            <span>{slot.time}</span>
            <span>{slot.dates}</span>
            <span>
              Payment:{" "}
              {form.payment.charAt(0).toUpperCase() + form.payment.slice(1)}
            </span>
          </div>
          <p className={styles.successNote}>
            We'll send confirmation details to{" "}
            <strong>{form.parentEmail}</strong>.
          </p>
          <button className={styles.backBtn} onClick={() => navigate("/")}>
            ← Back to all courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Back */}
        <Link to='/' className={styles.backLink}>
          ← All courses
        </Link>

        {/* Course summary */}
        <div className={styles.courseCard} style={{ "--line": course.line }}>
          <div className={styles.courseAccent} />
          <div className={styles.courseHeader}>
            <span className={styles.courseIcon}>{course.icon}</span>
            <span className={`${styles.badge} ${styles[course.levelClass]}`}>
              {course.level}
            </span>
          </div>
          <h1 className={styles.courseTitle}>{course.title}</h1>
          <p className={styles.courseDesc}>{course.desc}</p>
          {course.meta && <p className={styles.courseMeta}>⚠️ {course.meta}</p>}
          <p className={styles.coursePrice}>{course.price}</p>
        </div>

        {/* Slot selection */}
        <h2 className={styles.slotsHeading}>Choose a time slot</h2>
        <div className={styles.slots}>
          {course.slots.map((slot) => (
            <label
              key={slot.id}
              className={`${styles.slot} ${selectedSlot === slot.id ? styles.slotSelected : ""}`}
            >
              <input
                type='radio'
                name='slot'
                value={slot.id}
                checked={selectedSlot === slot.id}
                onChange={() => {
                  setSelectedSlot(slot.id);
                  setErrors({ ...errors, slot: "" });
                }}
                className={styles.radioInput}
              />
              <div className={styles.radioCircle}>
                {selectedSlot === slot.id && (
                  <div className={styles.radioDot} />
                )}
              </div>
              <div className={styles.slotInfo}>
                <span className={styles.slotLabel}>{slot.label}</span>
                <span className={styles.slotTime}>{slot.time}</span>
                <span className={styles.slotDates}>{slot.dates}</span>
              </div>
            </label>
          ))}
          {errors.slot && <p className={styles.error}>{errors.slot}</p>}
        </div>

        {/* Student info */}
        <h2 className={styles.slotsHeading}>Student info</h2>
        <div className={styles.formSection}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>First name</label>
              <input
                className={`${styles.input} ${errors.studentFirstName ? styles.inputError : ""}`}
                name='studentFirstName'
                value={form.studentFirstName}
                onChange={handleChange}
                placeholder='Jane'
              />
              {errors.studentFirstName && (
                <p className={styles.error}>{errors.studentFirstName}</p>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last name</label>
              <input
                className={`${styles.input} ${errors.studentLastName ? styles.inputError : ""}`}
                name='studentLastName'
                value={form.studentLastName}
                onChange={handleChange}
                placeholder='Smith'
              />
              {errors.studentLastName && (
                <p className={styles.error}>{errors.studentLastName}</p>
              )}
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Grade</label>
            <select
              className={`${styles.input} ${errors.studentGrade ? styles.inputError : ""}`}
              name='studentGrade'
              value={form.studentGrade}
              onChange={handleChange}
            >
              <option value=''>Select grade</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {errors.studentGrade && (
              <p className={styles.error}>{errors.studentGrade}</p>
            )}
          </div>
        </div>

        {/* Parent info */}
        <h2 className={styles.slotsHeading}>Parent / guardian info</h2>
        <div className={styles.formSection}>
          <div className={styles.field}>
            <label className={styles.label}>Full name</label>
            <input
              className={`${styles.input} ${errors.parentName ? styles.inputError : ""}`}
              name='parentName'
              value={form.parentName}
              onChange={handleChange}
              placeholder='John Smith'
            />
            {errors.parentName && (
              <p className={styles.error}>{errors.parentName}</p>
            )}
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                className={`${styles.input} ${errors.parentEmail ? styles.inputError : ""}`}
                name='parentEmail'
                type='email'
                value={form.parentEmail}
                onChange={handleChange}
                placeholder='john@email.com'
              />
              {errors.parentEmail && (
                <p className={styles.error}>{errors.parentEmail}</p>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Phone number</label>
              <input
                className={`${styles.input} ${errors.parentPhone ? styles.inputError : ""}`}
                name='parentPhone'
                type='tel'
                value={form.parentPhone}
                onChange={handleChange}
                placeholder='(555) 000-0000'
              />
              {errors.parentPhone && (
                <p className={styles.error}>{errors.parentPhone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment */}
        <h2 className={styles.slotsHeading}>Payment method</h2>
        <div className={styles.formSection}>
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.id}
              className={`${styles.slot} ${form.payment === method.id ? styles.slotSelected : ""}`}
            >
              <input
                type='radio'
                name='payment'
                value={method.id}
                checked={form.payment === method.id}
                onChange={handleChange}
                className={styles.radioInput}
              />
              <div className={styles.radioCircle}>
                {form.payment === method.id && (
                  <div className={styles.radioDot} />
                )}
              </div>
              <div className={styles.slotInfo}>
                <span className={styles.slotLabel}>{method.label}</span>
                <span className={styles.slotTime}>{method.detail}</span>
              </div>
            </label>
          ))}
          {errors.payment && <p className={styles.error}>{errors.payment}</p>}
        </div>

        {/* Confirm */}

        <button
          className={styles.confirmBtn}
          onClick={handleConfirm}
          style={{ "--line": course.line }}
          disabled={loading}
        >
          {loading ? "Sending..." : `Confirm Enrollment · ${course.price}`}
        </button>
      </div>
    </div>
  );
}
