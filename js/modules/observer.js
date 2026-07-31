/**
 * Intersection Observer for Reveal Animations
 */

export function initScrollObserver() {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("in");
      });
    },
    { threshold: 0.1 }
  );

  const eyebrowObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("in");
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
  );

  document
    .querySelectorAll(".reveal")
    .forEach((el) => sectionObserver.observe(el));

  document
    .querySelectorAll(".eyebrow")
    .forEach((el) => eyebrowObserver.observe(el));
}