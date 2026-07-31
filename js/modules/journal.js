/**
 * Journal Section Module
 * Renders blog posts, video walkthroughs, and build logs from /data/journal.json
 * Opens a Medium-style reading modal on card click.
 */

let journalItems = {};

export function openJournalModal(item) {
  const content = document.getElementById("modal-content");
  const backdrop = document.getElementById("modal-backdrop");

  if (!content || !backdrop) return;

  const bodyHTML = Array.isArray(item.content)
    ? item.content
        .map((block) => {
          if (block.startsWith("### ")) {
            return `<h3>${block.replace("### ", "")}</h3>`;
          } else if (block.includes("\n• ") || block.includes("\n1. ")) {
            const lines = block.split("\n");
            const listItems = lines
              .slice(1)
              .map((l) => `<li>${l.replace(/^([•0-9]+\.\s*)/, "")}</li>`)
              .join("");
            return `<p><strong>${lines[0]}</strong></p><ul>${listItems}</ul>`;
          }
          return `<p>${block}</p>`;
        })
        .join("")
    : `<p>${item.content || ""}</p>`;

  const headerMedia = item.youtubeId
    ? `<div style="position:relative; width:100%; aspect-ratio:16/9; background:#000;">
        <iframe
          src="https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0"
          title="${item.title || "Video"}"
          frameborder="0"
          style="width:100%; height:100%; border:0;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
        <div class="modal-close-btn" onclick="closeModal()" aria-label="Close modal">✕</div>
       </div>`
    : `<div class="modal-banner-container">
        <img src="${item.image || "assets/imgs/project-nn.png"}" alt="${item.title || "Header Image"}" class="modal-banner-img" />
        <div class="modal-banner-overlay"></div>
        <div class="modal-close-btn" onclick="closeModal()" aria-label="Close modal">✕</div>
       </div>`;

  content.innerHTML = `
    ${headerMedia}
    <div class="journal-modal-body">
      <div class="journal-modal-meta">
        <span>[${item.type || "Article"}]</span>
        <span>•</span>
        <span>${item.date || ""}</span>
        <span>•</span>
        <span>${item.readTime || ""}</span>
      </div>
      <h2 class="journal-modal-title">${item.title || ""}</h2>
      ${item.subtitle ? `<p class="journal-modal-subtitle">${item.subtitle}</p>` : ""}
      <div class="journal-modal-content">
        ${bodyHTML}
      </div>
    </div>
  `;

  backdrop.classList.add("open");
}

export async function renderJournal() {
  const container = document.querySelector(".journal-grid");
  if (!container) return;

  try {
    const res = await fetch("/data/journal.json");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const items = await res.json();
    journalItems = {};

    container.innerHTML = "";

    items.forEach((item) => {
      if (item.id) journalItems[item.id] = item;

      const card = document.createElement("div");
      card.className = "journal-card";

      const thumbSrc = item.youtubeId
        ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`
        : item.image || "assets/imgs/project-nn.png";

      const playOverlay = item.youtubeId
        ? `<div class="journal-play-overlay"><div class="journal-play-btn">▶</div></div>`
        : "";

      card.innerHTML = `
        <div class="journal-thumb-wrap">
          <img class="journal-thumb" src="${thumbSrc}" alt="${item.title || "Journal cover"}" />
          ${playOverlay}
          <div class="journal-badge">${item.type || "Article"}</div>
        </div>
        <div class="journal-card-body">
          <div class="journal-meta">
            <span>${item.date || ""}</span>
            <span>•</span>
            <span>${item.readTime || ""}</span>
          </div>
          <h3 class="journal-title">${item.title || ""}</h3>
          <p class="journal-excerpt">${item.excerpt || ""}</p>
        </div>
      `;

      card.addEventListener("click", () => openJournalModal(item));
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading journal data:", err);
  }
}
