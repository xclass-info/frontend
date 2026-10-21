import { useEffect, useRef } from "react";

// Fades/slides in any descendant .reveal element as it scrolls into view.
// Self-contained (own IntersectionObserver scoped to the returned ref) so it
// works on any page, not just ones with a page-wide observer like the
// homepage. Re-runs when `deps` change so cards added after an async fetch
// (e.g. a Firestore listener resolving) still get observed.
export function useScrollReveal(deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    root.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
