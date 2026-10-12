// src/components/MentorVerificationForm.jsx
// Lives in the mentor dashboard's Verification tab. Walks a mentor through:
// pick a type -> satisfy that type's requirement -> land in pending_review
// for an admin to approve. See utils/mentorVerification.js for the shared
// status/type constants.
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import {
  MENTOR_TYPES,
  mentorTypeLabel,
  statusInfo,
  generateVerificationToken,
} from "../utils/mentorVerification";

const MAX_FILE_MB = 10;

function StatusPill({ status }) {
  const s = statusInfo(status);
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: s.color,
        background: s.bg,
        padding: "4px 12px",
        borderRadius: 20,
      }}
    >
      {s.label}
    </span>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 14,
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle = {
  fontSize: 13,
  color: "#888",
  fontWeight: 600,
  display: "block",
  marginBottom: 6,
};

const primaryBtn = {
  padding: "12px 28px",
  borderRadius: 8,
  border: "none",
  background: "#2f6175",
  color: "white",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

export default function MentorVerificationForm({ teacher }) {
  const uid = auth.currentUser?.uid;
  const [savingType, setSavingType] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [workEmail, setWorkEmail] = useState(teacher.workEmail || "");
  const [profileUrl, setProfileUrl] = useState(teacher.universityProfileURL || "");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [resent, setResent] = useState(false);
  const [submittingFaculty, setSubmittingFaculty] = useState(false);

  async function chooseMentorType(value) {
    setSavingType(true);
    try {
      await updateDoc(doc(db, "teachers", uid), {
        mentorType: value,
        verificationStatus: "incomplete",
      });
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSavingType(false);
    }
  }

  async function changeMentorType() {
    await updateDoc(doc(db, "teachers", uid), { mentorType: null });
  }

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    const okType = f.type === "application/pdf" || f.type.startsWith("image/");
    if (!okType) {
      setUploadError("Please upload a PDF or image file.");
      return;
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setUploadError(`File must be under ${MAX_FILE_MB}MB.`);
      return;
    }
    setUploadError("");
    setFile(f);
  }

  async function submitDocument() {
    if (!file) {
      setUploadError("Please choose a file first.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const field =
        teacher.mentorType === "phd_student"
          ? "transcriptURL"
          : "degreeCertificateURL";
      const path = `mentor-documents/${uid}/${Date.now()}_${file.name}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await updateDoc(doc(db, "teachers", uid), {
        [field]: url,
        verificationStatus: "pending_review",
        rejectionReason: null,
        submittedAt: new Date(),
      });
    } catch (err) {
      console.error(err);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function sendVerificationEmail() {
    if (!/\S+@\S+\.\S+/.test(workEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setSendingEmail(true);
    try {
      const token = generateVerificationToken();
      await updateDoc(doc(db, "teachers", uid), {
        workEmail: workEmail.trim(),
        workEmailToken: token,
        workEmailVerified: false,
      });
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: "HappyResearch",
          from_email: "happyprogramming.us@gmail.com",
          subject: "Verify your work email for HappyResearch",
          message: `Hi ${teacher.name || ""},\n\nClick the link below to verify this is your work email and continue your mentor application:\n\nhttps://happyresearch.org/verify-mentor-email?uid=${uid}&token=${token}\n\nIf you didn't request this, you can ignore this email.`,
          to_email: workEmail.trim(),
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    } catch (err) {
      console.error(err);
      setEmailError("Could not send the email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  }

  async function submitFacultyApplication() {
    if (!profileUrl.trim()) {
      setEmailError("Please add a link to your faculty profile page.");
      return;
    }
    setSubmittingFaculty(true);
    try {
      await updateDoc(doc(db, "teachers", uid), {
        universityProfileURL: profileUrl.trim(),
        verificationStatus: "pending_review",
        rejectionReason: null,
        submittedAt: new Date(),
      });
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmittingFaculty(false);
    }
  }

  const cardStyle = {
    background: "white",
    borderRadius: 16,
    padding: 28,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    maxWidth: 560,
  };

  // ── Approved ──────────────────────────────────────────────
  if (teacher.verificationStatus === "approved") {
    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>✅</span>
          <h2 style={{ margin: 0, fontSize: 20 }}>You're verified</h2>
        </div>
        <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
          Your mentor profile is live and visible to students.
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={labelStyle}>Type</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {mentorTypeLabel(teacher.mentorType)}
          </span>
        </div>
        {teacher.approvalMessage && (
          <p
            style={{
              marginTop: 16,
              fontSize: 13,
              color: "#1f6f4a",
              background: "rgba(31,111,74,0.06)",
              padding: "10px 12px",
              borderRadius: 8,
            }}
          >
            {teacher.approvalMessage}
          </p>
        )}
      </div>
    );
  }

  // ── Pending review ────────────────────────────────────────
  if (teacher.verificationStatus === "pending_review") {
    return (
      <div style={cardStyle}>
        <div style={{ marginBottom: 12 }}>
          <StatusPill status='pending_review' />
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>
          Your application is under review
        </h2>
        <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6 }}>
          We're reviewing your {mentorTypeLabel(teacher.mentorType).toLowerCase()}{" "}
          application. You'll be notified once it's approved - usually within
          a couple of days.
        </p>
      </div>
    );
  }

  const rejected = teacher.verificationStatus === "rejected";

  // ── No type chosen yet ────────────────────────────────────
  if (!teacher.mentorType) {
    return (
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20 }}>
          Complete your mentor verification
        </h2>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>
          Your profile won't be visible to students until this is approved.
          Which best describes you?
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MENTOR_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => chooseMentorType(t.value)}
              disabled={savingType}
              style={{
                textAlign: "left",
                padding: 16,
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                background: "white",
                cursor: "pointer",
              }}
            >
              <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 15 }}>
                {t.label}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
                {t.blurb}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Type chosen, requirement not yet satisfied (or rejected) ─────────
  return (
    <div style={cardStyle}>
      {rejected && (
        <div style={{ marginBottom: 16 }}>
          <StatusPill status='rejected' />
          {teacher.rejectionReason && (
            <p
              style={{
                marginTop: 8,
                fontSize: 13,
                color: "#a01f13",
                background: "rgba(160,31,19,0.06)",
                padding: "10px 12px",
                borderRadius: 8,
              }}
            >
              {teacher.rejectionReason}
            </p>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 4,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20 }}>
          {mentorTypeLabel(teacher.mentorType)}
        </h2>
        <button
          onClick={changeMentorType}
          style={{
            background: "none",
            border: "none",
            color: "#2f6175",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Not this? Change
        </button>
      </div>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>
        {MENTOR_TYPES.find((t) => t.value === teacher.mentorType)?.requirement}
      </p>

      {(teacher.mentorType === "phd_student" ||
        teacher.mentorType === "phd_graduate") && (
        <>
          <label style={labelStyle}>
            {teacher.mentorType === "phd_student"
              ? "Transcript (PDF or image)"
              : "Degree certificate (PDF or image)"}
          </label>
          <input
            type='file'
            accept='application/pdf,image/*'
            onChange={handleFileChange}
            style={{ marginBottom: 8, fontSize: 14 }}
          />
          {file && (
            <p style={{ fontSize: 13, color: "#1f6f4a", margin: "0 0 8px" }}>
              📄 {file.name}
            </p>
          )}
          {uploadError && (
            <p style={{ fontSize: 13, color: "#a01f13", margin: "0 0 8px" }}>
              {uploadError}
            </p>
          )}
          <button
            onClick={submitDocument}
            disabled={uploading}
            style={{ ...primaryBtn, opacity: uploading ? 0.6 : 1 }}
          >
            {uploading ? "Uploading..." : "Submit for Review"}
          </button>
        </>
      )}

      {teacher.mentorType === "faculty" && (
        <>
          <label style={labelStyle}>Work email</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              type='email'
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
              placeholder='you@university.edu'
              disabled={teacher.workEmailVerified}
              style={{ ...inputStyle, flex: 1 }}
            />
            {!teacher.workEmailVerified && (
              <button
                onClick={sendVerificationEmail}
                disabled={sendingEmail}
                style={{ ...primaryBtn, whiteSpace: "nowrap" }}
              >
                {sendingEmail
                  ? "Sending..."
                  : resent
                    ? "Sent!"
                    : teacher.workEmailToken
                      ? "Resend"
                      : "Verify email"}
              </button>
            )}
          </div>

          {teacher.workEmailVerified ? (
            <p style={{ fontSize: 13, color: "#1f6f4a", margin: "0 0 16px", fontWeight: 600 }}>
              ✅ Email verified
            </p>
          ) : teacher.workEmailToken ? (
            <p style={{ fontSize: 13, color: "#888", margin: "0 0 16px" }}>
              📧 Check your inbox for a verification link.
            </p>
          ) : null}

          {emailError && (
            <p style={{ fontSize: 13, color: "#a01f13", margin: "0 0 8px" }}>
              {emailError}
            </p>
          )}

          {teacher.workEmailVerified && (
            <>
              <label style={labelStyle}>University faculty profile link</label>
              <input
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder='https://university.edu/faculty/yourname'
                style={{ ...inputStyle, marginBottom: 12 }}
              />
              <button
                onClick={submitFacultyApplication}
                disabled={submittingFaculty}
                style={{ ...primaryBtn, opacity: submittingFaculty ? 0.6 : 1 }}
              >
                {submittingFaculty ? "Submitting..." : "Submit for Review"}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
