/**
 * VEXORA Settings Page
 * Profile, workspace, notifications, appearance, security, integrations, billing.
 */

import { initApp } from '../dashboard-app.js';
import { SETTINGS_SECTIONS, INTEGRATIONS } from '../mock-data.js';
import VexoraTheme from '../theme.js';

function renderSettingsNav() {
  const nav = document.getElementById('settings-nav');
  if (!nav) return;

  nav.innerHTML = SETTINGS_SECTIONS.map((s) => `
    <button class="settings-nav__link" type="button" data-panel="${s.id}" aria-selected="false">
      <span aria-hidden="true">${s.icon}</span> ${s.label}
    </button>
  `).join('');
}

function renderIntegrations() {
  const grid = document.getElementById('integrations-grid');
  if (!grid) return;

  grid.innerHTML = INTEGRATIONS.map((item) => `
    <article class="integration-card">
      <span class="integration-card__icon" aria-hidden="true">${item.icon}</span>
      <div>
        <div class="integration-card__name">${item.name}</div>
        <div class="integration-card__desc">${item.desc}</div>
      </div>
      <span class="integration-card__status integration-card__status--${item.connected ? 'connected' : 'disconnected'}">
        ${item.connected ? 'Connected' : 'Connect'}
      </span>
    </article>
  `).join('');
}

function bindSettingsTabs() {
  const links = document.querySelectorAll('.settings-nav__link');
  const panels = document.querySelectorAll('.settings-panel');

  const activate = (id) => {
    links.forEach((l) => {
      const active = l.dataset.panel === id;
      l.classList.toggle('is-active', active);
      l.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panels.forEach((p) => p.classList.toggle('is-active', p.id === `panel-${id}`));
    history.replaceState(null, '', `#${id}`);
  };

  links.forEach((link) => {
    link.addEventListener('click', () => activate(link.dataset.panel));
  });

  const hash = window.location.hash.slice(1);
  const panelId = hash === 'help' ? 'help' : (SETTINGS_SECTIONS.some((s) => s.id === hash) ? hash : 'profile');
  activate(panelId);
}

function bindAppearanceControls() {
  document.getElementById('settings-theme-toggle')?.addEventListener('click', () => {
    VexoraTheme.toggle();
    document.dispatchEvent(new CustomEvent('vexora:toggle-theme'));
  });
}

function bindSaveButtons() {
  document.querySelectorAll('[data-save-settings]').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.textContent = 'Saved ✓';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Save Changes';
        btn.disabled = false;
      }, 2000);
    });
  });
}

function initSettings() {
  renderSettingsNav();
  renderIntegrations();
  bindSettingsTabs();
  bindAppearanceControls();
  bindSaveButtons();
}

initApp({
  activePage: 'settings',
  pageTitle: 'Settings',
  onReady: initSettings,
});
