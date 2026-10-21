// src/utils/accountVerification.js
// Account-email verification for students and mentors via EmailJS, replacing
// Firebase Auth's own sendEmailVerification() - its default template is
// unbranded and unstyled enough that it reads as spam. Mirrors the
// EmailJS-based pattern already used for mentor work-email verification
// (see MentorVerificationForm.jsx / VerifyMentorEmail.jsx).
import emailjs from "@emailjs/browser";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { generateVerificationToken } from "./mentorVerification";

export { generateVerificationToken };

const COLLECTION = { student: "students", teacher: "teachers" };

// Accounts created before this flow existed have no accountEmailVerified
// field at all - treat that as already verified so nobody gets locked out.
export function isAccountVerified(data) {
  return data?.accountEmailVerified !== false;
}

export async function sendVerificationEmail({ kind, uid, name, email, token }) {
  await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      from_name: "HappyResearch",
      from_email: "happyprogramming.us@gmail.com",
      subject: "Verify your email for HappyResearch",
      message: `Hi ${name || ""},\n\nWelcome to HappyResearch! Click the link below to verify your email and activate your account:\n\nhttps://happyresearch.org/verify-account-email?kind=${kind}&uid=${uid}&token=${token}\n\nIf you didn't create this account, you can ignore this email.`,
      to_email: email,
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  );
}

// For resending: the account doc already exists, so this both issues a
// fresh token (overwriting any previous one) and sends the email.
export async function resendVerificationEmail({ kind, uid, name, email }) {
  const token = generateVerificationToken();
  await updateDoc(doc(db, COLLECTION[kind], uid), {
    accountEmailToken: token,
    accountEmailVerified: false,
  });
  await sendVerificationEmail({ kind, uid, name, email, token });
}
