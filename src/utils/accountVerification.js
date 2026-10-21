// src/utils/accountVerification.js
// Account-email verification for students and mentors, sent via our own
// Flask + Gmail SMTP mail service (happyresearch-mail-service, deployed on
// Heroku) instead of Firebase Auth's own sendEmailVerification() - its
// default template is unbranded and unstyled enough that it reads as spam -
// or EmailJS, whose shared template had a hardcoded subject line.
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
  const res = await fetch(
    `${import.meta.env.VITE_MAIL_API_URL}/api/send-verification-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": import.meta.env.VITE_MAIL_API_KEY,
      },
      body: JSON.stringify({
        to_email: email,
        to_name: name,
        verify_link: `https://happyresearch.org/verify-account-email?kind=${kind}&uid=${uid}&token=${token}`,
      }),
    },
  );
  if (!res.ok) {
    throw new Error("Failed to send verification email");
  }
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
