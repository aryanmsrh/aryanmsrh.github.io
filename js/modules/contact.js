/**
 * Contact Section Module
 */

export async function renderContact() {
  const container = document.querySelector(".contact-grid");
  if (!container) return;

  try {
    const res = await fetch("/data/contact.json");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const items = await res.json();

    container.innerHTML = items
      .map(
        (item) => `
        <a class="contact-item" href="${item.url}"${item.target ? ` target="${item.target}"` : ""}>
          ${item.svg}
          <span class="contact-label">${item.label}</span><span class="contact-sub">${item.sub}</span>
        </a>`
      )
      .join("");
  } catch (err) {
    console.error("Error loading contact data:", err);
  }
}
