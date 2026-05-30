/**
 * VEXORA App Shell
 * Injects sidebar, topbar, and global modals into dashboard pages.
 */

import { NOTIFICATIONS, SEARCH_ITEMS } from './mock-data.js';

/** Navigation routes for sidebar */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: '◫' },
  { id: 'analytics', label: 'Analytics', href: 'analytics.html', icon: '◔' },
  { id: 'insights', label: 'AI Insights', href: 'insights.html', icon: '✦' },
  { id: 'reports', label: 'Reports', href: 'reports.html', icon: '▤' },
];

const NAV_SECONDARY = [
  { id: 'settings', label: 'Settings', href: '#', icon: '⚙' },
  { id: 'help', label: 'Help Center', href: '#', icon: '?' },
];

/**
 * Render sidebar navigation HTML
 * @param {string} activePage - Current page identifier
 * @returns {string}
 */
function renderSidebar(activePage) {
  const mainNav = NAV_ITEMS.map((item) => `
    <a href="${item.href}"
       class="sidebar__link${item.id === activePage ? ' is-active' : ''}"
       data-nav="${item.id}"
       ${item.id === activePage ? 'aria-current="page"' : ''}>
      <span class="sidebar__icon" aria-hidden="true">${item.icon}</span>
      <span class="sidebar__label">${item.label}</span>
    </a>
  `).join('');

  const secondaryNav = NAV_SECONDARY.map((item) => `
    <a href="${item.href}" class="sidebar__link sidebar__link--secondary">
      <span class="sidebar__icon" aria-hidden="true">${item.icon}</span>
      <span class="sidebar__label">${item.label}</span>
    </a>
  `).join('');

  return `
    <aside class="sidebar" id="sidebar" aria-label="Main navigation">
      <div class="sidebar__header">
        <a href="../index.html" class="sidebar__logo" aria-label="VEXORA Home">
          <span class="sidebar__logo-icon" aria-hidden="true">V</span>
          <span class="sidebar__logo-text">VEXORA</span>
        </a>
        <button class="sidebar__collapse-btn" id="sidebar-collapse" type="button" aria-label="Collapse sidebar">
          <span aria-hidden="true">‹</span>
        </button>
      </div>

      <nav class="sidebar__nav">${mainNav}</nav>

      <div class="sidebar__divider" role="separator"></div>

      <nav class="sidebar__nav sidebar__nav--secondary">${secondaryNav}</nav>

      <div class="sidebar__footer">
        <div class="sidebar__upgrade glass-card">
          <p class="sidebar__upgrade-title">Upgrade to Pro</p>
          <p class="sidebar__upgrade-text">Unlock advanced AI insights</p>
          <button class="btn btn--primary btn--sm" type="button">Upgrade</button>
        </div>
      </div>
    </aside>
  `;
}

/**
 * Render top navigation bar HTML
 * @param {string} pageTitle - Current page title
 * @returns {string}
 */
function renderTopbar(pageTitle) {
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return `
    <header class="topbar" id="topbar">
      <div class="topbar__left">
        <button class="topbar__menu-btn" id="mobile-sidebar-toggle" type="button" aria-label="Open navigation">
          <span></span><span></span><span></span>
        </button>
        <div class="topbar__breadcrumb">
          <a href="dashboard.html" class="topbar__breadcrumb-link">Home</a>
          <span class="topbar__breadcrumb-sep" aria-hidden="true">/</span>
          <span class="topbar__breadcrumb-current">${pageTitle}</span>
        </div>
      </div>

      <div class="topbar__center">
        <button class="topbar__search" id="search-trigger" type="button" aria-label="Open command search">
          <span class="topbar__search-icon" aria-hidden="true">⌕</span>
          <span class="topbar__search-placeholder">Search anything...</span>
          <kbd class="topbar__kbd">⌘K</kbd>
        </button>
      </div>

      <div class="topbar__right">
        <button class="topbar__action" id="theme-toggle" type="button" aria-label="Toggle theme">
          <span class="topbar__theme-icon topbar__theme-icon--dark" aria-hidden="true">☀</span>
          <span class="topbar__theme-icon topbar__theme-icon--light" aria-hidden="true">☾</span>
        </button>

        <div class="topbar__dropdown-wrap">
          <button class="topbar__action topbar__action--notify" id="notify-trigger" type="button" aria-label="Notifications">
            <span aria-hidden="true">🔔</span>
            ${unreadCount > 0 ? `<span class="topbar__badge">${unreadCount}</span>` : ''}
          </button>
          ${renderNotificationPanel()}
        </div>

        <div class="topbar__dropdown-wrap">
          <button class="topbar__profile" id="profile-trigger" type="button" aria-label="User menu" aria-expanded="false">
            <span class="topbar__avatar" aria-hidden="true">KK</span>
            <span class="topbar__profile-info">
              <span class="topbar__profile-name">Krish Kapuriya</span>
              <span class="topbar__profile-role">Admin</span>
            </span>
            <span class="topbar__profile-chevron" aria-hidden="true">▾</span>
          </button>
          ${renderProfileMenu()}
        </div>
      </div>
    </header>
  `;
}

/**
 * Render command search modal
 * @returns {string}
 */
function renderSearchModal() {
  const items = SEARCH_ITEMS.map((item) => `
    <a href="${item.href}" class="command-item" data-search="${item.label.toLowerCase()}">
      <span class="command-item__icon" aria-hidden="true">${item.icon}</span>
      <div class="command-item__content">
        <span class="command-item__label">${item.label}</span>
        <span class="command-item__category">${item.category}</span>
      </div>
      <span class="command-item__arrow" aria-hidden="true">→</span>
    </a>
  `).join('');

  return `
    <div class="modal command-modal" id="search-modal" role="dialog" aria-modal="true" aria-label="Command search" hidden>
      <div class="modal__backdrop" data-close-modal></div>
      <div class="modal__panel command-modal__panel">
        <div class="command-modal__search">
          <span class="command-modal__search-icon" aria-hidden="true">⌕</span>
          <input type="search" class="command-modal__input" id="command-input"
                 placeholder="Search pages, reports, actions..." autocomplete="off" aria-label="Search">
          <kbd class="command-modal__kbd">ESC</kbd>
        </div>
        <div class="command-modal__results" id="command-results">${items}</div>
      </div>
    </div>
  `;
}

/**
 * Render notification center panel
 * @returns {string}
 */
function renderNotificationPanel() {
  const items = NOTIFICATIONS.map((n) => `
    <article class="notify-item${n.unread ? ' notify-item--unread' : ''}" data-type="${n.type}">
      <div class="notify-item__dot" aria-hidden="true"></div>
      <div class="notify-item__content">
        <h4 class="notify-item__title">${n.title}</h4>
        <p class="notify-item__text">${n.text}</p>
        <time class="notify-item__time">${n.time}</time>
      </div>
    </article>
  `).join('');

  return `
    <div class="dropdown-panel notify-panel" id="notify-panel" hidden>
      <div class="dropdown-panel__header">
        <h3>Notifications</h3>
        <button class="btn btn--ghost btn--sm" type="button">Mark all read</button>
      </div>
      <div class="dropdown-panel__body">${items}</div>
      <div class="dropdown-panel__footer">
        <a href="#" class="dropdown-panel__link">View all notifications</a>
      </div>
    </div>
  `;
}

/**
 * Render profile dropdown menu
 * @returns {string}
 */
function renderProfileMenu() {
  return `
    <div class="dropdown-panel profile-panel" id="profile-panel" hidden>
      <div class="profile-panel__header">
        <span class="profile-panel__avatar" aria-hidden="true">KK</span>
        <div>
          <div class="profile-panel__name">Krish Kapuriya</div>
          <div class="profile-panel__email">krish@vexora.ai</div>
        </div>
      </div>
      <nav class="profile-panel__nav" aria-label="Profile menu">
        <a href="#" class="profile-panel__link">👤 My Profile</a>
        <a href="#" class="profile-panel__link">⚙ Account Settings</a>
        <a href="#" class="profile-panel__link">👥 Team Members</a>
        <a href="#" class="profile-panel__link">💳 Billing</a>
      </nav>
      <div class="profile-panel__divider"></div>
      <a href="../index.html" class="profile-panel__link profile-panel__link--logout">↩ Back to Website</a>
    </div>
  `;
}

/**
 * Render video player modal
 * @returns {string}
 */
function renderVideoModal() {
  return `
    <div class="modal video-modal" id="video-modal" role="dialog" aria-modal="true" aria-label="Product demo video" hidden>
      <div class="modal__backdrop" data-close-modal></div>
      <div class="modal__panel video-modal__panel">
        <button class="video-modal__close" type="button" data-close-modal aria-label="Close video">✕</button>
        <div class="video-modal__embed" id="video-embed-container"></div>
      </div>
    </div>
  `;
}

/**
 * Render mobile sidebar overlay
 * @returns {string}
 */
function renderSidebarOverlay() {
  return `<div class="sidebar-overlay" id="sidebar-overlay" hidden aria-hidden="true"></div>`;
}

/**
 * Inject the complete app shell into the page
 * @param {Object} config
 * @param {string} config.activePage - Page id for nav highlighting
 * @param {string} config.pageTitle - Display title for breadcrumb
 */
export function initShell({ activePage, pageTitle }) {
  const sidebarSlot = document.getElementById('sidebar-slot');
  const topbarSlot = document.getElementById('topbar-slot');
  const modalsSlot = document.getElementById('modals-slot');

  if (sidebarSlot) sidebarSlot.innerHTML = renderSidebar(activePage);
  if (topbarSlot) topbarSlot.innerHTML = renderTopbar(pageTitle);

  if (modalsSlot) {
    modalsSlot.innerHTML =
      renderSearchModal() +
      renderVideoModal() +
      renderSidebarOverlay();
  }

  document.body.dataset.page = activePage;
}

/**
 * Bind shell interaction handlers
 */
export function bindShellEvents() {
  const sidebar = document.getElementById('sidebar');
  const sidebarCollapse = document.getElementById('sidebar-collapse');
  const mobileToggle = document.getElementById('mobile-sidebar-toggle');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const searchTrigger = document.getElementById('search-trigger');
  const searchModal = document.getElementById('search-modal');
  const commandInput = document.getElementById('command-input');
  const notifyTrigger = document.getElementById('notify-trigger');
  const notifyPanel = document.getElementById('notify-panel');
  const profileTrigger = document.getElementById('profile-trigger');
  const profilePanel = document.getElementById('profile-panel');
  const themeToggle = document.getElementById('theme-toggle');

  /* Sidebar collapse */
  sidebarCollapse?.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-collapsed');
    localStorage.setItem('vexora-sidebar-collapsed', document.body.classList.contains('sidebar-collapsed'));
  });

  if (localStorage.getItem('vexora-sidebar-collapsed') === 'true') {
    document.body.classList.add('sidebar-collapsed');
  }

  /* Mobile sidebar */
  const openMobileSidebar = () => {
    sidebar?.classList.add('is-mobile-open');
    sidebarOverlay?.removeAttribute('hidden');
  };

  const closeMobileSidebar = () => {
    sidebar?.classList.remove('is-mobile-open');
    sidebarOverlay?.setAttribute('hidden', '');
  };

  mobileToggle?.addEventListener('click', openMobileSidebar);
  sidebarOverlay?.addEventListener('click', closeMobileSidebar);

  /* Command search modal */
  const openSearch = () => {
    searchModal?.removeAttribute('hidden');
    commandInput?.focus();
    document.body.classList.add('modal-open');
  };

  const closeSearch = () => {
    searchModal?.setAttribute('hidden', '');
    document.body.classList.remove('modal-open');
    if (commandInput) commandInput.value = '';
    filterCommandResults('');
  };

  searchTrigger?.addEventListener('click', openSearch);

  searchModal?.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeSearch);
  });

  commandInput?.addEventListener('input', (e) => {
    filterCommandResults(e.target.value.toLowerCase());
  });

  /* Notification panel toggle */
  notifyTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeProfile();
    const isHidden = notifyPanel?.hasAttribute('hidden');
    if (isHidden) {
      notifyPanel?.removeAttribute('hidden');
      profilePanel?.setAttribute('hidden', '');
    } else {
      notifyPanel?.setAttribute('hidden', '');
    }
  });

  /* Profile panel toggle */
  const closeProfile = () => {
    profilePanel?.setAttribute('hidden', '');
    profileTrigger?.setAttribute('aria-expanded', 'false');
  };

  profileTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    notifyPanel?.setAttribute('hidden', '');
    const isHidden = profilePanel?.hasAttribute('hidden');
    if (isHidden) {
      profilePanel?.removeAttribute('hidden');
      profileTrigger?.setAttribute('aria-expanded', 'true');
    } else {
      closeProfile();
    }
  });

  /* Theme toggle — dispatched to dashboard-app */
  themeToggle?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('vexora:toggle-theme'));
  });

  /* Global keyboard shortcuts */
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (searchModal?.hasAttribute('hidden')) openSearch();
      else closeSearch();
    }
    if (e.key === 'Escape') {
      closeSearch();
      closeVideoModal();
      closeMobileSidebar();
      notifyPanel?.setAttribute('hidden', '');
      closeProfile();
    }
  });

  /* Close dropdowns on outside click */
  document.addEventListener('click', () => {
    notifyPanel?.setAttribute('hidden', '');
    closeProfile();
  });

  notifyPanel?.addEventListener('click', (e) => e.stopPropagation());
  profilePanel?.addEventListener('click', (e) => e.stopPropagation());

  /* Modal close handlers */
  document.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', () => {
      el.closest('.modal')?.setAttribute('hidden', '');
      document.body.classList.remove('modal-open');
      closeVideoModal();
    });
  });
}

/**
 * Filter command palette search results
 * @param {string} query
 */
function filterCommandResults(query) {
  document.querySelectorAll('.command-item').forEach((item) => {
    const text = item.dataset.search || '';
    item.style.display = !query || text.includes(query) ? '' : 'none';
  });
}

/**
 * Open video modal with configured embed URL
 * @param {string} videoUrl
 */
export function openVideoModal(videoUrl) {
  const modal = document.getElementById('video-modal');
  const container = document.getElementById('video-embed-container');

  if (!modal || !container) return;

  container.innerHTML = `<iframe src="${videoUrl}" title="VEXORA product demo" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  modal.removeAttribute('hidden');
  document.body.classList.add('modal-open');
}

/**
 * Close video modal and stop playback
 */
export function closeVideoModal() {
  const modal = document.getElementById('video-modal');
  const container = document.getElementById('video-embed-container');

  modal?.setAttribute('hidden', '');
  if (container) container.innerHTML = '';
  document.body.classList.remove('modal-open');
}

/**
 * Bind video preview card play button
 * @param {string} selector - CSS selector for play trigger
 * @param {string} videoUrl
 */
export function bindVideoPreview(selector, videoUrl) {
  document.querySelector(selector)?.addEventListener('click', () => {
    openVideoModal(videoUrl);
  });
}

/**
 * Initialize button ripple micro-interaction
 */
export function initRippleEffect() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .topbar__action, .sidebar__link');
    if (!btn) return;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

/**
 * Show skeleton loaders then reveal content
 * @param {number} [delay=600]
 */
export function initSkeletonLoader(delay = 600) {
  const skeleton = document.querySelector('.page-skeleton');
  const content = document.querySelector('.page-content');

  if (!skeleton || !content) return;

  setTimeout(() => {
    skeleton.classList.add('is-hidden');
    content.classList.add('is-loaded');
  }, delay);
}

/**
 * Trigger page enter animation
 */
export function initPageTransition() {
  const content = document.querySelector('.app-content');
  requestAnimationFrame(() => {
    content?.classList.add('page-enter-active');
  });
}
