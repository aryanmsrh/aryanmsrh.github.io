import { initLoader, initMobileMenu, initScrollIndicator } from "./modules/ui.js";
import { initScrollObserver } from "./modules/observer.js";
import { initModalListeners } from "./modules/projects.js";
import { initCanvas } from "./modules/canvas.js";
import { renderAbout } from "./modules/about.js";
import { renderInterests } from "./modules/interests.js";
import { renderTimeline } from "./modules/timeline.js";
import { renderVideos } from "./modules/videos.js";
import { renderContact } from "./modules/contact.js";
import { initTypewriter, renderHeroStats } from "./modules/hero.js";

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initMobileMenu();
  initScrollIndicator();
  initScrollObserver();
  initModalListeners();
  initCanvas();
  initTypewriter();
  renderHeroStats();
  renderAbout();
  renderInterests();
  renderTimeline();
  renderVideos();
  renderContact();
});