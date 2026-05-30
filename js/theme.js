/**
 * VEXORA Theme Module
 * Manages theme state, CSS variable overrides, and system preference detection.
 */

const VexoraTheme = (() => {
  const STORAGE_KEY = 'vexora-theme';
  const DEFAULT_THEME = 'dark';

  /**
   * Apply theme to document root
   * @param {string} theme - Theme identifier ('dark' | 'light')
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  /**
   * Initialize theme from stored preference or system default
   */
  function init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : DEFAULT_THEME);
    applyTheme(theme);
  }

  /**
   * Toggle between dark and light themes
   * @returns {string} The newly applied theme
   */
  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    return next;
  }

  /**
   * Get current active theme
   * @returns {string}
   */
  function getCurrent() {
    return document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
  }

  return { init, toggle, applyTheme, getCurrent };
})();

export default VexoraTheme;
