export function seatsStatus(total, enrolled = 0) {
  const left = Math.max(Number(total) - Number(enrolled || 0), 0);
  if (left === 0) return "Full";
  return `${left} of ${total} ${left === 1 ? "seat" : "seats"} left`;
}

// Mentor-entered URLs are rendered as links, so only allow http(s) - anything
// else (e.g. a javascript: URL) is treated as not linkable.
export function safeUrl(url) {
  return /^https?:\/\//i.test((url || "").trim()) ? url.trim() : null;
}

// Every research/project mentorship follows the same fixed structure -
// shown on listing cards and detail pages, not a per-post field.
export const LESSON_STRUCTURE_LABEL = "10 lessons · 1 hour each";
