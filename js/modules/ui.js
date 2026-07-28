/**
 * UI Utilities and Navigation Handlers
 */

export function initLoader() {
  const hideLoader = () => {
    document.getElementById("loader")?.classList.add("hide");
  };

  if (document.readyState === "complete") {
    setTimeout(hideLoader, 200);
  } else {
    window.addEventListener("load", () => {
      setTimeout(hideLoader, 200);
    });
  }
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

export function initScrollIndicator() {
  const indicator = document.getElementById("scroll-indicator");
  if (!indicator) return;

  const handleScroll = () => {
    if (window.scrollY > 60) {
      indicator.classList.add("fade-out");
    } else {
      indicator.classList.remove("fade-out");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}