/**
 * About Section Module
 */

export async function renderAbout() {
  const container = document.querySelector(".about-grid");
  if (!container) return;

  try {
    const res = await fetch("/data/about.json");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();

    const paragraphsHTML = Array.isArray(data.paragraphs)
      ? data.paragraphs
          .map(
            (p, index) =>
              `<p class="${index === 0 ? "about-head-p" : "about-followup-p"}">${p}</p>`
          )
          .join("\n          ")
      : "";

    const factsHTML = Array.isArray(data.facts)
      ? data.facts
          .map((f) => `<div><b>${f.label}</b> — ${f.value}</div>`)
          .join("\n          ")
      : "";

    container.innerHTML = `
        <div class="about-text">
          ${paragraphsHTML}
        </div>
        <div class="about-facts">
          ${factsHTML}
        </div>
    `;
  } catch (err) {
    console.error("Error loading about data:", err);
  }
}
