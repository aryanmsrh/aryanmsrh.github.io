/**
 * Journal Section Module with Full Markdown & KaTeX LaTeX Support
 * Renders blog posts, video walkthroughs, and build logs from /data/journal.json
 * Opens a Medium-style reading modal on card click.
 */

import { getSvg } from "./svg.js";

let journalItems = {};

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function parseMarkdown(text) {
  if (typeof text !== "string") return "";

  let html = text;

  // Preserve fenced code blocks
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(
      `<pre class="journal-code-block"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`
    );
    return placeholder;
  });

  // Blockquotes
  html = html.replace(/^>\s+(.*$)/gim, "<blockquote>$1</blockquote>");

  // Headings
  html = html.replace(/^###### (.*$)/gim, "<h6>$1</h6>");
  html = html.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
  html = html.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Inline formatting
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, '<code class="journal-inline-code">$1</code>');
  html = html.replace(/\[youtube:\s*([a-zA-Z0-9_-]+)\]/g, (_, id) => {
    return `<div class="journal-inline-video"><iframe src="https://www.youtube.com/embed/${id}?rel=0" title="YouTube Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="journal-link">$1</a>');

  // Bullet lists (group contiguous list items into a single <ul>)
  html = html.replace(/(?:^\s*[-•*]\s+.*(?:\n|$))+/gm, (listBlock) => {
    const items = listBlock
      .trim()
      .split("\n")
      .map((line) => line.replace(/^\s*[-•*]\s+(.*$)/, "<li>$1</li>"))
      .join("");
    return `<ul>${items}</ul>`;
  });

  // Paragraph splitting
  const blocks = html.split(/\n\n+/);
  html = blocks
    .map((b) => {
      b = b.trim();
      if (!b) return "";
      if (
        b.startsWith("<h") ||
        b.startsWith("<pre") ||
        b.startsWith("<blockquote") ||
        b.startsWith("<ul") ||
        b.startsWith("__CODE_BLOCK")
      ) {
        return b;
      }
      return `<p>${b.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  // Restore code blocks
  codeBlocks.forEach((cb, idx) => {
    html = html.replace(`__CODE_BLOCK_${idx}__`, cb);
  });

  return html;
}

export function openJournalModal(item) {
  const content = document.getElementById("modal-content");
  const backdrop = document.getElementById("modal-backdrop");

  if (!content || !backdrop) return;

  content.className = "modal journal-modal-wide";

  const bodyHTML = Array.isArray(item.content)
    ? item.content.map((block) => parseMarkdown(block)).join("\n")
    : parseMarkdown(item.content || "");

  const headerMedia = `<div class="modal-banner-container">
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

  // Trigger KaTeX LaTeX Math Auto-render
  const journalContentEl = content.querySelector(".journal-modal-content");
  if (journalContentEl && window.renderMathInElement) {
    window.renderMathInElement(journalContentEl, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false }
      ],
      throwOnError: false
    });
  }
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
    
    const arrowRightSvg = await getSvg("assets/svgs/arrow-right.svg");

    items.forEach((item) => {
      if (item.id) journalItems[item.id] = item;

      const card = document.createElement("div");
      card.className = "journal-card";

      const thumbSrc = item.image || "assets/imgs/project-nn.png";

      card.innerHTML = `
        <div class="journal-thumb-wrap">
          <img class="journal-thumb" src="${thumbSrc}" alt="${item.title || "Journal cover"}" />
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
          <div class="journal-read-link">
            <span>Read</span>
            ${arrowRightSvg}
          </div>
        </div>
      `;

      card.addEventListener("click", () => openJournalModal(item));
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading journal data:", err);
  }
}
