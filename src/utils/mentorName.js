export function formatMentorName(name, { mentorType, degree } = {}) {
  if (!name) return name;
  if (name.startsWith("Prof.")) return name.split(" ").slice(0, 2).join(" ");
  if (mentorType === "phd_student") return name; // enrolled, not yet credentialed
  if (/doctor/i.test(degree || "")) return `Dr. ${name.split(" ").pop()}`;
  return name; // no fabricated honorific
}
