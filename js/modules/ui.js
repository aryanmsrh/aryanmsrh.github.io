/**
 * UI Utilities and Navigation Handlers
 */

import { getSvg } from "./svg.js";

export async function initSvgElements() {
  const elements = document.querySelectorAll("[data-svg]");
  await Promise.all(
    Array.from(elements).map(async (el) => {
      const path = el.getAttribute("data-svg");
      if (path) {
        const svgText = await getSvg(path);
        if (svgText) {
          el.innerHTML = svgText;
        }
      }
    })
  );
}

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

  let hasScrolledBefore = false;

  const handleScroll = () => {
    if (window.scrollY > 60) {
      hasScrolledBefore = true;
      indicator.classList.remove("fade-in");
      indicator.classList.add("fade-out");
    } else {
      if (hasScrolledBefore) {
        indicator.classList.remove("fade-out");
        indicator.classList.add("fade-in");
      }
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
}