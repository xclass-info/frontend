export function formatMentorName(name) {
  if (name.startsWith("Prof.")) return name.split(" ").slice(0, 2).join(" ");
  return `Dr. ${name.split(" ").pop()}`;
}
