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
      .map(
        (item) => `
        <div class="think-item">
          <span class="label">${item.label}</span><span class="glyph">${item.glyph}</span>
        </div>`
      )
      .join("");
  } catch (err) {
    console.error("Error loading interests data:", err);
  }
}
