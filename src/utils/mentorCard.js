export function mentorTags(teacher) {
  const raw = [teacher.expertise, teacher.researchArea]
    .filter(Boolean)
    .flatMap((s) => s.split(/&|,|\//))
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(raw)].slice(0, 4);
}

export function mentorBadge(teacher) {
  if (typeof teacher.rating === "number" && teacher.rating >= 4.5) {
    return "Top Rated";
  }
  if (/phd|doctor/i.test(teacher.degree || "")) return "PhD Mentor";
  return "Featured Mentor";
}

export function mentorStats(teacher) {
  const stats = [];
  if (typeof teacher.rating === "number") {
    stats.push([`${teacher.rating.toFixed(1)}★`, "Rating"]);
  }
  if (teacher.yearsOfExperience) {
    stats.push([teacher.yearsOfExperience, "Years exp."]);
  }
  if (/phd|doctor/i.test(teacher.degree || "")) {
    stats.push(["PhD", "Degree"]);
  } else if (teacher.degree) {
    stats.push([teacher.degree.split(" ")[0], "Degree"]);
  }
  if (teacher.projects?.length) {
    stats.push([`${teacher.projects.length}`, "Project ideas"]);
  }
  return stats.slice(0, 3);
}
