/**
 * VEXORA API configuration (load before any module that calls the API).
 *
 * Resolution order (see getApiBase in auth-client.js):
 *   1. window.VEXORA_API_BASE (set here or inline before this script)
 *   2. <meta name="vexora-api-base" content="https://api.example.com">
 *   3. Auto-detect (localhost → :5000, same-origin on unified deploy)
 *
 * Production static frontend (GitHub Pages) + Render backend:
 *   window.VEXORA_API_BASE = 'https://your-app.onrender.com';
 *
 * See js/api-config.production.example.js and DEPLOYMENT-PRODUCTION.md
 */
(function initVexoraApiConfig() {
  if (typeof window === 'undefined') return;

  if (window.VEXORA_API_BASE) {
    window.VEXORA_API_BASE = String(window.VEXORA_API_BASE).replace(/\/$/, '');
    return;
  }

  const meta = document.querySelector('meta[name="vexora-api-base"]');
  const fromMeta = meta?.getAttribute('content')?.trim();
  if (fromMeta) {
    window.VEXORA_API_BASE = fromMeta.replace(/\/$/, '');
  }
})();
