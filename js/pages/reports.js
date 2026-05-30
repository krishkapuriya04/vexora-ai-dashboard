/**
 * VEXORA Reports Page — library CRUD + export.
 */

import { initApp } from '../dashboard-app.js';
import {
  fetchReports,
  fetchDashboardMetrics,
  downloadExport,
  createReport,
  updateReport,
  deleteReport,
} from '../api-client.js';
import { showToast, confirmDialog, openModal, closeModal, setButtonLoading } from '../ui-feedback.js';

let reportsData = [];

function renderReportsLibrary() {
  const grid = document.getElementById('reports-grid');
  if (!grid) return;

  const cards = reportsData.map((report, i) => `
    <article class="report-card glass-card glow-border magnetic-card reveal" data-report-id="${report.id}" data-type="${(report.type || report.category || 'executive').toLowerCase()}" style="transition-delay: ${i * 70}ms">
      <div class="report-card__thumbnail">
        <img src="${report.thumbnail || '../assets/images/report-thumb.svg'}" alt="" loading="lazy" width="400" height="225" onerror="this.src='../assets/images/report-thumb.svg'">
        <div class="report-card__overlay">
          ${report.status === 'ready'
            ? `<button class="btn btn--primary btn--sm report-card__action" type="button" data-export-format="pdf">⬇ Download</button>`
            : `<span class="report-card__generating"><span class="spinner"></span> Generating...</span>`
          }
        </div>
        <span class="report-card__type">${report.type || report.category}</span>
      </div>
      <div class="report-card__body">
        <h3 class="report-card__title">${report.title}</h3>
        <div class="report-card__meta">
          <span>${report.date}</span>
          <span>${report.pages} pages</span>
          <span>${report.size}</span>
        </div>
        <div class="report-card__actions">
          <button class="btn btn--ghost btn--sm" type="button" data-preview-report="${report.id}">Preview</button>
          <button class="btn btn--ghost btn--sm" type="button" data-edit-report="${report.id}">Edit</button>
          <button class="btn btn--ghost btn--sm" type="button" data-delete-report="${report.id}">Delete</button>
          <button class="btn btn--secondary btn--sm" type="button" data-export-format="pdf">Export PDF</button>
        </div>
      </div>
    </article>
  `).join('');

  let emptyEl = document.getElementById('reports-empty');
  grid.querySelectorAll('.report-card').forEach((el) => el.remove());

  if (!emptyEl) {
    emptyEl = document.createElement('div');
    emptyEl.id = 'reports-empty';
    emptyEl.className = 'reports-empty';
    emptyEl.innerHTML = `
      <div class="empty-state" role="status">
        <div class="empty-state__illustration" aria-hidden="true">📋</div>
        <h3 class="empty-state__title">No reports yet</h3>
        <p class="empty-state__desc">Create your first report using the button above.</p>
        <button class="btn btn--primary btn--sm" type="button" id="reports-empty-create">Create Report</button>
      </div>
    `;
    grid.appendChild(emptyEl);
    emptyEl.querySelector('#reports-empty-create')?.addEventListener('click', openCreateModal);
  }

  if (reportsData.length === 0) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  if (emptyEl) emptyEl.hidden = true;
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

async function handleExport(format, triggerButton) {
  setButtonLoading(triggerButton, true, 'Exporting…');

  try {
    const filename = await downloadExport(format);
    showToast(`${format.toUpperCase()} export ready — ${filename}`);
    closeModal('export-modal');
  } catch (error) {
    showToast(error.message || 'Export failed. Please try again.', true);
  } finally {
    setButtonLoading(triggerButton, false);
  }
}

function openCreateModal() {
  document.getElementById('report-form-id').value = '';
  document.getElementById('report-title').value = '';
  document.getElementById('report-category').value = 'Executive';
  document.getElementById('report-description').value = '';
  document.getElementById('report-form-title').textContent = 'Create Report';
  document.getElementById('report-form-submit').textContent = 'Create Report';
  openModal('report-form-modal');
}

function openEditModal(reportId) {
  const report = reportsData.find((r) => r.id === reportId);
  if (!report) return;
  document.getElementById('report-form-id').value = report.id;
  document.getElementById('report-title').value = report.title;
  document.getElementById('report-category').value = report.category || report.type || 'Executive';
  document.getElementById('report-description').value = report.description || '';
  document.getElementById('report-form-title').textContent = 'Edit Report';
  document.getElementById('report-form-submit').textContent = 'Save Changes';
  openModal('report-form-modal');
}

function openPreviewModal(reportId) {
  const report = reportsData.find((r) => r.id === reportId);
  if (!report) return;
  document.getElementById('report-preview-title').textContent = report.title;
  document.getElementById('report-preview-body').textContent =
    report.description || `${report.type || report.category} report — ${report.pages} pages, ${report.size}, status: ${report.status}.`;
  openModal('report-preview-modal');
}

async function handleReportFormSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('report-form-submit');
  setButtonLoading(submitBtn, true, 'Saving…');

  const id = document.getElementById('report-form-id').value;
  const payload = {
    title: document.getElementById('report-title').value.trim(),
    category: document.getElementById('report-category').value,
    description: document.getElementById('report-description').value.trim(),
  };

  try {
    if (!payload.title) {
      showToast('Report title is required', true);
      return;
    }
    if (id) {
      await updateReport(id, payload);
      showToast('Report updated successfully');
    } else {
      await createReport(payload);
      showToast('Report created successfully');
    }
    closeModal('report-form-modal');
    reportsData = await fetchReports();
    renderReportsLibrary();
  } catch (err) {
    showToast(err.message || 'Failed to save report', true);
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

async function handleDeleteReport(reportId) {
  const report = reportsData.find((r) => r.id === reportId);
  const ok = await confirmDialog(`Delete "${report?.title || 'this report'}" permanently?`);
  if (!ok) return;

  try {
    await deleteReport(reportId);
    showToast('Report deleted');
    reportsData = await fetchReports();
    renderReportsLibrary();
  } catch (err) {
    showToast(err.message || 'Failed to delete report', true);
  }
}

function bindReportGridActions() {
  const grid = document.getElementById('reports-grid');
  if (!grid || grid.dataset.actionsBound) return;
  grid.dataset.actionsBound = 'true';

  grid.addEventListener('click', async (event) => {
    const previewId = event.target.closest('[data-preview-report]')?.dataset.previewReport;
    const editId = event.target.closest('[data-edit-report]')?.dataset.editReport;
    const deleteId = event.target.closest('[data-delete-report]')?.dataset.deleteReport;
    const exportBtn = event.target.closest('[data-export-format]');

    if (previewId) {
      event.stopPropagation();
      openPreviewModal(previewId);
      return;
    }
    if (editId) {
      event.stopPropagation();
      openEditModal(editId);
      return;
    }
    if (deleteId) {
      event.stopPropagation();
      await handleDeleteReport(deleteId);
      return;
    }
    if (exportBtn) {
      event.stopPropagation();
      handleExport(exportBtn.dataset.exportFormat || 'pdf', exportBtn);
    }
  });
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
    openModal('export-modal');
  });

  document.querySelectorAll('[data-close-export]').forEach((el) => {
    el.addEventListener('click', () => closeModal('export-modal'));
  });

  modalStart?.addEventListener('click', () => {
    const selected = document.querySelector('input[name="format"]:checked')?.value || 'pdf';
    const formatMap = { pdf: 'pdf', csv: 'csv', xlsx: 'excel' };
    handleExport(formatMap[selected] || 'pdf', modalStart);
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

  const applyFilter = (type) => {
    let visible = 0;
    grid?.querySelectorAll('.report-card').forEach((card) => {
      const match = type === 'all' || card.dataset.type === type;
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    if (emptyEl) emptyEl.hidden = visible > 0 || reportsData.length === 0;
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

  emptyEl?.querySelector('#reports-reset-filter')?.addEventListener('click', () => {
    document.querySelector('.filter-chip')?.click();
  });
}

function bindModals() {
  document.getElementById('create-report-btn')?.addEventListener('click', openCreateModal);
  document.getElementById('report-form')?.addEventListener('submit', handleReportFormSubmit);
  document.querySelectorAll('[data-close-report-modal]').forEach((el) => {
    el.addEventListener('click', () => closeModal('report-form-modal'));
  });
  document.querySelectorAll('[data-close-report-preview]').forEach((el) => {
    el.addEventListener('click', () => closeModal('report-preview-modal'));
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
  bindModals();
  bindReportGridActions();
}

initApp({
  activePage: 'reports',
  pageTitle: 'Reports',
  onReady: initReports,
});
