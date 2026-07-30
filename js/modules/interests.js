/**
 * Interests Section Module ("Things I think about")
 */

export async function renderInterests() {
  const container = document.querySelector(".think-list");
  if (!container) return;

  try {
    const res = await fetch("/data/interests.json");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const items = await res.json();

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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
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
                        <svg class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
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
