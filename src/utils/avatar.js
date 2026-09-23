// Generates a friendly, deterministic illustrated avatar for mentors who
// haven't uploaded a real photo, via DiceBear's free public API (no key,
// no backend). Same seed always produces the same avatar.
export function avatarUrl(seed) {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffcb05,ff9f1c,4a8fe2,2dcb85,9b6bff,ff6ba8&backgroundType=gradientLinear`;
}
