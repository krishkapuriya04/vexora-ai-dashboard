/**
 * VEXORA Reports Page
 * Reports library, executive summaries, export UI.
 */

import { initApp } from '../dashboard-app.js';
import { REPORTS } from '../mock-data.js';

function renderReportsLibrary() {
  const grid = document.getElementById('reports-grid');
  if (!grid) return;

  grid.innerHTML = REPORTS.map((report, i) => `
    <article class="report-card glass-card glow-border reveal" style="transition-delay: ${i * 70}ms">
      <div class="report-card__thumbnail">
        <img src="${report.thumbnail}" alt="" loading="lazy" width="400" height="225">
        <div class="report-card__overlay">
          ${report.status === 'ready'
            ? `<button class="btn btn--primary btn--sm report-card__action" type="button" data-action="download">⬇ Download</button>`
            : `<span class="report-card__generating"><span class="spinner"></span> Generating...</span>`
          }
        </div>
        <span class="report-card__type">${report.type}</span>
      </div>
      <div class="report-card__body">
        <h3 class="report-card__title">${report.title}</h3>
        <div class="report-card__meta">
          <span>${report.date}</span>
          <span>${report.pages} pages</span>
          <span>${report.size}</span>
        </div>
        <div class="report-card__actions">
          <button class="btn btn--ghost btn--sm" type="button">Preview</button>
          <button class="btn btn--secondary btn--sm" type="button" data-action="export">Export PDF</button>
        </div>
      </div>
    </article>
  `).join('');
}

function renderExecutiveSummaries() {
  const container = document.getElementById('exec-summaries');
  if (!container) return;

  const summaries = [
    { title: 'Revenue Performance', metric: '$2.85M', change: '+12.4%', trend: 'up', icon: '💰' },
    { title: 'Customer Growth', metric: '+1,680', change: '+18.2%', trend: 'up', icon: '👥' },
    { title: 'Net Retention', metric: '118%', change: '+3pts', trend: 'up', icon: '🔄' },
    { title: 'Operating Margin', metric: '34.2%', change: '-1.1%', trend: 'down', icon: '📊' },
  ];

  container.innerHTML = summaries.map((s) => `
    <article class="exec-card glass-card reveal">
      <div class="exec-card__icon" aria-hidden="true">${s.icon}</div>
      <div class="exec-card__content">
        <span class="exec-card__label">${s.title}</span>
        <span class="exec-card__metric">${s.metric}</span>
        <span class="exec-card__change exec-card__change--${s.trend}">${s.change}</span>
      </div>
    </article>
  `).join('');
}

function bindExportUI() {
  document.getElementById('export-trigger')?.addEventListener('click', () => {
    document.getElementById('export-modal')?.removeAttribute('hidden');
    document.body.classList.add('modal-open');
  });

  document.querySelectorAll('[data-close-export]').forEach((el) => {
    el.addEventListener('click', () => {
      document.getElementById('export-modal')?.setAttribute('hidden', '');
      document.body.classList.remove('modal-open');
    });
  });

  document.querySelectorAll('[data-action="export"], [data-action="download"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('Report export started. Download will begin shortly.');
    });
  });
}

function showToast(message) {
  const existing = document.querySelector('.toast');
  existing?.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('is-visible'));
  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function bindFilterChips() {
  document.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach((c) => {
        c.classList.remove('is-active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-selected', 'true');
    });
  });
}

function initReports() {
  renderReportsLibrary();
  renderExecutiveSummaries();
  bindExportUI();
  bindFilterChips();
}

initApp({
  activePage: 'reports',
  pageTitle: 'Reports',
  onReady: initReports,
});
