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
  const loaderEl = document.getElementById("loader");
  const textEl = document.getElementById("loader-text");
  if (!loaderEl) return;

  const phrases = [
    "> COMPILING FROM SCRATCH",
    "> OPTIMIZING RUNTIME",
    "> LOADING MODULES",
    "> ELIMINATING NASAL DEMONS",
    "> DONE"
  ];

  let phraseIndex = 0;
  let intervalId = null;

  if (textEl) {
    intervalId = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      textEl.classList.add("flip-out");

      setTimeout(() => {
        textEl.innerHTML = `${phrases[phraseIndex]}<span class="cursor"></span>`;
        textEl.classList.remove("flip-out");
        textEl.classList.add("flip-in");

        setTimeout(() => {
          textEl.classList.remove("flip-in");
        }, 260);
      }, 220);
    }, 300);
  }

  const hideLoader = () => {
    if (intervalId) clearInterval(intervalId);
    loaderEl.classList.add("hide");
  };

  if (document.readyState === "complete") {
    setTimeout(hideLoader, 1500);
  } else {
    window.addEventListener("load", () => {
      setTimeout(hideLoader, 1500);
    });
  }
}

export function initMobileMenu() {
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const nav = document.querySelector("nav");
  const mobileMenu = document.getElementById("mobile-menu");

  if (!hamburgerBtn || !nav || !mobileMenu) return;

  const closeMenu = () => {
    nav.classList.remove("menu-open");
    mobileMenu.classList.remove("active");
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
  };

  hamburgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    nav.classList.toggle("menu-open");
    mobileMenu.classList.toggle("active");
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) {
      closeMenu();
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

  const interactiveSelector = "a, button, input, select, textarea, [role='button'], .think-header, .think-link, .proj-card, .credential-card, .journal-card, .skill-pill, .timeline-card, .modal-close-btn, .btn";

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

export function initNavProgress() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  let svg = nav.querySelector(".nav-progress-border");
  let rect = nav.querySelector(".nav-progress-rect");

  if (!svg) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "nav-progress-border");
    svg.setAttribute("aria-hidden", "true");

    rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("class", "nav-progress-rect");

    svg.appendChild(rect);
    nav.appendChild(svg);
  }

  let hideTimer = null;

  const resetHideTimer = () => {
    svg.classList.remove("inactive");
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      svg.classList.add("inactive");
    }, 1000);
  };

  const updateProgress = () => {
    const width = nav.offsetWidth;
    const height = nav.offsetHeight;
    const strokeWidth = 1.5;

    if (width === 0 || height === 0) return;

    rect.setAttribute("x", strokeWidth / 2);
    rect.setAttribute("y", strokeWidth / 2);
    rect.setAttribute("width", Math.max(0, width - strokeWidth));
    rect.setAttribute("height", Math.max(0, height - strokeWidth));
    rect.setAttribute("rx", (height - strokeWidth) / 2);

    const totalLength = rect.getTotalLength();
    rect.style.strokeDasharray = totalLength;

    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const scrollProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));

    const offset = totalLength * (1 - scrollProgress);
    rect.style.strokeDashoffset = offset;
  };

  window.addEventListener("scroll", () => {
    updateProgress();
    resetHideTimer();
  }, { passive: true });

  window.addEventListener("resize", updateProgress);

  requestAnimationFrame(() => {
    updateProgress();
    resetHideTimer();
  });

  setTimeout(() => {
    updateProgress();
    resetHideTimer();
  }, 400);
}

export function initFooterClock() {
  const clockEl = document.getElementById("footer-local-time");
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
    clockEl.textContent = `${timeStr} IST`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

export function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}