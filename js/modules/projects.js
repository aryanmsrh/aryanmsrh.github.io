/**
 * Project Data & Modal Logic with 3D Tilt Hover and Landscape Modal Header
 */

import { getSvg } from "./svg.js";

export let projects = {};

let modalIcons = {
  github: "",
  grid: "",
  youtube: ""
};

/**
 * Attaches interactive 3D tilt and mouse-depressed corner hover effect with dynamic shine gradient.
 * @param {HTMLElement} card
 */
function initCardHoverEffect(card) {
  const shine = card.querySelector(".proj-shine");

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Corner depression tilt math
    const rotateX = ((y - centerY) / centerY) * -6; // deg
    const rotateY = ((x - centerX) / centerX) * 6;  // deg

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;

    if (shine) {
      shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.12), transparent 70%)`;
      shine.style.opacity = "1";
    }
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    if (shine) {
      shine.style.opacity = "0";
    }
  });
}

/**
 * Creates a project card DOM element.
 * @param {Object} p
 * @returns {HTMLElement}
 */
function createProjectCard(p) {
  const card = document.createElement("div");
  card.className = "proj-card";

  if (p.id) {
    card.dataset.id = p.id;
    card.classList.add(`proj-card-${p.id}`);
  }

  if (p.id && (p.question || p.journey)) {
    card.addEventListener("click", (e) => {
      openModal(p.id);
    });
  }

  const tagsHTML = Array.isArray(p.tags)
    ? p.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")
    : "";

  const imageSrc = p.image || "assets/imgs/project-nn.jpg";

  card.innerHTML = `
    <div class="proj-media-container">
      <img class="proj-thumb" src="${imageSrc}" alt="${p.title || "Project Thumbnail"}" />
      <div class="proj-media-overlay">
        <button class="proj-open-btn" aria-label="Open project modal">
          <span>Open</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </button>
      </div>
    </div>
    <div class="proj-card-body">
      <div class="proj-title">${p.title || ""}</div>
      <p class="proj-desc">${p.description || ""}</p>
      ${tagsHTML ? `<div class="proj-tags">${tagsHTML}</div>` : ""}
    </div>
    <div class="proj-shine"></div>
  `;

  initCardHoverEffect(card);
  return card;
}

/**
 * Render fallback UI if project data loading fails.
 * @param {HTMLElement} container
 */
function renderFallbackUI(container) {
  container.innerHTML = "";
  const errorCard = document.createElement("div");
  errorCard.className = "proj-card";
  errorCard.innerHTML = `
    <div class="proj-card-body">
      <div class="proj-title">Unable to load projects</div>
      <p class="proj-desc">Failed to load project details. Please check your connection and try again.</p>
    </div>
  `;
  container.appendChild(errorCard);
}

/**
 * Asynchronously fetch project data from /data/projects.json and dynamically inject project cards.
 */
export async function renderProjects() {
  const container = document.querySelector(".proj-grid");
  if (!container) return;

  try {
    const res = await fetch("/data/projects.json");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const projectsList = await res.json();

    container.innerHTML = "";
    projects = {};

    // Cache icons for CTA buttons in modal
    const [ghSvg, extSvg, ytSvg] = await Promise.all([
      getSvg("assets/svgs/github.svg"),
      getSvg("assets/svgs/external-link.svg"),
      getSvg("assets/svgs/youtube.svg")
    ]);

    modalIcons.github = ghSvg;
    modalIcons.external = extSvg;
    modalIcons.youtube = ytSvg;

    projectsList.forEach((p) => {
      if (p.id) {
        projects[p.id] = p;
      }
      const card = createProjectCard(p);
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading projects:", err);
    renderFallbackUI(container);
  }
}

export function openModal(id) {
  const p = projects[id];
  if (!p) return;

  const content = document.getElementById("modal-content");
  const backdrop = document.getElementById("modal-backdrop");

  if (content && backdrop) {
    content.className = "modal";
    const journeyHTML = Array.isArray(p.journey)
      ? p.journey.map((t) => `<p>${t}</p>`).join("")
      : "";

    const imageSrc = p.image || "assets/imgs/project-nn.jpg";

    content.innerHTML = `
      <div class="modal-banner-container">
        <img src="${imageSrc}" alt="${p.title || "Project"}" class="modal-banner-img" />
        <div class="modal-banner-overlay"></div>
        <div class="modal-close-btn" onclick="closeModal()" aria-label="Close modal">✕</div>
        <div class="modal-cta-bar">
          ${
            p.githubLink
              ? `<a href="${p.githubLink}" target="_blank" rel="noopener noreferrer" class="modal-cta-btn" title="GitHub Repository" aria-label="GitHub Repository">
                  ${modalIcons.github}
                </a>`
              : `<span class="modal-cta-btn disabled" title="GitHub Repository (Unavailable)" aria-label="GitHub Repository (Unavailable)">
                  ${modalIcons.github}
                </span>`
          }
          ${
            p.liveLink
              ? `<a href="${p.liveLink}" target="_blank" rel="noopener noreferrer" class="modal-cta-btn" title="Live Demo" aria-label="Live Demo">
                  ${modalIcons.external}
                </a>`
              : `<span class="modal-cta-btn disabled" title="Live Demo (Unavailable)" aria-label="Live Demo (Unavailable)">
                  ${modalIcons.external}
                </span>`
          }
          ${
            p.youtubeLink
              ? `<a href="${p.youtubeLink}" target="_blank" rel="noopener noreferrer" class="modal-cta-btn" title="Watch Video Demo" aria-label="Watch Video Demo">
                  ${modalIcons.youtube}
                </a>`
              : `<span class="modal-cta-btn disabled" title="Watch Video Demo (Unavailable)" aria-label="Watch Video Demo (Unavailable)">
                  ${modalIcons.youtube}
                </span>`
          }
        </div>
      </div>
      <div class="modal-body">
        <h2 class="modal-title">${p.title || ""}</h2>
        <h3 class="eyebrow-q">The Question</h3>
        <p class="question">"${p.question || ""}"</p>
        <div class="journey">${journeyHTML}</div>
        <div class="stack mono">${p.stack || ""}</div>
      </div>
    `;
    backdrop.classList.add("open");
  }
}

export function closeModal() {
  document.getElementById("modal-backdrop")?.classList.remove("open");
}

export function initModalListeners() {
  // Bind to window so inline 'onclick="closeModal()"' still functions seamlessly
  window.openModal = openModal;
  window.closeModal = closeModal;

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  renderProjects();
}