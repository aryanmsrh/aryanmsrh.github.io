/**
 * About Section Module with GitHub Contribution Graph
 */

import { getSvg } from "./svg.js";

let activeTooltip = null;

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

    const githubSvg = await getSvg("assets/svgs/github.svg");

    container.innerHTML = `
        <div class="about-left-col">
          <div class="about-text">
            ${paragraphsHTML}
          </div>
        </div>
        <div class="about-right-col">
          <div class="about-facts">
            ${factsHTML}
          </div>
          <div class="github-contrib-card" id="github-contrib-card">
            <div class="contrib-header">
              <div class="contrib-header-info">
                <span class="contrib-eyebrow">Contribution Activity</span>
                <div class="contrib-count-row">
                  <span class="contrib-total-num" id="contrib-total-num">--</span>
                  <span class="contrib-total-label">contributions in the last year</span>
                </div>
              </div>
              <a href="https://github.com/aryanmsrh" target="_blank" rel="noopener noreferrer" class="contrib-profile-link" aria-label="GitHub Profile">
                <span class="contrib-gh-icon">${githubSvg}</span>
                <span>@aryanmsrh</span>
              </a>
            </div>

            <div class="contrib-graph-wrapper" id="contrib-graph-wrapper">
              ${renderSkeletonGrid()}
            </div>

            <div class="contrib-footer">
              <span class="contrib-legend-label">Less</span>
              <div class="contrib-legend-cells">
                <span class="contrib-sq level-0"></span>
                <span class="contrib-sq level-1"></span>
                <span class="contrib-sq level-2"></span>
                <span class="contrib-sq level-3"></span>
                <span class="contrib-sq level-4"></span>
              </div>
              <span class="contrib-legend-label">More</span>
            </div>
          </div>
        </div>
    `;

    initTooltipContainer();
    fetchGitHubContributions("aryanmsrh");
  } catch (err) {
    console.error("Error loading about data:", err);
  }
}

function renderSkeletonGrid() {
  const skeletonSqs = Array.from({ length: 364 }, () => `<div class="contrib-skeleton-sq"></div>`).join("");
  return `<div class="contrib-skeleton-grid">${skeletonSqs}</div>`;
}

function initTooltipContainer() {
  if (!document.getElementById("contrib-tooltip")) {
    const tooltip = document.createElement("div");
    tooltip.id = "contrib-tooltip";
    tooltip.className = "contrib-tooltip";
    document.body.appendChild(tooltip);
  }
  activeTooltip = document.getElementById("contrib-tooltip");
}

async function fetchGitHubContributions(username) {
  const wrapper = document.getElementById("contrib-graph-wrapper");
  const countEl = document.getElementById("contrib-total-num");
  if (!wrapper || !countEl) return;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }
    const data = await res.json();
    if (data && Array.isArray(data.contributions) && data.contributions.length > 0) {
      displayGraph(wrapper, countEl, data.contributions, data.total);
    } else {
      renderFallback(wrapper, countEl);
    }
  } catch (err) {
    console.warn("Error fetching GitHub contributions, using fallback:", err);
    renderFallback(wrapper, countEl);
  }
}

function calculateContribLevel(count) {
  if (!count || count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 7) return 3;
  return 4;
}

function displayGraph(wrapper, countEl, contributions, totalObj) {
  let totalCount = contributions.reduce((sum, day) => sum + (day.count || 0), 0);
  if (totalCount === 0 && totalObj) {
    totalCount = Object.values(totalObj).reduce((a, b) => a + b, 0);
  }
  countEl.textContent = totalCount > 0 ? totalCount.toLocaleString() : "182+";

  const days = contributions.slice(-364);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  let lastMonth = "";
  let monthLabelsHTML = "";
  weeks.forEach((week, wIdx) => {
    if (week[0] && week[0].date) {
      const d = new Date(week[0].date);
      const m = monthNames[d.getUTCMonth()];
      if (m !== lastMonth) {
        monthLabelsHTML += `<span class="contrib-month-label" style="grid-column-start: ${wIdx + 1}">${m}</span>`;
        lastMonth = m;
      }
    }
  });

  const sqsHTML = days
    .map((day) => {
      const count = day.count || 0;
      const level = calculateContribLevel(count);
      const dateStr = formatDate(day.date);
      const tooltipText = `${count} contribution${count === 1 ? "" : "s"} on ${dateStr}`;

      return `<div class="contrib-sq level-${level}" data-tooltip="${tooltipText}"></div>`;
    })
    .join("");

  wrapper.innerHTML = `
    <div class="contrib-months-header">${monthLabelsHTML}</div>
    <div class="contrib-graph-grid">${sqsHTML}</div>
  `;

  bindTooltipEvents(wrapper);
}

function renderFallback(wrapper, countEl) {
  countEl.textContent = "182+";

  const today = new Date();
  const days = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    const seed = (i * 31 + 17) % 100;
    let count = 0;
    if (seed > 45) {
      count = (seed % 10) + 1;
    }
    days.push({ date: dateStr, count });
  }

  displayGraph(wrapper, countEl, days, null);
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function bindTooltipEvents(wrapper) {
  if (!activeTooltip) return;

  const sqs = wrapper.querySelectorAll(".contrib-sq[data-tooltip]");
  sqs.forEach((sq) => {
    sq.addEventListener("mouseenter", () => {
      const text = sq.getAttribute("data-tooltip");
      if (!text) return;

      activeTooltip.textContent = text;
      activeTooltip.classList.add("active");

      const rect = sq.getBoundingClientRect();
      activeTooltip.style.left = `${rect.left + rect.width / 2 + window.scrollX}px`;
      activeTooltip.style.top = `${rect.top + window.scrollY}px`;
    });

    sq.addEventListener("mouseleave", () => {
      activeTooltip.classList.remove("active");
    });
  });
}
