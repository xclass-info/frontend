// src/utils/accountVerification.js
// Account-email verification for students and mentors. The backend creates
// the token and sends the email (Gmail SMTP) when the account's profile is
// created, and again via resendVerificationEmail (see ../auth).

// Accounts created before this flow existed have no accountEmailVerified
// field at all - treat that as already verified so nobody gets locked out.
export function isAccountVerified(data) {
  return data?.accountEmailVerified !== false;
}
