// src/components/RegisterModal.jsx
// Registration flow: verify email (code) -> name + optional phone -> payment
// info -> done. The seat is only taken at the final step.
import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import { registerForItem, isAlreadyRegistered } from "../utils/registration";
import { PAYMENT_METHODS } from "../config/paymentMethods";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const VERIFY_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_VERIFY_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
// Until a verification email template is configured, the code step is skipped.
const VERIFICATION_ENABLED = Boolean(VERIFY_TEMPLATE_ID);

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_SENDS = 3;
const RESEND_SECONDS = 30;

const REGISTER_ERRORS = {
  FULL: "Sorry, the last seat was just taken.",
  DUPLICATE: "This email is already registered for this.",
  NOT_FOUND: "This is no longer available.",
};

const STEP_NUMBER = { email: 1, code: 1, details: 2, payment: 3 };

function newCode() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return String(n).padStart(6, "0");
}

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #ddd",
  boxSizing: "border-box",
  fontSize: 15,
  marginBottom: 12,
};

function PrimaryButton({ children, disabled, type = "submit", onClick }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        padding: 12,
        borderRadius: 8,
        border: "none",
        background: "#00274c",
        color: "white",
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

function LinkButton({ children, onClick, disabled }) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "none",
        border: "none",
        color: disabled ? "#aaa" : "#00274c",
        cursor: disabled ? "default" : "pointer",
        fontSize: 13,
        fontWeight: 600,
        padding: 0,
        textDecoration: disabled ? "none" : "underline",
      }}
    >
      {children}
    </button>
  );
}

export default function RegisterModal({ kind, item, onClose, onRegistered }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [issued, setIssued] = useState(null); // { value, expires }
  const [attempts, setAttempts] = useState(0);
  const [sends, setSends] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const price = kind === "course" ? Number(item.price) || 0 : null;
  const isFreeCourse = kind === "course" && price === 0;
  const amountText =
    kind === "course"
      ? price > 0
        ? `$${price}`
        : "Free - no payment needed"
      : "To be confirmed by the mentor";

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function sendCode() {
    if (sends >= MAX_SENDS) {
      setError("Too many codes requested. Please try again later.");
      return;
    }
    const value = newCode();
    await emailjs.send(
      SERVICE_ID,
      VERIFY_TEMPLATE_ID,
      { to_email: email.trim(), code: value, item_title: item.title },
      PUBLIC_KEY,
    );
    setIssued({ value, expires: Date.now() + CODE_TTL_MS });
    setAttempts(0);
    setSends(sends + 1);
    setCooldown(RESEND_SECONDS);
    setCodeInput("");
    setStep("code");
  }

  async function submitEmail(e) {
    e.preventDefault();
    setError("");
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setBusy(true);
    try {
      if (await isAlreadyRegistered(item.id, email)) {
        setError("This email is already registered for this.");
        return;
      }
      if (!VERIFICATION_ENABLED) {
        setStep("details");
        return;
      }
      await sendCode();
    } catch (err) {
      console.error(err);
      setError("Couldn't send the code. Check the email address and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resendCode() {
    if (cooldown > 0 || busy) return;
    setError("");
    setBusy(true);
    try {
      await sendCode();
    } catch (err) {
      console.error(err);
      setError("Couldn't send the code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function submitCode(e) {
    e.preventDefault();
    setError("");
    if (!issued || Date.now() > issued.expires) {
      setError("That code has expired. Please send a new one.");
      return;
    }
    if (attempts >= MAX_ATTEMPTS) {
      setError("Too many attempts. Please send a new code.");
      return;
    }
    if (codeInput.trim() !== issued.value) {
      setAttempts(attempts + 1);
      setError("That code isn't right. Please try again.");
      return;
    }
    setVerified(true);
    setIssued(null);
    setStep("details");
  }

  function submitDetails(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (phone.trim() && !/^[+()\d\s.-]{7,20}$/.test(phone.trim())) {
      setError("Enter a valid phone number, or leave it blank");
      return;
    }
    setStep("payment");
  }

  async function complete() {
    setBusy(true);
    setError("");
    try {
      await registerForItem(kind, item.id, {
        name,
        email,
        phone,
        emailVerified: verified,
        amount: kind === "course" ? price : null,
      });
      onRegistered(kind, item.id);
      setStep("done");
    } catch (err) {
      console.error(err);
      setError(
        REGISTER_ERRORS[err.message] || "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const errorLine = error && (
    <p style={{ color: "#d33", fontSize: 13, margin: "0 0 12px" }}>{error}</p>
  );

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
          maxWidth: 460,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {step === "done" ? (
          <div style={{ textAlign: "center", padding: 12 }}>
            <p style={{ fontSize: 48, margin: "0 0 8px" }}>✅</p>
            <h3>You're registered!</h3>
            <p style={{ color: "#666", marginBottom: 20, lineHeight: 1.6 }}>
              Your seat is reserved. The mentor will be in touch at {email}
              {isFreeCourse ? "." : " and will confirm once payment is received."}
            </p>
            <div style={{ maxWidth: 200, margin: "0 auto" }}>
              <PrimaryButton type='button' onClick={onClose}>
                Done
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 6,
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
            <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 20px" }}>
              Step {STEP_NUMBER[step]} of 3
            </p>

            {step === "email" && (
              <form onSubmit={submitEmail} noValidate>
                <label style={{ fontSize: 13, fontWeight: 600 }}>
                  Your email address
                </label>
                <input
                  type='email'
                  autoFocus
                  placeholder='you@example.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ ...inputStyle, marginTop: 6 }}
                />
                <p style={{ fontSize: 12, color: "#888", margin: "0 0 12px" }}>
                  {VERIFICATION_ENABLED
                    ? "We'll email you a verification code to confirm it's yours."
                    : "We'll use this to contact you about your registration."}
                </p>
                {errorLine}
                <PrimaryButton disabled={busy}>
                  {busy
                    ? "Please wait..."
                    : VERIFICATION_ENABLED
                      ? "Send verification code"
                      : "Continue"}
                </PrimaryButton>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={submitCode}>
                <p style={{ fontSize: 14, color: "#555", margin: "0 0 12px" }}>
                  We sent a 6-digit code to <strong>{email}</strong>. Enter it
                  below.
                </p>
                <input
                  autoFocus
                  inputMode='numeric'
                  maxLength={6}
                  placeholder='123456'
                  value={codeInput}
                  onChange={(e) =>
                    setCodeInput(e.target.value.replace(/\D/g, ""))
                  }
                  style={{
                    ...inputStyle,
                    letterSpacing: 6,
                    fontSize: 20,
                    textAlign: "center",
                  }}
                />
                {errorLine}
                <PrimaryButton disabled={codeInput.length !== 6}>
                  Verify
                </PrimaryButton>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 14,
                  }}
                >
                  <LinkButton
                    onClick={() => {
                      setStep("email");
                      setError("");
                    }}
                  >
                    Use a different email
                  </LinkButton>
                  <LinkButton
                    onClick={resendCode}
                    disabled={cooldown > 0 || busy}
                  >
                    {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
                  </LinkButton>
                </div>
              </form>
            )}

            {step === "details" && (
              <form onSubmit={submitDetails}>
                <p style={{ fontSize: 13, color: "#16a34a", margin: "0 0 14px" }}>
                  {verified ? "✓ " : ""}
                  {email}
                  {verified ? " verified" : ""}
                </p>
                <label style={{ fontSize: 13, fontWeight: 600 }}>
                  Full name
                </label>
                <input
                  autoFocus
                  placeholder='Your full name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ ...inputStyle, marginTop: 6 }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>
                  Phone number{" "}
                  <span style={{ color: "#aaa", fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <input
                  type='tel'
                  placeholder='e.g. (555) 123-4567'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ ...inputStyle, marginTop: 6 }}
                />
                {errorLine}
                <PrimaryButton>Continue</PrimaryButton>
              </form>
            )}

            {step === "payment" && (
              <div>
                <div
                  style={{
                    background: "#f9fafb",
                    border: "1px solid #eee",
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 16,
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  <div>
                    <span style={{ color: "#888" }}>Registering:</span> {name}
                  </div>
                  <div>
                    <span style={{ color: "#888" }}>Amount:</span>{" "}
                    <strong>{amountText}</strong>
                  </div>
                </div>

                {!isFreeCourse && (
                  <>
                    <p style={{ margin: "0 0 8px", fontWeight: 700 }}>
                      Payment method
                    </p>
                    {PAYMENT_METHODS.length > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          marginBottom: 14,
                        }}
                      >
                        {PAYMENT_METHODS.map((m) => (
                          <div
                            key={m.name}
                            style={{
                              border: "1px solid #ddd",
                              borderRadius: 8,
                              padding: "10px 12px",
                              fontSize: 14,
                            }}
                          >
                            <strong>{m.name}</strong>
                            <div style={{ color: "#555", whiteSpace: "pre-wrap" }}>
                              {m.details}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 14, color: "#555", margin: "0 0 14px" }}>
                        The mentor will contact you at {email} with payment
                        details.
                      </p>
                    )}
                    <p style={{ fontSize: 12, color: "#888", margin: "0 0 16px" }}>
                      Your seat is reserved when you complete registration. The
                      mentor confirms once payment is received.
                    </p>
                  </>
                )}

                {errorLine}
                <PrimaryButton type='button' disabled={busy} onClick={complete}>
                  {busy ? "Registering..." : "Complete registration"}
                </PrimaryButton>
                <div style={{ marginTop: 14 }}>
                  <LinkButton
                    onClick={() => {
                      setStep("details");
                      setError("");
                    }}
                  >
                    ← Back
                  </LinkButton>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
