export function mentorBadge(teacher) {
  if (typeof teacher.rating === "number" && teacher.rating >= 4.5) {
    return "Top Rated";
  }
  if (/phd|doctor/i.test(teacher.degree || "")) return "PhD Mentor";
  return "Featured Mentor";
}
