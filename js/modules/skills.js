/**
 * Skills Section Module
 * Renders categorized skill domains from /data/skills.json
 */

export async function renderSkills() {
  const container = document.querySelector(".skills-grid");
  if (!container) return;

  try {
    const res = await fetch("/data/skills.json");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const categories = await res.json();

    container.innerHTML = categories
      .map((cat) => {
        const pillsHTML = cat.skills
          .map(
            (s) => `
          <span class="skill-pill ${s.highlight ? "highlight" : ""}">
            <span class="skill-name">${s.name}</span>
            ${s.level ? `<span class="skill-level">• ${s.level}</span>` : ""}
          </span>
        `
          )
          .join("");

        return `
          <div class="skills-card">
            <div class="skills-header">
              <h3 class="skills-category">${cat.category}</h3>
              <p class="skills-desc">${cat.description || ""}</p>
            </div>
            <div class="skills-pills">
              ${pillsHTML}
            </div>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Error loading skills data:", err);
  }
}
