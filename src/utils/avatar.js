// Deterministic "initials avatar" for mentors without a real uploaded
// photo - a colored circle with their initials, same visual language as
// the testimonial author avatars. Replaces the earlier illustrated
// DiceBear placeholders, which looked too much like fake stock photos.
const GRADIENTS = [
  "linear-gradient(135deg, #FF6BA8, #9B6BFF)",
  "linear-gradient(135deg, #FF6B4A, #FF9F1C)",
  "linear-gradient(135deg, #4A8FE2, #2DCB85)",
  "linear-gradient(135deg, #11998e, #38ef7d)",
  "linear-gradient(135deg, #f953c6, #b91d73)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
];

export function getInitials(name) {
  if (!name) return "?";
  const words = name
    .replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s+/i, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function avatarGradient(seed) {
  const str = String(seed || "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}
