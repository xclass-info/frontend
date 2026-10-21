// src/auth.js
// Login state. Accounts are Firebase Authentication users; our backend
// holds each account's student/mentor record. The logged-in account is
// `{ uid, email, isAdmin, student, teacher }` from /api/auth/me, where
// `student` / `teacher` are that account's records (or null).
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged as onFirebaseAuthChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { firebaseAuth } from "./firebase";
import { api } from "./api";

let user = null;
let loaded = false;
const listeners = new Set();

function setUser(next) {
  user = next;
  loaded = true;
  listeners.forEach((cb) => cb(user));
}

let loadSeq = 0;

async function loadUser() {
  // A later login/logout supersedes a lookup that's still in flight.
  const seq = ++loadSeq;
  let next = null;
  if (firebaseAuth.currentUser) {
    try {
      next = await api.get("/auth/me");
    } catch {
      next = null;
    }
  }
  if (seq === loadSeq) setUser(next);
  return next;
}

onFirebaseAuthChanged(firebaseAuth, () => {
  loadUser();
});

// Current Firebase ID token for API calls (refreshed by Firebase as needed).
export function getToken() {
  return firebaseAuth.currentUser?.getIdToken() ?? Promise.resolve(null);
}

export function getCurrentUser() {
  return user;
}

// Calls `cb(user | null)` now (once known) and on every login/logout.
// Returns an unsubscribe function.
export function onAuthStateChanged(cb) {
  listeners.add(cb);
  if (loaded) cb(user);
  return () => listeners.delete(cb);
}

// Re-fetch the account (e.g. after it changed on the server).
export function refreshUser() {
  return loadUser();
}

// Firebase's error codes, as the short codes the pages switch on.
const ERROR_CODES = {
  "auth/invalid-credential": "INVALID_CREDENTIALS",
  "auth/wrong-password": "INVALID_CREDENTIALS",
  "auth/user-not-found": "INVALID_CREDENTIALS",
  "auth/invalid-email": "INVALID_EMAIL",
  "auth/email-already-in-use": "EMAIL_IN_USE",
  "auth/weak-password": "WEAK_PASSWORD",
  "auth/too-many-requests": "RATE_LIMITED",
  "auth/user-disabled": "USER_DISABLED",
};

async function firebase(call) {
  try {
    return await call();
  } catch (err) {
    if (ERROR_CODES[err.code]) err.code = ERROR_CODES[err.code];
    throw err;
  }
}

export async function login(email, password) {
  await firebase(() => signInWithEmailAndPassword(firebaseAuth, email.trim(), password));
  return loadUser();
}

export function logout() {
  loadSeq++;
  setUser(null);
  return signOut(firebaseAuth);
}

// Creates the Firebase account, then its student/mentor record (which
// emails the verification link), then signs out - they log in after
// verifying. Resolves to { emailSent }.
export async function register({ kind, email, password, ...profile }) {
  await firebase(() => createUserWithEmailAndPassword(firebaseAuth, email.trim(), password));
  try {
    return await api.post("/auth/profile", { kind, ...profile });
  } finally {
    await logout();
  }
}

export function sendPasswordReset(email, continueUrl) {
  return firebase(() =>
    sendPasswordResetEmail(
      firebaseAuth,
      email.trim(),
      continueUrl ? { url: continueUrl, handleCodeInApp: false } : undefined,
    ),
  );
}

// Re-sends the verification email. Needs the password, since the account
// is signed out until it's verified.
export async function resendVerificationEmail({ kind, email, password }) {
  await firebase(() => signInWithEmailAndPassword(firebaseAuth, email.trim(), password));
  try {
    await api.post("/auth/resend-verification", { kind });
  } finally {
    await logout();
  }
}
