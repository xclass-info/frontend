// Deterministic "initials avatar" for mentors without a real uploaded
// photo - a colored circle with their initials, same visual language as
// the testimonial author avatars. Replaces the earlier illustrated
// DiceBear placeholders, which looked too much like fake stock photos.
const GRADIENTS = [
  "linear-gradient(135deg, #2f6175, #427e94)",
  "linear-gradient(135deg, #8a6a25, #9a772b)",
  "linear-gradient(135deg, #9a4a2f, #a85a44)",
  "linear-gradient(135deg, #4a4f8c, #6d3f6b)",
  "linear-gradient(135deg, #1f6f4a, #2f6175)",
  "linear-gradient(135deg, #4b5a63, #555f66)",
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
