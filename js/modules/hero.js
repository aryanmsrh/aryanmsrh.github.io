/**
 * Hero Section Module: Typewriter effect and Stat Highlight Cards
 */

export function initTypewriter() {
  const textEl = document.getElementById("hero-name-text");
  if (!textEl) return;

  const fullText = "ARYAN MISHRA";
  textEl.textContent = "";
  let index = 0;

  const startTyping = () => {
    textEl.textContent = "";
    index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        textEl.textContent += fullText.charAt(index);
        index++;
      } else {
        clearInterval(timer);
      }
    }, 120);
  };

  const loader = document.getElementById("loader");
  if (!loader || loader.classList.contains("hide")) {
    setTimeout(startTyping, 300);
  } else {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class" && loader.classList.contains("hide")) {
          setTimeout(startTyping, 300);
          observer.disconnect();
        }
      });
    });
    observer.observe(loader, { attributes: true });
  }
}

export async function renderHeroStats() {
  const container = document.getElementById("hero-stats");
  if (!container) return;

  try {
    const res = await fetch("/data/stats.json");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    const statsList = Array.isArray(data.stats)
      ? data.stats.filter((item) => item.active !== false && item.showInHero !== false)
      : [];

    if (statsList.length === 0) return;

    container.innerHTML = statsList
      .map((item) => {
        const subContent = Array.isArray(item.sub)
          ? item.sub.join(' <span class="dot">•</span> ')
          : item.sub || "";

        const labelContent = item.label
          ? `<span class="stat-label">${item.label}</span>`
          : "";

        const styleAttr = item.accentColor
          ? `style="--card-accent: ${item.accentColor};"`
          : "";

        return `
          <a href="${item.url || "#"}" target="_blank" rel="noopener noreferrer" class="stat-card ${item.id || ""}" ${styleAttr} aria-label="${item.platform || item.id || "Stat"} Profile Stats">
            <div class="stat-icon-wrapper">${item.svg || ""}</div>
            <div class="stat-info">
              <div class="stat-header">
                <span class="stat-platform">${item.platform || ""}</span>
                ${item.badge ? `<span class="stat-badge">${item.badge}</span>` : ""}
              </div>
              <div class="stat-main">
                <span class="stat-value">${item.value || ""}</span>
                ${labelContent}
              </div>
              <div class="stat-sub">${subContent}</div>
            </div>
          </a>
        `;
      })
      .join("");

    container.addEventListener(
      "wheel",
      (e) => {
        if (e.deltaY !== 0 && !e.shiftKey) {
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
    console.error("Error loading stats data:", err);
  }
}
