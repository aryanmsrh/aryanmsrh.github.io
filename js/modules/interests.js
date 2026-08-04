/**
 * Interests Section Module ("Things I think about")
 */

import { getSvg } from "./svg.js";

export async function renderInterests() {
  const container = document.querySelector(".think-list");
  if (!container) return;

  try {
    const res = await fetch("/data/interests.json");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const items = await res.json();

    const [arrowSvg, chevronSvg] = await Promise.all([
      getSvg("assets/svgs/arrow-up-right.svg"),
      getSvg("assets/svgs/chevron-down.svg")
    ]);

    container.innerHTML = items
      .map((item, index) => {
        const hasItems = Array.isArray(item.items) && item.items.length > 0;
        const itemCount = hasItems ? item.items.length : 0;

        const subitemsHTML = hasItems
          ? item.items
              .map(
                (sub) => `
              <a href="${sub.url}" target="_blank" rel="noopener noreferrer" class="think-link">
                <div class="think-link-content">
                  <div class="think-link-title">${sub.title}</div>
                  ${sub.description ? `<div class="think-link-desc">${sub.description}</div>` : ""}
                </div>
                <div class="think-link-icon" aria-hidden="true">
                  ${arrowSvg}
                </div>
              </a>`
              )
              .join("")
          : "";

        return `
          <div class="think-item" ${hasItems ? 'data-collapsible="true"' : ''}>
            <div class="think-header" ${hasItems ? 'tabindex="0" role="button" aria-expanded="false"' : ''}>
              <div class="think-title-group">
                <span class="label">${item.label}</span>
                ${
                  hasItems
                    ? `<button class="think-toggle-badge" aria-label="Toggle ${item.label} links">
                        <span class="count">${itemCount} ${itemCount === 1 ? 'link' : 'links'}</span>
                        ${chevronSvg}
                      </button>`
                    : ""
                }
              </div>
              <span class="glyph">${item.glyph}</span>
            </div>
            ${
              hasItems
                ? `<div class="think-dropdown">
                    <div class="think-dropdown-inner">
                      <div class="think-links-grid">
                        ${subitemsHTML}
                      </div>
                    </div>
                  </div>`
                : ""
            }
          </div>`;
      })
      .join("");

    // Attach click and keyboard listeners for dropdown items
    container.querySelectorAll('.think-item[data-collapsible="true"]').forEach((item) => {
      const header = item.querySelector('.think-header');
      if (!header) return;

      const toggleDropdown = (e) => {
        // Prevent click if event originated inside a link
        if (e.target.closest('.think-link')) return;

        const isExpanded = item.classList.contains('open');
        item.classList.toggle('open');
        header.setAttribute('aria-expanded', !isExpanded);
      };

      header.addEventListener('click', toggleDropdown);

      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleDropdown(e);
        }
      });
    });

  } catch (err) {
    console.error("Error loading interests data:", err);
  }
}
