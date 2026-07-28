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
    }, 85);
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

    const githubSVG = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;

    const codeforcesSVG = `<svg viewBox="0 0 24 24" width="22" height="22"><path fill="#F5B041" d="M4.5 7.5a1.5 1.5 0 0 1 1.5 1.5v11.25A1.5 1.5 0 0 1 4.5 21.75h-3A1.5 1.5 0 0 1 0 20.25V9A1.5 1.5 0 0 1 1.5 7.5h3z"/><path fill="#3498DB" d="M13.5 2.25a1.5 1.5 0 0 1 1.5 1.5v16.5a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5V3.75a1.5 1.5 0 0 1 1.5-1.5h3z"/><path fill="#E74C3C" d="M22.5 12a1.5 1.5 0 0 1 1.5 1.5v6.75a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5V13.5a1.5 1.5 0 0 1 1.5-1.5h3z"/></svg>`;

    const leetcodeSVG = `<svg viewBox="0 0 24 24" width="22" height="22" fill="#FFA116"><path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.195 1.823.662l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.536.553-1.387.039-1.901l-2.606-2.636a4.994 4.994 0 0 0-3.853-1.391c-1.464.004-2.855.59-3.876 1.624L3.486 12.35c-1.02 1.02-1.596 2.39-1.596 3.854 0 1.463.576 2.834 1.596 3.854l4.331 4.363c1.021 1.021 2.41 1.583 3.874 1.583s2.853-.562 3.874-1.583l2.607-2.607c.514-.514.496-1.365-.039-1.901-.535-.535-1.386-.553-1.9-.038zM20.811 13.01H10.666c-.71 0-1.286-.576-1.286-1.286s.576-1.286 1.286-1.286h10.145c.71 0 1.286.576 1.286 1.286s-.576 1.286-1.286 1.286z"/></svg>`;

    container.innerHTML = `
      <a href="https://github.com/${data.github?.username || "aryanmsrh"}" target="_blank" rel="noopener noreferrer" class="stat-card github" aria-label="GitHub Profile Stats">
        <div class="stat-icon-wrapper github-icon">${githubSVG}</div>
        <div class="stat-info">
          <div class="stat-header">
            <span class="stat-platform">GitHub</span>
            <span class="stat-badge green">${data.github?.contributions || "1.2k+"}</span>
          </div>
          <div class="stat-main">
            <span class="stat-value">${data.github?.stars || 0}</span>
            <span class="stat-label">Stars</span>
          </div>
          <div class="stat-sub">
            <span>${data.github?.repos || 0} Repos</span>
            <span class="dot">•</span>
            <span>${data.github?.forks || 0} Forks</span>
          </div>
        </div>
      </a>

      <a href="https://codeforces.com/profile/${data.codeforces?.handle || "aryanmsrh"}" target="_blank" rel="noopener noreferrer" class="stat-card codeforces" aria-label="Codeforces Profile Stats">
        <div class="stat-icon-wrapper cf-icon">${codeforcesSVG}</div>
        <div class="stat-info">
          <div class="stat-header">
            <span class="stat-platform">Codeforces</span>
            <span class="stat-badge red">${data.codeforces?.rank || "GM"}</span>
          </div>
          <div class="stat-main">
            <span class="stat-value">${data.codeforces?.rating || 0}</span>
            <span class="stat-label">Rating</span>
          </div>
          <div class="stat-sub">
            <span>Max ${data.codeforces?.maxRating || 0}</span>
            <span class="dot">•</span>
            <span>${data.codeforces?.solved || "0"} Solved</span>
          </div>
        </div>
      </a>

      <a href="https://leetcode.com/${data.leetcode?.username || "aryanmsrh"}" target="_blank" rel="noopener noreferrer" class="stat-card leetcode" aria-label="LeetCode Profile Stats">
        <div class="stat-icon-wrapper lc-icon">${leetcodeSVG}</div>
        <div class="stat-info">
          <div class="stat-header">
            <span class="stat-platform">LeetCode</span>
            <span class="stat-badge gold">${data.leetcode?.badge || "Knight"}</span>
          </div>
          <div class="stat-main">
            <span class="stat-value">${data.leetcode?.rating || 0}</span>
            <span class="stat-label">Rating</span>
          </div>
          <div class="stat-sub">
            <span>${data.leetcode?.globalRank || "Top 1%"}</span>
            <span class="dot">•</span>
            <span>${data.leetcode?.solved || "0"} Solved</span>
          </div>
        </div>
      </a>
    `;
  } catch (err) {
    console.error("Error loading stats data:", err);
  }
}
