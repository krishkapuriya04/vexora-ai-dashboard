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

/**
 * Download organization export file (pdf | csv | excel).
 * @param {'pdf'|'csv'|'excel'} format
 */
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
};
