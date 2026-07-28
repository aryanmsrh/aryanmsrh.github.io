/**
 * Contact Section Module
 */

import { getSvg } from "./svg.js";

export async function renderContact() {
  const container = document.querySelector(".contact-grid");
  if (!container) return;

  try {
    const res = await fetch("/data/contact.json");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const items = await res.json();

    const svgs = await Promise.all(
      items.map((item) => (item.svg ? getSvg(item.svg) : Promise.resolve("")))
    );

    container.innerHTML = items
      .map(
        (item, index) => `
        <a class="contact-item" href="${item.url}"${item.target ? ` target="${item.target}"` : ""}>
          ${svgs[index] || ""}
          <span class="contact-label">${item.label}</span><span class="contact-sub">${item.sub}</span>
        </a>`
      )
      .join("");
  } catch (err) {
    console.error("Error loading contact data:", err);
  }
}
