export function seatsStatus(total, enrolled = 0) {
  const left = Math.max(Number(total) - Number(enrolled || 0), 0);
  if (left === 0) return "Full";
  return `${left} of ${total} ${left === 1 ? "seat" : "seats"} left`;
}

export function lessonWeekday(dateStr) {
  try {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
    });
  } catch {
    return "";
  }
}

// Mentor-entered URLs are rendered as links, so only allow http(s) - anything
// else (e.g. a javascript: URL) is treated as not linkable.
export function safeUrl(url) {
  return /^https?:\/\//i.test((url || "").trim()) ? url.trim() : null;
}
