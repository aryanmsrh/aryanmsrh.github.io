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

    container.innerHTML = "";

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "video-card";

      const thumbHTML = item.youtubeId
        ? `<img class="video-thumb" src="https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg" alt="${item.title || "Video thumbnail"}" />`
        : "";

      card.innerHTML = `
        <div class="video-frame" tabIndex="0" role="button" aria-label="Play ${item.title || "video"}">
          ${thumbHTML}
          <div class="play-btn">▶</div>
        </div>
        <div class="video-label">${item.label || ""}</div>
        <div class="video-title serif">${item.title || ""}</div>
      `;

      const frame = card.querySelector(".video-frame");
      if (frame && item.youtubeId) {
        const startVideo = () => {
          if (frame.classList.contains("playing")) return;
          frame.classList.add("playing");
          frame.innerHTML = `
            <iframe
              src="https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0"
              title="${item.title || "Video"}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          `;
          frame.style.cursor = "default";
        };

        frame.addEventListener("click", startVideo);
        frame.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            startVideo();
          }
        });
      }

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading videos data:", err);
  }
}
