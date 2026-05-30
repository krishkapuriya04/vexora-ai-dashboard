/**
 * VEXORA Dashboard App
 * Main bootstrap for all authenticated app pages.
 */

import VexoraTheme from './theme.js';
import VexoraAnimations from './animations.js';
import { initMicroInteractions } from './micro-interactions.js';
import {
  initShell,
  bindShellEvents,
  initRippleEffect,
  initSkeletonLoader,
  initPageTransition,
} from './shell.js';

/**
 * Initialize shared app infrastructure
 * @param {Object} config
 * @param {string} config.activePage
 * @param {string} config.pageTitle
 * @param {Function} [config.onReady] - Page-specific init callback
 */
export function initApp({ activePage, pageTitle, onReady }) {
  VexoraTheme.init();
  initShell({ activePage, pageTitle });
  bindShellEvents();
  initRippleEffect();
  initSkeletonLoader();
  initPageTransition();

  /* Theme toggle handler */
  document.addEventListener('vexora:toggle-theme', () => {
    VexoraTheme.toggle();
    updateThemeIcon();
  });

  updateThemeIcon();

  /* Scroll-triggered reveals on app pages */
  VexoraAnimations.init();

  /* Page-specific initialization (charts must exist before reveal) */
  if (typeof onReady === 'function') {
    onReady();
  }

  /* Premium micro-interactions */
  initMicroInteractions();
}

/**
 * Sync theme toggle icon with current theme
 */
function updateThemeIcon() {
  const isDark = VexoraTheme.getCurrent() === 'dark';
  document.body.classList.toggle('theme-dark', isDark);
  document.body.classList.toggle('theme-light', !isDark);
}

/**
 * Register a chart instance for cleanup (future use)
 * @param {Chart} chart
 */
const chartRegistry = [];

export function registerChart(chart) {
  if (chart) chartRegistry.push(chart);
}

export { VexoraTheme, VexoraAnimations };
