import { setupMobileNavbar } from "./js/navbar.js";
import { animateHero } from './js/heroAnimation.js';
import { setupThemeObserver } from './js/themeToggleOnScroll.js';
import { floatingButton } from "./js/floatingButton.js";
import { initEmailJS } from './js/email.js';
import { initCanvas } from './js/networkCanvas.js';
import { setupLanguageToggle } from "./js/languageToggle.js";

document.addEventListener("DOMContentLoaded", () => {
  setupLanguageToggle();
  setupMobileNavbar();
  animateHero();
  setupThemeObserver();
  floatingButton();
  initEmailJS();
  console.log("Si estás viendo esto te mando un saludo.");
  initCanvas();
});