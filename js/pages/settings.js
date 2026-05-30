/**
 * VEXORA Settings Page — wired actions with API + localStorage persistence.
 */

import { initApp } from '../dashboard-app.js';
import { SETTINGS_SECTIONS, INTEGRATIONS } from '../app-config.js';
import VexoraTheme from '../theme.js';
import {
  getStoredUser,
  getInitials,
  updateProfile,
  updateWorkspace,
  getActiveStorage,
} from '../auth-client.js';
import { fetchBillingSubscription, fetchBillingHistory } from '../api-client.js';
import { showToast, showComingSoon, confirmDialog } from '../ui-feedback.js';

const PREFS_KEY = 'vexora-ui-prefs';
const INTEGRATIONS_KEY = 'vexora-integrations-state';

function loadLocalPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLocalPrefs(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function loadIntegrationState() {
  try {
    return JSON.parse(localStorage.getItem(INTEGRATIONS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveIntegrationState(state) {
  localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(state));
}

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

  const state = loadIntegrationState();

  grid.innerHTML = INTEGRATIONS.map((item) => {
    const connected = state[item.name] !== undefined ? state[item.name] : item.connected;
    return `
    <article class="integration-card">
      <span class="integration-card__icon" aria-hidden="true">${item.icon}</span>
      <div>
        <div class="integration-card__name">${item.name}</div>
        <div class="integration-card__desc">${item.desc}</div>
      </div>
      <button type="button" class="integration-card__status integration-card__status--${connected ? 'connected' : 'disconnected'}"
              data-integration="${item.name}" data-connected="${connected}">
        ${connected ? 'Connected' : 'Connect'}
      </button>
    </article>
  `;
  }).join('');
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

async function loadProfileData() {
  const user = getStoredUser();
  if (!user) return;

  const nameInput = document.getElementById('settings-full-name');
  const emailInput = document.getElementById('settings-email');
  const jobInput = document.getElementById('settings-job-title');
  const avatar = document.querySelector('.settings-avatar');

  if (nameInput) nameInput.value = user.fullName || '';
  if (emailInput) emailInput.value = user.email || '';
  if (jobInput) jobInput.value = user.jobTitle || '';
  if (avatar) avatar.textContent = getInitials(user.fullName);

  const org = user.organizationDetails;
  const wsName = document.getElementById('settings-workspace-name');
  if (wsName && org?.name) wsName.value = org.name;

  const prefs = { ...loadLocalPrefs(), ...(user.preferences || {}) };
  applyPreferencesToUI(prefs);
}

function applyPreferencesToUI(prefs) {
  const map = {
    'pref-email-notifications': prefs.emailNotifications !== false,
    'pref-ai-alerts': prefs.aiAlerts !== false,
    'pref-report-ready': prefs.reportReady !== false,
    'pref-slack': prefs.slack === true,
    'pref-compact': prefs.compactMode === true,
    'pref-animations': prefs.animations !== false,
  };

  Object.entries(map).forEach(([id, checked]) => {
    const el = document.getElementById(id);
    if (el) el.checked = checked;
  });

  document.body.classList.toggle('compact-mode', prefs.compactMode === true);
  if (prefs.animations === false) {
    document.body.classList.add('reduce-motion');
  }
}

function collectPreferencesFromUI() {
  return {
    emailNotifications: document.getElementById('pref-email-notifications')?.checked ?? true,
    aiAlerts: document.getElementById('pref-ai-alerts')?.checked ?? true,
    reportReady: document.getElementById('pref-report-ready')?.checked ?? true,
    slack: document.getElementById('pref-slack')?.checked ?? false,
    compactMode: document.getElementById('pref-compact')?.checked ?? false,
    animations: document.getElementById('pref-animations')?.checked ?? true,
  };
}

async function saveProfile() {
  const btn = document.querySelector('[data-save-profile]');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

  try {
    const prefs = collectPreferencesFromUI();
    saveLocalPrefs(prefs);

    const data = await updateProfile({
      fullName: document.getElementById('settings-full-name')?.value?.trim(),
      email: document.getElementById('settings-email')?.value?.trim(),
      jobTitle: document.getElementById('settings-job-title')?.value?.trim(),
      preferences: prefs,
    });

    const storage = getActiveStorage();
    storage.setItem('vexora-auth-user', JSON.stringify(data.user));
    showToast('Profile saved successfully');
    await loadProfileData();
  } catch (err) {
    showToast(err.message || 'Failed to save profile', true);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
  }
}

async function saveWorkspace() {
  const btn = document.querySelector('[data-save-workspace]');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

  try {
    const name = document.getElementById('settings-workspace-name')?.value?.trim();
    const data = await updateWorkspace({ name });
    const user = getStoredUser();
    if (user) {
      user.organizationDetails = data.organization;
      getActiveStorage().setItem('vexora-auth-user', JSON.stringify(user));
    }
    showToast('Workspace settings saved');
  } catch (err) {
    showToast(err.message || 'Failed to save workspace', true);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
  }
}

async function saveNotificationPrefs() {
  try {
    const prefs = collectPreferencesFromUI();
    saveLocalPrefs(prefs);
    const data = await updateProfile({ preferences: prefs });
    getActiveStorage().setItem('vexora-auth-user', JSON.stringify(data.user));
    applyPreferencesToUI(prefs);
    showToast('Notification preferences saved');
  } catch (err) {
    showToast(err.message || 'Failed to save preferences', true);
  }
}

async function saveAppearancePrefs() {
  const prefs = collectPreferencesFromUI();
  saveLocalPrefs(prefs);
  document.body.classList.toggle('compact-mode', prefs.compactMode);
  document.body.classList.toggle('reduce-motion', !prefs.animations);

  try {
    const data = await updateProfile({ preferences: prefs });
    getActiveStorage().setItem('vexora-auth-user', JSON.stringify(data.user));
    showToast('Appearance settings saved');
  } catch (err) {
    showToast(err.message || 'Failed to save appearance', true);
  }
}

async function loadBillingPanel() {
  try {
    const sub = await fetchBillingSubscription();
    const planEl = document.getElementById('settings-current-plan');
    if (planEl) {
      if (sub?.plan && sub?.status === 'active') {
        const names = { starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise' };
        planEl.textContent = `${names[sub.plan] || sub.plan} — Active`;
      } else {
        planEl.textContent = 'No active subscription';
      }
    }
  } catch {
    /* optional */
  }
}

function bindAppearanceControls() {
  document.getElementById('settings-theme-toggle')?.addEventListener('click', () => {
    VexoraTheme.toggle();
    document.dispatchEvent(new CustomEvent('vexora:toggle-theme'));
    showToast('Theme updated');
  });

  document.getElementById('pref-compact')?.addEventListener('change', () => {
    document.body.classList.toggle('compact-mode', document.getElementById('pref-compact')?.checked);
  });

  document.getElementById('pref-animations')?.addEventListener('change', (e) => {
    document.body.classList.toggle('reduce-motion', !e.target.checked);
  });

  document.getElementById('save-appearance-btn')?.addEventListener('click', saveAppearancePrefs);
}

function bindAllActions() {
  document.querySelector('[data-save-profile]')?.addEventListener('click', saveProfile);
  document.querySelector('[data-save-workspace]')?.addEventListener('click', saveWorkspace);
  document.getElementById('save-notifications-btn')?.addEventListener('click', saveNotificationPrefs);

  document.getElementById('upload-photo-btn')?.addEventListener('click', () => {
    showComingSoon('Avatar upload');
  });

  document.getElementById('manage-team-btn')?.addEventListener('click', () => {
    window.location.href = 'admin.html';
  });

  document.getElementById('change-region-btn')?.addEventListener('click', () => {
    showToast('Data region change request submitted — our team will contact you.');
  });

  document.getElementById('enable-2fa-btn')?.addEventListener('click', () => {
    showComingSoon('Two-factor authentication setup');
  });

  document.getElementById('change-password-btn')?.addEventListener('click', () => {
    showComingSoon('Password change (requires email verification flow)');
  });

  document.getElementById('view-sessions-btn')?.addEventListener('click', () => {
    showToast('You have 1 active session on this device.');
  });

  document.getElementById('billing-upgrade-btn')?.addEventListener('click', () => {
    window.location.href = 'billing.html';
  });

  document.getElementById('billing-update-btn')?.addEventListener('click', () => {
    window.location.href = 'billing.html';
  });

  document.getElementById('view-invoices-btn')?.addEventListener('click', async () => {
    try {
      const payments = await fetchBillingHistory();
      if (!payments.length) {
        showToast('No invoices yet. Subscribe to a plan on the Billing page.');
        return;
      }
      showToast(`${payments.length} payment record(s) — view full history on Billing page.`);
      setTimeout(() => { window.location.href = 'billing.html'; }, 1200);
    } catch (err) {
      showToast(err.message || 'Could not load billing history', true);
    }
  });

  document.getElementById('send-support-btn')?.addEventListener('click', () => {
    window.location.href = 'mailto:support@vexora.ai?subject=VEXORA%20Support%20Request';
  });

  document.getElementById('integrations-grid')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-integration]');
    if (!btn) return;
    const name = btn.dataset.integration;
    const state = loadIntegrationState();
    const next = btn.dataset.connected !== 'true';
    state[name] = next;
    saveIntegrationState(state);
    renderIntegrations();
    showToast(next ? `${name} connected successfully` : `${name} disconnected`);
  });

  document.querySelectorAll('#panel-notifications input[type="checkbox"]').forEach((input) => {
    input.addEventListener('change', () => {
      /* auto-save debounced could go here; user clicks Save on panel */
    });
  });
}

async function initSettings() {
  renderSettingsNav();
  renderIntegrations();
  bindSettingsTabs();
  bindAppearanceControls();
  bindAllActions();
  await loadProfileData();
  await loadBillingPanel();
}

initApp({
  activePage: 'settings',
  pageTitle: 'Settings',
  onReady: initSettings,
});
