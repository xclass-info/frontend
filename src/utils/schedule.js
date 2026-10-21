// Every research/project engagement is a fixed 10 weekly lessons, 1 hour
// each (see LESSON_STRUCTURE_LABEL in format.js). The mentor sets a single
// start date + time when creating the post; the other 9 lessons are just
// that same day/time, one week apart - not independently entered.

export function computeLessonDates(startDate, time) {
  if (!startDate || !time) return [];
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return [];
  const base = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(base.getTime())) return [];
  return Array.from({ length: 10 }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i * 7);
    d.setHours(h, m, 0, 0);
    return d;
  });
}

export function formatLessonSlot(date) {
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const start = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const end = new Date(date.getTime() + 60 * 60 * 1000).toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "2-digit" },
  );
  return `${dateStr}, ${start} – ${end}`;
}

export const LOCATION_OPTIONS = [
  { value: "online", label: "💻 Online" },
  { value: "in-person", label: "📍 In-Person" },
];

export function locationLabel(value) {
  return LOCATION_OPTIONS.find((o) => o.value === value)?.label || value;
}
