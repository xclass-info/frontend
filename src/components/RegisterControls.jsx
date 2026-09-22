// src/components/RegisterControls.jsx
// Shared "Register now" button + signup modal for research, projects and
// courses. Used on the mentor profile page and on the research detail page.
import { useState } from "react";
import { seatsStatus } from "../utils/format";
import { seatsLeft, totalSeats, registerForItem } from "../utils/registration";

// Seat count plus a Register now button while seats remain.
export function SeatsRow({ kind, item, onRegister, extra }) {
  const left = seatsLeft(kind, item);
  if (left === null) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        marginTop: 10,
      }}
    >
      <span style={{ fontSize: 14, color: "#555", fontWeight: 600 }}>
        👥 {seatsStatus(totalSeats(kind, item), item.enrolledCount)}
        {extra}
      </span>
      {left > 0 && (
        <button
          onClick={() => onRegister(kind, item)}
          style={{
            padding: "12px 30px",
            borderRadius: 10,
            border: "none",
            background: "#00274c",
            color: "white",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Register now
        </button>
      )}
    </div>
  );
}

const REGISTER_ERRORS = {
  FULL: "Sorry, the last seat was just taken.",
  DUPLICATE: "This email is already registered for this.",
  NOT_FOUND: "This is no longer available.",
};

// `student` is the logged-in student's account ({ uid, name, email }) -
// registering requires login, so there's no name/email form anymore, just a
// confirmation using the account's details.
export function RegisterModal({ kind, item, student, onClose, onRegistered }) {
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const isPaidCourse = kind === "course" && item.price > 0;

  async function submit() {
    setSubmitting(true);
    setFormError("");
    try {
      await registerForItem(kind, item.id, {
        name: student.name,
        email: student.email,
        studentUid: student.uid,
      });
      onRegistered(kind, item.id);
      setDone(true);
    } catch (err) {
      console.error(err);
      setFormError(
        REGISTER_ERRORS[err.message] || "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

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
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 32,
          width: "100%",
          maxWidth: 440,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {done ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <p style={{ fontSize: 48 }}>✅</p>
            <h3>You're registered!</h3>
            <p style={{ color: "#888", marginBottom: 20 }}>
              The mentor will be in touch at {student.email}
              {isPaidCourse ? " about payment" : ""}.
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
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0 }}>Register: {item.title}</h3>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {isPaidCourse && (
              <p
                style={{
                  fontSize: 13,
                  color: "#92400e",
                  background: "rgba(217,119,6,0.08)",
                  padding: "10px 12px",
                  borderRadius: 8,
                  margin: "0 0 16px",
                }}
              >
                This course costs ${item.price}. No payment is taken now - the
                mentor will contact you to arrange it.
              </p>
            )}

            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #eee",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 16,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "#aaa",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  margin: "0 0 4px",
                }}
              >
                Registering as
              </p>
              <p style={{ margin: 0, fontWeight: 700, color: "#1a1a2e" }}>
                {student.name}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 14, color: "#666" }}>
                {student.email}
              </p>
            </div>
            {formError && (
              <p style={{ color: "red", fontSize: 13, margin: "0 0 12px" }}>
                {formError}
              </p>
            )}
            <button
              onClick={submit}
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
                cursor: "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Registering..." : "Confirm Registration"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
