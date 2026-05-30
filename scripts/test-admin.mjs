#!/usr/bin/env node
/**
 * VEXORA Admin Panel QA
 */

import dotenv from 'dotenv';

dotenv.config();

const API_BASE = process.env.API_BASE || 'http://localhost:5000';
const results = [];
let failed = 0;
let adminToken = '';
let managerToken = '';
let viewerToken = '';
let viewerUserId = '';

function pass(msg) { results.push(`✓ ${msg}`); }
function fail(msg) { results.push(`✗ ${msg}`); failed += 1; }

async function request(path, options = {}, token = adminToken) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function registerUser(suffix, role) {
  const unique = Date.now() + suffix;
  const res = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: `${role} QA`,
      email: `admin.qa.${suffix}.${unique}@vexora.test`,
      password: 'TestPass123!',
      role,
    }),
  }, null);
  return res;
}

async function run() {
  try {
    const adminReg = await registerUser('admin', 'Admin');
    if (adminReg.response.ok) {
      adminToken = adminReg.data.token;
      pass('Admin user registered');
    } else fail('Admin registration failed');

    const managerReg = await registerUser('manager', 'Manager');
    if (managerReg.response.ok) {
      managerToken = managerReg.data.token;
      pass('Manager user registered');
    } else fail('Manager registration failed');

    const viewerReg = await registerUser('viewer', 'Viewer');
    if (viewerReg.response.ok) {
      viewerToken = viewerReg.data.token;
      viewerUserId = viewerReg.data.user?.id || '';
      pass('Viewer user registered');
    } else fail('Viewer registration failed');

    const viewerDenied = await request('/api/admin/stats', {}, viewerToken);
    if (viewerDenied.response.status === 403) {
      pass('Viewer blocked from admin APIs');
    } else fail('Viewer should be blocked from admin');

    const stats = await request('/api/admin/stats');
    if (stats.response.ok && stats.data.stats?.totalUsers >= 1) {
      pass('Admin stats API works');
    } else fail('Admin stats failed');

    const users = await request('/api/admin/users');
    if (users.response.ok && Array.isArray(users.data.users) && users.data.users.length > 0) {
      pass('Admin users list works');
    } else fail('Admin users list failed');

    const targetUser = users.data.users.find(
      (u) => u.role === 'Viewer' && u.id !== viewerUserId,
    ) || users.data.users.find((u) => u.id !== viewerUserId) || users.data.users[0];
    const update = await request(`/api/admin/users/${targetUser.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role: 'Manager' }),
    });
    if (update.response.ok && update.data.user?.role === 'Manager') {
      pass('User role update works');
    } else fail('User update failed');

    const disable = await request(`/api/admin/users/${targetUser.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'disabled' }),
    });
    if (disable.response.ok && disable.data.user?.status === 'disabled') {
      pass('User disable works');
    } else fail('User disable failed');

    const enable = await request(`/api/admin/users/${targetUser.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active' }),
    });
    if (enable.response.ok && enable.data.user?.status === 'active') {
      pass('User enable works');
    } else fail('User enable failed');

    const orgs = await request('/api/admin/organizations');
    if (orgs.response.ok && orgs.data.organizations?.length > 0) {
      pass('Organization list works');
    } else fail('Organization list failed');

    const orgId = orgs.data.organizations[0].id;
    const orgDetail = await request(`/api/admin/organizations/${orgId}`);
    if (orgDetail.response.ok && orgDetail.data.organization?.name) {
      pass('Organization details work');
    } else fail('Organization details failed');

    const audit = await request('/api/admin/audit-logs');
    if (audit.response.ok && Array.isArray(audit.data.logs)) {
      pass('Audit logs work');
    } else fail('Audit logs failed');

    const managerStats = await request('/api/admin/stats', {}, managerToken);
    if (managerStats.response.ok) {
      pass('Manager can access admin stats');
    } else fail('Manager admin access failed');

    const noAuth = await fetch(`${API_BASE}/api/admin/stats`);
    if (noAuth.status === 401) {
      pass('Admin APIs require authentication');
    } else fail('Unauthenticated access should return 401');
  } catch (error) {
    fail(error.message);
  }

  console.log('\n══════════════════════════════════════');
  console.log('  VEXORA ADMIN QA REPORT');
  console.log('══════════════════════════════════════\n');
  results.forEach((line) => console.log(`  ${line}`));
  console.log(`\n${failed === 0 ? '✅ ADMIN QA PASSED' : '❌ ADMIN QA FAILED'} (${results.length} checks, ${failed} failed)\n`);
  process.exit(failed === 0 ? 0 : 1);
}

run();
