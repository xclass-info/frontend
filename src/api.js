// src/api.js
// Client for our own Flask backend (backend/ in this repo). Replaces the
// Firebase SDK: every read/write goes through here.
import { getToken } from "./auth";

export const API_URL = import.meta.env.VITE_API_URL;

// Error thrown for any non-2xx response. `code` is the backend's stable
// machine-readable reason ("FULL", "DUPLICATE", "INVALID_CREDENTIALS", ...),
// also exposed as `message` so existing `err.message === "FULL"` checks work.
export class ApiError extends Error {
  constructor(status, code, detail) {
    super(code);
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

// Fired after every successful write, so mounted lists refetch - the
// stand-in for Firestore's live onSnapshot updates (see `live` below).
const CHANGED = "hr:data-changed";

async function request(method, path, body) {
  const headers = {};
  const token = await getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}/api${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.code || "ERROR", data?.error);
  }
  if (method !== "GET") window.dispatchEvent(new Event(CHANGED));
  return data;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body ?? {}),
  patch: (path, body) => request("PATCH", path, body),
  del: (path) => request("DELETE", path),
};

// GET that resolves to null on 404 (like reading a Firestore doc that
// doesn't exist).
export async function getOrNull(path) {
  try {
    return await api.get(path);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

// Encode one path segment (ids can contain characters like "%" or "@").
export const seg = encodeURIComponent;

const POLL_MS = 30000;

// Runs `fetcher` now, again after any write made from this tab, when the tab
// regains focus, and every 30s - then hands the result to `onData`. Returns
// an unsubscribe function, so it drops in where onSnapshot was used.
export function live(fetcher, onData, onError = console.error) {
  let active = true;
  const run = () =>
    fetcher().then(
      (data) => active && onData(data),
      (err) => active && onError(err),
    );
  run();
  const onFocus = () => document.visibilityState === "visible" && run();
  window.addEventListener(CHANGED, run);
  document.addEventListener("visibilitychange", onFocus);
  const timer = setInterval(onFocus, POLL_MS);
  return () => {
    active = false;
    window.removeEventListener(CHANGED, run);
    document.removeEventListener("visibilitychange", onFocus);
    clearInterval(timer);
  };
}

// Timestamps arrive as ISO strings; these keep sorting/display code simple.
export function toMillis(value) {
  const t = value ? Date.parse(value) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

export function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "";
}
