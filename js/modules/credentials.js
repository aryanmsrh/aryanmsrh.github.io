/**
 * Credentials Section Module
 * Renders detailed credential cards from /data/stats.json
 */

export async function renderCredentials() {
  const container = document.querySelector(".credentials-grid");
  if (!container) return;

  try {
    const res = await fetch("/data/stats.json");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    const statsList = Array.isArray(data.stats)
      ? data.stats.filter((item) => item.active !== false)
      : [];

    if (statsList.length === 0) return;

    container.innerHTML = statsList
      .map((item) => {
        const subContent = Array.isArray(item.sub)
          ? item.sub.join(' <span class="dot">•</span> ')
          : item.sub || "";

        const styleAttr = item.accentColor
          ? `style="--card-accent: ${item.accentColor};"`
          : "";

        return `
          <div class="credential-card ${item.id || ""}" ${styleAttr}>
            <div class="cred-header">
              <div class="cred-icon">${item.svg || ""}</div>
              <div class="cred-main-info">
                <span class="cred-platform">${item.platform || ""}</span>
                <div class="cred-value-wrap">
                  <span class="cred-value">${item.value || ""}</span>
                  ${item.label ? `<span class="cred-label">${item.label}</span>` : ""}
                </div>
              </div>
              ${item.badge ? `<span class="cred-badge">${item.badge}</span>` : ""}
            </div>
            ${item.content ? `<p class="cred-content">${item.content}</p>` : ""}
            <div class="cred-footer">
              <div class="cred-sub">${subContent}</div>
              ${
                item.url
                  ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="cred-link" aria-label="View ${item.platform} details">
                      View Profile
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </a>`
                  : ""
              }
            </div>
          </div>
        `;
      })
      .join("");

    container.addEventListener(
      "wheel",
      (e) => {
        if (container.scrollWidth > container.clientWidth && e.deltaY !== 0 && !e.shiftKey) {
          e.preventDefault();
          container.scrollBy({
            left: e.deltaY * 1.2,
            behavior: "smooth"
          });
        }
      },
      { passive: false }
    );
  } catch (err) {
    console.error("Error loading credentials data:", err);
  }
}
