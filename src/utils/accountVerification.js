// src/utils/accountVerification.js
// Account-email verification for students and mentors. The backend creates
// the token and sends the email (Gmail SMTP) when the account is created,
// and again on request via resendVerificationEmail.
import { api } from "../api";

// Accounts created before this flow existed have no accountEmailVerified
// field at all - treat that as already verified so nobody gets locked out.
export function isAccountVerified(data) {
  return data?.accountEmailVerified !== false;
}

// Issues a fresh token (invalidating the previous link) and re-sends the
// email. Needs the password, since the account can't log in until verified.
export function resendVerificationEmail({ kind, email, password }) {
  return api.post("/auth/resend-verification", { kind, email, password });
}
