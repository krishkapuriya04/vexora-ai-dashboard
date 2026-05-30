/**
 * VEXORA API Client
 * Authenticated fetch helpers for dashboard data APIs.
 */

import { getApiBase, getToken } from './auth-client.js';

async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

export async function fetchDashboardMetrics() {
  const data = await apiRequest('/api/dashboard/metrics');
  return data.metrics;
}

export async function updateDashboardMetrics(payload) {
  const data = await apiRequest('/api/dashboard/metrics', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.metrics;
}

export async function fetchActivities() {
  const data = await apiRequest('/api/activities');
  return data.activities;
}

export async function fetchNotifications() {
  const data = await apiRequest('/api/notifications');
  return data.notifications;
}

export async function markNotificationRead(id) {
  return apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead() {
  return apiRequest('/api/notifications/read-all', { method: 'PATCH' });
}

export async function fetchReports() {
  const data = await apiRequest('/api/reports');
  return data.reports;
}

export async function createReport(payload) {
  const data = await apiRequest('/api/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.report;
}

export async function updateReport(id, payload) {
  const data = await apiRequest(`/api/reports/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data.report;
}

export async function deleteReport(id) {
  return apiRequest(`/api/reports/${id}`, { method: 'DELETE' });
}

export async function downloadExport(format) {
  const token = getToken();
  const response = await fetch(`${getApiBase()}/api/export/${format}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Export failed (${response.status})`);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="([^"]+)"/);
  const ext = format === 'excel' ? 'xlsx' : format;
  const filename = match?.[1] || `vexora-export-${Date.now()}.${ext}`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return filename;
}

export async function fetchAdminStats() {
  const data = await apiRequest('/api/admin/stats');
  return data.stats;
}

export async function fetchAdminUsers(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const data = await apiRequest(`/api/admin/users${qs ? `?${qs}` : ''}`);
  return data.users;
}

export async function fetchAdminUser(id) {
  const data = await apiRequest(`/api/admin/users/${id}`);
  return data.user;
}

export async function updateAdminUser(id, payload) {
  const data = await apiRequest(`/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data.user;
}

export async function deleteAdminUser(id) {
  return apiRequest(`/api/admin/users/${id}`, { method: 'DELETE' });
}

export async function fetchAdminOrganizations() {
  const data = await apiRequest('/api/admin/organizations');
  return data.organizations;
}

export async function fetchAdminOrganization(id) {
  const data = await apiRequest(`/api/admin/organizations/${id}`);
  return data.organization;
}

export async function createAdminOrganization(payload) {
  const data = await apiRequest('/api/admin/organizations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.organization;
}

export async function updateAdminOrganization(id, payload) {
  const data = await apiRequest(`/api/admin/organizations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data.organization;
}

export async function fetchAdminAuditLogs() {
  const data = await apiRequest('/api/admin/audit-logs');
  return data.logs;
}

export async function fetchBillingPlans() {
  const data = await apiRequest('/api/billing/plans');
  return data.plans;
}

export async function fetchBillingSubscription() {
  const data = await apiRequest('/api/billing/subscription');
  return data.subscription;
}

export async function fetchBillingHistory() {
  const data = await apiRequest('/api/billing/history');
  return data.payments;
}

export async function createBillingOrder(plan) {
  const data = await apiRequest('/api/billing/create-order', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });
  return data;
}

export async function verifyBillingPayment(payload) {
  const data = await apiRequest('/api/billing/verify-payment', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export default {
  fetchDashboardMetrics,
  updateDashboardMetrics,
  fetchActivities,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  fetchReports,
  createReport,
  updateReport,
  deleteReport,
  downloadExport,
  fetchAdminStats,
  fetchAdminUsers,
  fetchAdminUser,
  updateAdminUser,
  deleteAdminUser,
  fetchAdminOrganizations,
  fetchAdminOrganization,
  createAdminOrganization,
  updateAdminOrganization,
  fetchAdminAuditLogs,
  fetchBillingPlans,
  fetchBillingSubscription,
  fetchBillingHistory,
  createBillingOrder,
  verifyBillingPayment,
};
