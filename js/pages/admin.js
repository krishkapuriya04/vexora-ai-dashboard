/**
 * VEXORA Admin Panel
 */

import { initApp, registerChart } from '../dashboard-app.js';
import {
  fetchAdminStats,
  fetchAdminUsers,
  fetchAdminUser,
  updateAdminUser,
  deleteAdminUser,
  fetchAdminOrganizations,
  fetchAdminOrganization,
  updateAdminOrganization,
  createAdminOrganization,
  fetchAdminAuditLogs,
} from '../api-client.js';
import { getStoredUser } from '../auth-client.js';
import { CHART_DEFAULTS, CHART_COLORS } from '../chart-utils.js';

const PAGE_SIZE = 8;
let allUsers = [];
let userPage = 1;
let currentUser = null;
let canWrite = true;

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatAction(action) {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function showToast(message, isError = false) {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = `toast${isError ? ' toast--error' : ''}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  setTimeout(() => { toast.classList.remove('is-visible'); setTimeout(() => toast.remove(), 300); }, 3000);
}

function openModal(id) {
  document.getElementById(id)?.removeAttribute('hidden');
  document.body.classList.add('modal-open');
}

function closeModal(id) {
  document.getElementById(id)?.setAttribute('hidden', '');
  document.body.classList.remove('modal-open');
}

function confirmAction(message) {
  return new Promise((resolve) => {
    document.getElementById('confirm-message').textContent = message;
    openModal('confirm-modal');
    const yes = document.getElementById('confirm-yes');
    const handler = () => {
      yes.removeEventListener('click', handler);
      closeModal('confirm-modal');
      resolve(true);
    };
    yes.addEventListener('click', handler);
    document.querySelectorAll('[data-close-confirm]').forEach((el) => {
      el.onclick = () => { yes.removeEventListener('click', handler); closeModal('confirm-modal'); resolve(false); };
    });
  });
}

function renderKpis(stats) {
  const grid = document.getElementById('admin-kpi-grid');
  if (!grid) return;

  const kpis = [
    { id: 'users', label: 'Total Users', value: stats.totalUsers, icon: '👥', change: 'Platform', trend: 'up' },
    { id: 'orgs', label: 'Organizations', value: stats.totalOrganizations, icon: '🏢', change: 'Active', trend: 'up' },
    { id: 'revenue', label: 'Dashboard Revenue', value: stats.totalRevenue, icon: '📊', change: 'Metrics', trend: 'up', format: 'currency' },
    { id: 'sessions', label: 'Active Sessions', value: stats.activeSessions, icon: '⚡', change: 'Live', trend: 'up' },
    { id: 'reports', label: 'Reports Generated', value: stats.reportsGenerated, icon: '📋', change: 'Total', trend: 'up' },
    { id: 'exports', label: 'Exports Generated', value: stats.exportsGenerated, icon: '⬇', change: 'Total', trend: 'up' },
  ];

  const billing = stats.billing || {};
  const billingKpis = [
    { id: 'bill-revenue', label: 'Total Revenue', value: billing.totalRevenue || 0, icon: '💰', change: 'Billing', trend: 'up', format: 'inr' },
    { id: 'bill-subs', label: 'Active Subscriptions', value: billing.activeSubscriptions || 0, icon: '✓', change: 'Live', trend: 'up' },
    { id: 'bill-monthly', label: 'Monthly Revenue', value: billing.monthlyRevenue || 0, icon: '📈', change: 'This month', trend: 'up', format: 'inr' },
    { id: 'bill-failed', label: 'Failed Payments', value: billing.failedPayments || 0, icon: '⚠', change: 'Total', trend: billing.failedPayments > 0 ? 'down' : 'up' },
  ];

  const ai = stats.ai || {};
  const aiKpis = [
    { id: 'ai-total', label: 'Total AI Requests', value: ai.totalAIRequests || 0, icon: '✦', change: 'All time', trend: 'up' },
    { id: 'ai-forecast', label: 'Forecasts Generated', value: ai.forecastsGenerated || 0, icon: '📈', change: 'AI', trend: 'up' },
    { id: 'ai-rec', label: 'Recommendations', value: ai.recommendationsGenerated || 0, icon: '💡', change: 'AI', trend: 'up' },
    { id: 'ai-org', label: 'Most Active Org', value: ai.mostActiveOrganization || '—', icon: '🏢', change: ai.mostActiveCount ? `${ai.mostActiveCount} requests` : 'None', trend: 'up', format: 'text' },
  ];

  const allKpis = [...kpis, ...billingKpis, ...aiKpis];

  grid.innerHTML = allKpis.map((kpi, i) => {
    let display;
    if (kpi.format === 'currency') {
      display = `$${(kpi.value / 1000000).toFixed(2)}M`;
    } else if (kpi.format === 'inr') {
      display = `₹${(kpi.value / 100).toLocaleString('en-IN')}`;
    } else if (kpi.format === 'text') {
      display = String(kpi.value);
    } else {
      display = kpi.value.toLocaleString();
    }
    return `
      <article class="kpi-card glass-card glow-border reveal" style="transition-delay:${i * 50}ms">
        <div class="kpi-card__header">
          <span class="kpi-card__icon">${kpi.icon}</span>
          <span class="kpi-card__change kpi-card__change--${kpi.trend}">${kpi.change}</span>
        </div>
        <div class="kpi-card__value">${display}</div>
        <div class="kpi-card__label">${kpi.label}</div>
      </article>
    `;
  }).join('');
}

function renderAdminCharts(stats) {
  const growthCanvas = document.getElementById('admin-chart-growth');
  const rolesCanvas = document.getElementById('admin-chart-roles');

  if (growthCanvas) {
    const labels = stats.userGrowth?.map((g) => g._id) || [];
    const data = stats.userGrowth?.map((g) => g.count) || [];
    registerChart(new Chart(growthCanvas.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{ label: 'New Users', data, borderColor: CHART_COLORS.primary, backgroundColor: 'rgba(108,99,255,0.15)', fill: true, tension: 0.4 }],
      },
      options: { ...CHART_DEFAULTS, plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } } },
    }));
  }

  if (rolesCanvas) {
    const labels = stats.roleDistribution?.map((r) => r._id) || [];
    const data = stats.roleDistribution?.map((r) => r.count) || [];
    registerChart(new Chart(rolesCanvas.getContext('2d'), {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: CHART_COLORS.palette }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8', boxWidth: 10 } } } },
    }));
  }
}

function getFilteredUsers() {
  const search = document.getElementById('user-search')?.value.toLowerCase() || '';
  const role = document.getElementById('user-role-filter')?.value || '';
  const status = document.getElementById('user-status-filter')?.value || '';

  return allUsers.filter((u) => {
    const matchSearch = !search || u.fullName.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
    const matchRole = !role || u.role === role;
    const matchStatus = !status || u.status === status;
    return matchSearch && matchRole && matchStatus;
  });
}

function renderUsersTable() {
  const filtered = getFilteredUsers();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (userPage > totalPages) userPage = totalPages;

  const start = (userPage - 1) * PAGE_SIZE;
  const pageUsers = filtered.slice(start, start + PAGE_SIZE);
  const tbody = document.getElementById('users-table-body');

  tbody.innerHTML = pageUsers.map((user) => `
    <tr>
      <td>${user.fullName}</td>
      <td>${user.email}</td>
      <td><span class="role-badge">${user.role}</span></td>
      <td>${user.organizationName}</td>
      <td><span class="status-badge status-badge--${user.status}">${user.status}</span></td>
      <td>${formatDate(user.createdAt)}</td>
      <td>
        <div class="admin-actions">
          <button class="btn btn--ghost btn--sm" type="button" data-view-user="${user.id}">View</button>
          ${canWrite ? `<button class="btn btn--secondary btn--sm" type="button" data-edit-user="${user.id}">Edit</button>` : ''}
          ${canWrite ? `<button class="btn btn--ghost btn--sm" type="button" data-toggle-user="${user.id}" data-status="${user.status}">${user.status === 'active' ? 'Disable' : 'Enable'}</button>` : ''}
          ${canWrite ? `<button class="btn btn--ghost btn--sm" type="button" data-delete-user="${user.id}">Delete</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7">No users found.</td></tr>';

  document.getElementById('users-page-info').textContent = `Showing ${pageUsers.length} of ${filtered.length} users`;
  document.getElementById('users-prev').disabled = userPage <= 1;
  document.getElementById('users-next').disabled = userPage >= totalPages;
}

async function loadUsers() {
  allUsers = await fetchAdminUsers();
  renderUsersTable();
}

function renderOrganizations(orgs) {
  const grid = document.getElementById('org-grid');
  grid.innerHTML = orgs.map((org) => `
    <article class="glass-card glow-border org-card reveal" style="padding: var(--space-5);">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:var(--space-3);">
        <div>
          <h3 class="widget__title" style="margin:0;">${org.name}</h3>
          <p class="settings-row__hint">${org.industry} · ${org.size}</p>
        </div>
        <span class="status-badge status-badge--${org.status}">${org.status}</span>
      </div>
      <div class="org-card__stats">
        <div class="org-card__stat"><span>Users</span><strong>${org.userCount}</strong></div>
        <div class="org-card__stat"><span>Reports</span><strong>${org.reportCount}</strong></div>
        <div class="org-card__stat"><span>Revenue</span><strong>$${(org.revenue / 1000000).toFixed(2)}M</strong></div>
        <div class="org-card__stat"><span>Owner</span><strong style="font-size:var(--text-sm)">${org.ownerName}</strong></div>
      </div>
      <div class="admin-actions" style="margin-top:var(--space-4);">
        <button class="btn btn--ghost btn--sm" type="button" data-view-org="${org.id}">Details</button>
        ${canWrite ? `<button class="btn btn--secondary btn--sm" type="button" data-edit-org="${org.id}">Edit</button>` : ''}
        ${canWrite && org.status === 'active' ? `<button class="btn btn--ghost btn--sm" type="button" data-disable-org="${org.id}">Disable</button>` : ''}
      </div>
    </article>
  `).join('');
}

function renderAuditLogs(logs) {
  const tbody = document.getElementById('audit-table-body');
  tbody.innerHTML = logs.map((log) => `
    <tr>
      <td>${formatDate(log.timestamp)} ${new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
      <td>${log.user}</td>
      <td><span class="audit-action">${formatAction(log.action)}</span></td>
      <td>${log.target}</td>
      <td>${log.organization || '—'}</td>
    </tr>
  `).join('') || '<tr><td colspan="5">No audit entries yet.</td></tr>';
}

async function openUserModal(userId, viewOnly = false) {
  const user = await fetchAdminUser(userId);
  document.getElementById('user-id').value = user.id;
  document.getElementById('user-name').value = user.fullName;
  document.getElementById('user-email').value = user.email;
  document.getElementById('user-role').value = user.role;
  document.getElementById('user-status').value = user.status;
  document.getElementById('user-modal-title').textContent = viewOnly ? 'View User' : 'Edit User';
  document.querySelector('#user-form button[type="submit"]').hidden = viewOnly || !canWrite;
  document.querySelectorAll('#user-form input, #user-form select').forEach((el) => { el.disabled = viewOnly || !canWrite; });
  openModal('user-modal');
}

async function openOrgModal(orgId) {
  const org = await fetchAdminOrganization(orgId);
  document.getElementById('org-id').value = org.id;
  document.getElementById('org-name').value = org.name;
  document.getElementById('org-industry').value = org.industry;
  document.getElementById('org-size').value = org.size;
  document.getElementById('org-status').value = org.status;
  document.getElementById('org-modal-title').textContent = 'Edit Organization';
  openModal('org-modal');
}

function bindTabs() {
  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('is-active'));
      document.querySelectorAll('.admin-panel').forEach((p) => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      document.querySelector(`[data-panel="${tab.dataset.tab}"]`)?.classList.add('is-active');
    });
  });
}

function bindUserEvents() {
  document.getElementById('user-search')?.addEventListener('input', () => { userPage = 1; renderUsersTable(); });
  document.getElementById('user-role-filter')?.addEventListener('change', () => { userPage = 1; renderUsersTable(); });
  document.getElementById('user-status-filter')?.addEventListener('change', () => { userPage = 1; renderUsersTable(); });
  document.getElementById('users-prev')?.addEventListener('click', () => { userPage -= 1; renderUsersTable(); });
  document.getElementById('users-next')?.addEventListener('click', () => { userPage += 1; renderUsersTable(); });

  document.getElementById('users-table-body')?.addEventListener('click', async (e) => {
    const viewId = e.target.dataset.viewUser;
    const editId = e.target.dataset.editUser;
    const toggleId = e.target.dataset.toggleUser;
    const deleteId = e.target.dataset.deleteUser;

    if (viewId) openUserModal(viewId, true);
    if (editId) openUserModal(editId, false);

    if (toggleId && canWrite) {
      const newStatus = e.target.dataset.status === 'active' ? 'disabled' : 'active';
      const ok = await confirmAction(`${newStatus === 'disabled' ? 'Disable' : 'Enable'} this user?`);
      if (!ok) return;
      await updateAdminUser(toggleId, { status: newStatus });
      showToast(`User ${newStatus === 'disabled' ? 'disabled' : 'enabled'}`);
      await loadUsers();
    }

    if (deleteId && canWrite) {
      const ok = await confirmAction('Delete this user permanently?');
      if (!ok) return;
      await deleteAdminUser(deleteId);
      showToast('User deleted');
      await loadUsers();
    }
  });

  document.getElementById('user-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!canWrite) return;
    const id = document.getElementById('user-id').value;
    await updateAdminUser(id, {
      fullName: document.getElementById('user-name').value,
      email: document.getElementById('user-email').value,
      role: document.getElementById('user-role').value,
      status: document.getElementById('user-status').value,
    });
    closeModal('user-modal');
    showToast('User updated');
    await loadUsers();
  });

  document.querySelectorAll('[data-close-user-modal]').forEach((el) => {
    el.addEventListener('click', () => closeModal('user-modal'));
  });
}

function bindOrgEvents() {
  document.getElementById('org-grid')?.addEventListener('click', async (e) => {
    const viewId = e.target.dataset.viewOrg;
    const editId = e.target.dataset.editOrg;
    const disableId = e.target.dataset.disableOrg;

    if (viewId) {
      const org = await fetchAdminOrganization(viewId);
      alert(`${org.name}\nUsers: ${org.userCount}\nReports: ${org.reportCount}\nRevenue: $${org.revenue.toLocaleString()}`);
    }
    if (editId) openOrgModal(editId);
    if (disableId && canWrite) {
      const ok = await confirmAction('Disable this organization?');
      if (!ok) return;
      await updateAdminOrganization(disableId, { status: 'disabled' });
      showToast('Organization disabled');
      renderOrganizations(await fetchAdminOrganizations());
    }
  });

  document.getElementById('org-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('org-id').value;
    await updateAdminOrganization(id, {
      name: document.getElementById('org-name').value,
      industry: document.getElementById('org-industry').value,
      size: document.getElementById('org-size').value,
      status: document.getElementById('org-status').value,
    });
    closeModal('org-modal');
    showToast('Organization updated');
    renderOrganizations(await fetchAdminOrganizations());
  });

  document.getElementById('create-org-btn')?.addEventListener('click', async () => {
    const name = prompt('Organization name:');
    if (!name) return;
    await createAdminOrganization({ name });
    showToast('Organization created');
    renderOrganizations(await fetchAdminOrganizations());
  });

  document.querySelectorAll('[data-close-org-modal]').forEach((el) => {
    el.addEventListener('click', () => closeModal('org-modal'));
  });
}

async function initAdmin() {
  currentUser = getStoredUser();
  canWrite = currentUser?.role !== 'Viewer';

  if (!currentUser || !['Admin', 'Manager'].includes(currentUser.role)) {
    window.location.href = 'dashboard.html';
    return;
  }

  if (currentUser.role === 'Admin') {
    document.getElementById('create-org-btn')?.removeAttribute('hidden');
  }

  bindTabs();
  bindUserEvents();
  bindOrgEvents();

  const [stats, orgs, logs] = await Promise.all([
    fetchAdminStats(),
    fetchAdminOrganizations(),
    fetchAdminAuditLogs(),
  ]);

  renderKpis(stats);
  renderAdminCharts(stats);
  renderOrganizations(orgs);
  renderAuditLogs(logs);
  await loadUsers();
}

initApp({
  activePage: 'admin',
  pageTitle: 'Admin',
  onReady: initAdmin,
});
