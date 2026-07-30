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

export function initMouseShadow() {
  const overlay = document.createElement("div");
  overlay.id = "mouse-shadow-overlay";
  document.body.appendChild(overlay);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  let isHovering = false;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isHovering) {
      isHovering = true;
      overlay.classList.add("active");
    }
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    isHovering = false;
    overlay.classList.remove("active");
  });

  function animate() {
    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;
    overlay.style.setProperty("--mouse-x", `${currentX.toFixed(1)}px`);
    overlay.style.setProperty("--mouse-y", `${currentY.toFixed(1)}px`);
    requestAnimationFrame(animate);
  }
  animate();
}

export function initCustomCursor() {
  if (matchMedia("(pointer: coarse)").matches) return;

  const dot = document.createElement("div");
  dot.id = "custom-cursor-dot";

  const ring = document.createElement("div");
  ring.id = "custom-cursor-ring";

  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let isVisible = false;

  const interactiveSelector = "a, button, input, select, textarea, [role='button'], .think-header, .think-link, .proj-card, .modal-close-btn, .btn";

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      dot.classList.add("active");
      ring.classList.add("active");
      ringX = mouseX;
      ringY = mouseY;
    }

    const target = e.target.closest(interactiveSelector);
    if (target) {
      dot.classList.add("hover");
      ring.classList.add("hover");
    } else {
      dot.classList.remove("hover");
      ring.classList.remove("hover");
    }
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    isVisible = false;
    dot.classList.remove("active");
    ring.classList.remove("active");
  });

  window.addEventListener("mousedown", () => {
    ring.classList.add("pressed");
  });

  window.addEventListener("mouseup", () => {
    ring.classList.remove("pressed");
  });

  function render() {
    if (isVisible) {
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(render);
  }
  render();
}