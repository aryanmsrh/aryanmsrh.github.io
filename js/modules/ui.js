/**
 * UI Utilities and Navigation Handlers
 */

export function initLoader() {
  window.addEventListener("load", () => {
    setTimeout(
      () => document.getElementById("loader")?.classList.add("hide"),
      700
    );
  });
}

export function initMobileMenu() {
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (!hamburgerBtn || !mobileMenu) return;

  hamburgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle("active");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () =>
      mobileMenu.classList.remove("active")
    );
  });

  document.addEventListener("click", (e) => {
    if (
      !mobileMenu.contains(e.target) &&
      !hamburgerBtn.contains(e.target)
    ) {
      mobileMenu.classList.remove("active");
    }
  });
}