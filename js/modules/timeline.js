/**
 * Timeline Section Module
 */

export async function renderTimeline() {
  const container = document.querySelector(".tl");
  if (!container) return;

  try {
    const res = await fetch("/data/timeline.json");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const items = await res.json();

    container.innerHTML = items
      .map(
        (item) => `
        <div class="tl-item">
          <div class="tl-year">${item.year}</div>
          <div class="tl-title">${item.title}</div>
          <div class="tl-desc">${item.description}</div>
        </div>`
      )
      .join("");
  } catch (err) {
    console.error("Error loading timeline data:", err);
  }
}
