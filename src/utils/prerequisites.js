export const MAX_PREREQUISITES = 5;

// Older research/project docs stored prerequisites as a single free-text
// string (e.g. "Basic Python, Algebra 1"); split those into items so old
// and new data render and edit the same way.
export function toPrereqArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((s) => String(s).trim())
      .filter(Boolean)
      .slice(0, MAX_PREREQUISITES);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, MAX_PREREQUISITES);
  }
  return [];
}
