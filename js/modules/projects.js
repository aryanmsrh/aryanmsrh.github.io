/**
 * Project Data & Modal Logic
 */

import { getSvg } from "./svg.js";

export let projects = {};

/**
 * Creates a project card DOM element.
 * @param {Object} p
 * @param {string} svgContent
 * @returns {HTMLElement}
 */
function createProjectCard(p, svgContent = "") {
  const card = document.createElement("div");
  card.className = "proj-card";

  if (p.id && (p.question || p.journey)) {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      openModal(p.id);
    });
  }

  const mediaHTML = svgContent || (p.image ? `<img class="proj-thumb" src="${p.image}" alt="${p.title}" />` : "");

  const tagsHTML = Array.isArray(p.tags)
    ? p.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")
    : "";

  const links = [];
  if (p.githubLink) {
    links.push(`<a href="${p.githubLink}" target="_blank">GitHub</a>`);
  }
  if (p.liveLink) {
    links.push(`<a href="${p.liveLink}" target="_blank">Demo</a>`);
  }
  if (p.youtubeLink) {
    links.push(`<a href="${p.youtubeLink}" target="_blank">Video</a>`);
  }
  const linksHTML = links.length > 0 ? `<div class="proj-links">${links.join("")}</div>` : "";

  card.innerHTML = `
    ${mediaHTML}
    <div class="proj-title">${p.title || ""}</div>
    <p class="proj-desc">${p.description || ""}</p>
    ${tagsHTML ? `<div class="proj-tags">${tagsHTML}</div>` : ""}
    ${linksHTML}
  `;

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
    <div class="proj-title">Unable to load projects</div>
    <p class="proj-desc">Failed to load project details. Please check your connection and try again.</p>
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

    const svgs = await Promise.all(
      projectsList.map((p) => (p.svg ? getSvg(p.svg) : Promise.resolve("")))
    );

    projectsList.forEach((p, index) => {
      if (p.id) {
        projects[p.id] = p;
      }
      const card = createProjectCard(p, svgs[index] || "");
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
    const journeyHTML = Array.isArray(p.journey)
      ? p.journey.map((t) => `<p>${t}</p>`).join("")
      : "";
    content.innerHTML = `
      <div class="modal-close" onclick="closeModal()">✕</div>
      <h3 class="eyebrow-q">The Question</h3>
      <p class="question">"${p.question || ""}"</p>
      <div class="journey">${journeyHTML}</div>
      <div class="stack mono" style="font-size:12px;color:rgba(255,255,255,0.5);">${p.stack || ""}</div>
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