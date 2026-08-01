import { initLoader, initMobileMenu, initScrollIndicator, initSvgElements, initMouseShadow, initCustomCursor, initNavProgress, initFooterClock, initBackToTop, initSectionCollapse } from "./modules/ui.js";
import { initScrollObserver } from "./modules/observer.js";
import { initModalListeners } from "./modules/projects.js";
import { initCanvas } from "./modules/canvas.js";
import { renderAbout } from "./modules/about.js";
import { renderCredentials } from "./modules/credentials.js";
import { renderSkills } from "./modules/skills.js";
import { renderTimeline } from "./modules/timeline.js";
import { renderInterests } from "./modules/interests.js";
import { renderJournal } from "./modules/journal.js";
import { renderContact } from "./modules/contact.js";
import { initTypewriter, renderHeroStats } from "./modules/hero.js";

document.addEventListener("DOMContentLoaded", async () => {
  initSvgElements();
  initLoader();
  initMobileMenu();
  initScrollIndicator();
  initMouseShadow();
  initCustomCursor();
  initNavProgress();
  initFooterClock();
  initBackToTop();
  initCanvas();
  initTypewriter();

  await Promise.all([
    renderHeroStats(),
    renderAbout(),
    renderCredentials(),
    renderSkills(),
    renderTimeline(),
    renderInterests(),
    renderJournal(),
    renderContact()
  ]);

  initSectionCollapse();
  initScrollObserver();
  initModalListeners();
});