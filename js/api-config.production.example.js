/**
 * Production API override — copy to api-config.js or inject before app scripts.
 *
 * GitHub Pages / static frontend + Render backend:
 *   window.VEXORA_API_BASE = 'https://your-service.onrender.com';
 *
 * Unified deploy (frontend + API same Render service):
 *   Leave unset — same-origin routing handles API calls.
 */
window.VEXORA_API_BASE = 'https://your-vexora-api.onrender.com';
