/**
 * Videos Section Module
 */

export async function renderVideos() {
  const container = document.querySelector(".video-grid");
  if (!container) return;

  try {
    const res = await fetch("/data/videos.json");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const items = await res.json();

    container.innerHTML = items
      .map(
        (item) => `
        <div class="video-card">
          <div class="video-frame"><div class="play-btn">▶</div></div>
          <div class="video-label">${item.label}</div>
          <div class="video-title serif">${item.title}</div>
        </div>`
      )
      .join("");
  } catch (err) {
    console.error("Error loading videos data:", err);
  }
}
