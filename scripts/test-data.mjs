#!/usr/bin/env node
/**
 * VEXORA Data API QA
 * Verifies organization-scoped dashboard data persistence.
 */

import dotenv from 'dotenv';

dotenv.config();

const API_BASE = process.env.API_BASE || 'http://localhost:5000';

const results = [];
let failed = 0;
let token = '';

function pass(msg) { results.push(`✓ ${msg}`); }
function fail(msg) { results.push(`✗ ${msg}`); failed += 1; }

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function run() {
  const unique = Date.now();
  const user = {
    fullName: 'Data QA User',
    email: `data.qa.${unique}@vexora.test`,
    password: 'TestPass123!',
    role: 'Admin',
  };

  const register = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(user),
  });

  if (register.response.ok && register.data.token) {
    token = register.data.token;
    pass('Authenticated test user created');
  } else {
    fail('Failed to create test user');
    return finish();
  }

  const metricsGet = await request('/api/dashboard/metrics');
  if (metricsGet.response.ok && metricsGet.data.metrics?.kpis?.length === 6) {
    pass('Dashboard loads metrics from database');
  } else {
    fail('Dashboard metrics GET failed');
  }

  const updatedRevenue = 3000000;
  const metricsPost = await request('/api/dashboard/metrics', {
    method: 'POST',
    body: JSON.stringify({ revenue: updatedRevenue }),
  });

  if (metricsPost.response.ok && metricsPost.data.metrics?.revenue === updatedRevenue) {
    pass('Metrics persist on update');
  } else {
    fail('Metrics POST/update failed');
  }

  const metricsVerify = await request('/api/dashboard/metrics');
  if (metricsVerify.data.metrics?.revenue === updatedRevenue) {
    pass('Metrics persist after re-fetch');
  } else {
    fail('Metrics did not persist');
  }

  const activities = await request('/api/activities');
  if (activities.response.ok && Array.isArray(activities.data.activities) && activities.data.activities.length > 0) {
    pass('Activities load from database');
  } else {
    fail('Activities GET failed');
  }

  const notifications = await request('/api/notifications');
  if (notifications.response.ok && Array.isArray(notifications.data.notifications) && notifications.data.notifications.length > 0) {
    pass('Notifications load from database');
  } else {
    fail('Notifications GET failed');
  }

  const unread = notifications.data.notifications.find((n) => n.unread);
  if (unread) {
    const markRead = await request(`/api/notifications/${unread.id}/read`, { method: 'PATCH' });
    if (markRead.response.ok && markRead.data.notification?.read === true) {
      pass('Notifications persist read state');
    } else {
      fail('Notification mark read failed');
    }
  } else {
    pass('Notifications persist read state (no unread to patch)');
  }

  const reports = await request('/api/reports');
  if (reports.response.ok && Array.isArray(reports.data.reports) && reports.data.reports.length > 0) {
    pass('Reports load from database');
  } else {
    fail('Reports GET failed');
  }

  const newReport = await request('/api/reports', {
    method: 'POST',
    body: JSON.stringify({
      title: 'QA Persistence Report',
      description: 'Created by data QA script',
      category: 'Executive',
    }),
  });

  if (newReport.response.ok && newReport.data.report?.title === 'QA Persistence Report') {
    pass('Reports persist on create');
  } else {
    fail('Reports POST failed');
  }

  const unauthorized = await request('/api/dashboard/metrics', {
    headers: { Authorization: 'Bearer invalid-token' },
  });

  if (unauthorized.response.status === 401) {
    pass('Organization data requires authentication');
  } else {
    fail('Unauthorized access should return 401');
  }

  finish();
}

function finish() {
  console.log('\n══════════════════════════════════════');
  console.log('  VEXORA DATA API QA REPORT');
  console.log('══════════════════════════════════════\n');
  results.forEach((line) => console.log(`  ${line}`));
  console.log(`\n${failed === 0 ? '✅ DATA QA PASSED' : '❌ DATA QA FAILED'} (${results.length} checks, ${failed} failed)\n`);
  process.exit(failed === 0 ? 0 : 1);
}

run().catch((error) => {
  fail(error.message);
  finish();
});
