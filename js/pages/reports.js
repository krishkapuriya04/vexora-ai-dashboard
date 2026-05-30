/**
 * VEXORA Reports Page
 * Reports library loaded from API with professional export system.
 */

import { initApp } from '../dashboard-app.js';
import { fetchReports, fetchDashboardMetrics, downloadExport } from '../api-client.js';

let reportsData = [];

function renderReportsLibrary() {
  const grid = document.getElementById('reports-grid');
  if (!grid) return;

  const cards = reportsData.map((report, i) => `
    <article class="report-card glass-card glow-border magnetic-card reveal" data-type="${report.type.toLowerCase()}" style="transition-delay: ${i * 70}ms">
      <div class="report-card__thumbnail">
        <img src="${report.thumbnail}" alt="" loading="lazy" width="400" height="225">
        <div class="report-card__overlay">
          ${report.status === 'ready'
            ? `<button class="btn btn--primary btn--sm report-card__action" type="button" data-export-format="pdf">⬇ Download</button>`
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
          <button class="btn btn--secondary btn--sm" type="button" data-export-format="pdf">Export PDF</button>
        </div>
      </div>
    </article>
  `).join('');

  const emptyEl = document.getElementById('reports-empty');
  grid.querySelectorAll('.report-card').forEach((el) => el.remove());
  if (emptyEl) emptyEl.hidden = reportsData.length > 0;

  if (reportsData.length === 0) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  grid.insertAdjacentHTML('afterbegin', cards);
}

function renderExecutiveSummaries(kpis) {
  const container = document.getElementById('exec-summaries');
  if (!container) return;

  const revenue = kpis.find((k) => k.id === 'revenue');
  const users = kpis.find((k) => k.id === 'users');
  const growth = kpis.find((k) => k.id === 'growth');

  const summaries = [
    { title: 'Revenue Performance', metric: revenue ? `$${(revenue.value / 1000000).toFixed(2)}M` : '—', change: revenue?.change || '+0%', trend: revenue?.trend || 'up', icon: '💰' },
    { title: 'Customer Growth', metric: users ? `+${Math.round(users.value * 0.09).toLocaleString()}` : '—', change: users?.change || '+0%', trend: users?.trend || 'up', icon: '👥' },
    { title: 'Net Retention', metric: growth ? `${Math.round(growth.value * 5)}%` : '—', change: growth?.change || '+0%', trend: growth?.trend || 'up', icon: '🔄' },
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

function showToast(message, isError = false) {
  const existing = document.querySelector('.toast');
  existing?.remove();

  const toast = document.createElement('div');
  toast.className = `toast${isError ? ' toast--error' : ''}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('is-visible'));
  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function setButtonLoading(button, loading, loadingText = 'Exporting…') {
  if (!button) return;

  if (loading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
    button.classList.add('is-loading');
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
    button.classList.remove('is-loading');
  }
}

async function handleExport(format, triggerButton) {
  setButtonLoading(triggerButton, true);

  try {
    const filename = await downloadExport(format);
    showToast(`${format.toUpperCase()} export ready — ${filename}`);
    document.getElementById('export-modal')?.setAttribute('hidden', '');
    document.body.classList.remove('modal-open');
  } catch (error) {
    showToast(error.message || 'Export failed. Please try again.', true);
  } finally {
    setButtonLoading(triggerButton, false);
  }
}

function bindExportUI() {
  const pdfBtn = document.getElementById('export-pdf-btn');
  const excelBtn = document.getElementById('export-excel-btn');
  const csvBtn = document.getElementById('export-csv-btn');
  const modalStart = document.getElementById('export-modal-start');

  pdfBtn?.addEventListener('click', () => handleExport('pdf', pdfBtn));
  excelBtn?.addEventListener('click', () => handleExport('excel', excelBtn));
  csvBtn?.addEventListener('click', () => handleExport('csv', csvBtn));

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

  modalStart?.addEventListener('click', () => {
    const selected = document.querySelector('input[name="format"]:checked')?.value || 'pdf';
    const formatMap = { pdf: 'pdf', csv: 'csv', xlsx: 'excel' };
    handleExport(formatMap[selected] || 'pdf', modalStart);
  });

  document.getElementById('reports-grid')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-export-format]');
    if (!btn) return;
    event.stopPropagation();
    handleExport(btn.dataset.exportFormat || 'pdf', btn);
  });

  document.querySelectorAll('.export-option input').forEach((input) => {
    input.addEventListener('change', () => {
      document.querySelectorAll('.export-option').forEach((opt) => opt.classList.remove('is-selected'));
      input.closest('.export-option')?.classList.add('is-selected');
    });
  });
}

function bindFilterChips() {
  const grid = document.getElementById('reports-grid');
  let emptyEl = document.getElementById('reports-empty');

  if (!emptyEl && grid) {
    emptyEl = document.createElement('div');
    emptyEl.id = 'reports-empty';
    emptyEl.className = 'reports-empty';
    emptyEl.hidden = true;
    emptyEl.innerHTML = `
      <div class="empty-state" role="status">
        <div class="empty-state__illustration" aria-hidden="true">📋</div>
        <h3 class="empty-state__title">No reports in this category</h3>
        <p class="empty-state__desc">Try selecting a different filter or generate a new report from the dashboard.</p>
        <button class="btn btn--primary btn--sm" type="button" id="reports-reset-filter">View All Reports</button>
      </div>
    `;
    grid.appendChild(emptyEl);
    emptyEl.querySelector('#reports-reset-filter')?.addEventListener('click', () => {
      document.querySelector('.filter-chip')?.click();
    });
  }

  const applyFilter = (type) => {
    let visible = 0;
    grid?.querySelectorAll('.report-card').forEach((card) => {
      const match = type === 'all' || card.dataset.type === type;
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    if (emptyEl) emptyEl.hidden = visible > 0;
  };

  document.querySelectorAll('.filter-chip').forEach((chip, idx) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach((c) => {
        c.classList.remove('is-active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-selected', 'true');
      const types = ['all', 'executive', 'financial', 'ai', 'marketing'];
      applyFilter(types[idx] || 'all');
    });
  });
}

async function initReports() {
  const [reports, metrics] = await Promise.all([
    fetchReports(),
    fetchDashboardMetrics(),
  ]);

  reportsData = reports;
  renderReportsLibrary();
  renderExecutiveSummaries(metrics.kpis || []);
  bindExportUI();
  bindFilterChips();
}

initApp({
  activePage: 'reports',
  pageTitle: 'Reports',
  onReady: initReports,
});
