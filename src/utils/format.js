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
