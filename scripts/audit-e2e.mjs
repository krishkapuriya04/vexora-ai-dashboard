#!/usr/bin/env node
/**
 * VEXORA Complete End-to-End Audit
 * Tests all features as a real user via API + Playwright UI.
 */

import { chromium } from 'playwright';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const API = process.env.API_BASE || 'http://localhost:5000';
const APP = process.env.APP_BASE || 'http://localhost:5000';
const SCREENSHOT_DIR = join(ROOT, 'portfolio-assets', 'audit-screenshots');
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'test_qa_billing_secret';

const results = [];

function record(category, name, purpose, test, status, notes = '', screenshot = '') {
  results.push({ category, name, purpose, test, status, notes, screenshot });
}

async function api(path, options = {}, token = '') {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

function signPayment(orderId, paymentId) {
  return crypto.createHmac('sha256', KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
}

async function runApiAudit() {
  const unique = Date.now();
  const creds = {
    fullName: 'E2E Audit User',
    email: `e2e.audit.${unique}@vexora.test`,
    password: 'TestPass123!',
    role: 'Admin',
  };

  let token = '';
  let userId = '';
  let orgId = '';

  // AUTH
  const health = await api('/api/health');
  record('AUTH', 'API Health', 'Verify backend is running', 'GET /api/health', health.res.ok ? 'PASS' : 'FAIL', health.res.ok ? '' : `Status ${health.res.status}`);

  const reg = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(creds) });
  record('AUTH', 'Signup', 'Create new user account with org', 'POST /api/auth/register', reg.res.status === 201 && reg.data.token ? 'PASS' : 'FAIL', reg.data.message || '');
  token = reg.data.token || '';
  userId = reg.data.user?.id || '';

  const dup = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(creds) });
  record('AUTH', 'Duplicate Email Block', 'Prevent duplicate registration', 'POST register same email', dup.res.status === 409 ? 'PASS' : 'FAIL');

  const login = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: creds.email, password: creds.password, rememberMe: true }) });
  record('AUTH', 'Login', 'Authenticate with credentials', 'POST /api/auth/login', login.res.ok && login.data.token ? 'PASS' : 'FAIL');
  token = login.data.token || token;

  const profile = await api('/api/auth/profile', {}, token);
  record('AUTH', 'Session / Profile', 'Validate JWT session', 'GET /api/auth/profile', profile.res.ok && profile.data.user?.email === creds.email.toLowerCase() ? 'PASS' : 'FAIL');
  orgId = profile.data.user?.organization || '';

  const noAuth = await api('/api/auth/profile');
  record('AUTH', 'Protected Route', 'Block unauthenticated access', 'GET profile without token', noAuth.res.status === 401 ? 'PASS' : 'FAIL');

  const logout = await api('/api/auth/logout', { method: 'POST' }, token);
  record('AUTH', 'Logout', 'Invalidate session token', 'POST /api/auth/logout', logout.res.ok ? 'PASS' : 'FAIL');

  const afterLogout = await api('/api/auth/profile', {}, token);
  record('AUTH', 'Token Invalidation', 'Reject token after logout', 'GET profile after logout', afterLogout.res.status === 401 ? 'PASS' : 'FAIL');

  const relogin = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: creds.email, password: creds.password }) });
  token = relogin.data.token || '';
  record('AUTH', 'Re-login', 'Session persistence after logout', 'POST login again', relogin.res.ok ? 'PASS' : 'FAIL');

  // DASHBOARD
  const metrics = await api('/api/dashboard/metrics', {}, token);
  record('DASHBOARD', 'KPI Metrics', 'Load 6 KPI cards from DB', 'GET /api/dashboard/metrics', metrics.res.ok && metrics.data.metrics?.kpis?.length === 6 ? 'PASS' : 'FAIL');

  const metricsUpdate = await api('/api/dashboard/metrics', { method: 'POST', body: JSON.stringify({ revenue: 2500000 }) }, token);
  record('DASHBOARD', 'Metrics Update', 'Persist KPI changes', 'POST /api/dashboard/metrics', metricsUpdate.res.ok ? 'PASS' : 'FAIL');

  const activities = await api('/api/activities', {}, token);
  record('DASHBOARD', 'Activities', 'Load activity timeline', 'GET /api/activities', activities.res.ok && Array.isArray(activities.data.activities) ? 'PASS' : 'FAIL', `${activities.data.activities?.length || 0} activities`);

  const notifications = await api('/api/notifications', {}, token);
  record('DASHBOARD', 'Notifications', 'Load notification center', 'GET /api/notifications', notifications.res.ok && Array.isArray(notifications.data.notifications) ? 'PASS' : 'FAIL', `${notifications.data.notifications?.length || 0} notifications`);

  const notifRead = notifications.data.notifications?.[0];
  if (notifRead) {
    const markRead = await api(`/api/notifications/${notifRead.id}/read`, { method: 'PATCH' }, token);
    record('DASHBOARD', 'Mark Notification Read', 'Update notification state', 'PATCH notification read', markRead.res.ok ? 'PASS' : 'FAIL');
  } else {
    record('DASHBOARD', 'Mark Notification Read', 'Update notification state', 'PATCH notification read', 'WARN', 'No notifications to test');
  }

  // REPORTS
  const reportsList = await api('/api/reports', {}, token);
  record('REPORTS', 'List Reports', 'Load reports library', 'GET /api/reports', reportsList.res.ok ? 'PASS' : 'FAIL', `${reportsList.data.reports?.length || 0} reports`);

  const newReport = await api('/api/reports', { method: 'POST', body: JSON.stringify({ title: 'E2E Test Report', description: 'Audit report', category: 'Executive' }) }, token);
  const reportId = newReport.data.report?.id;
  record('REPORTS', 'Create Report', 'Add new report', 'POST /api/reports', newReport.res.status === 201 && reportId ? 'PASS' : 'FAIL');

  const editReport = await api(`/api/reports/${reportId}`, { method: 'PATCH', body: JSON.stringify({ title: 'E2E Updated Report' }) }, token);
  record('REPORTS', 'Edit Report', 'Update report details', 'PATCH /api/reports/:id', editReport.res.ok && editReport.data.report?.title === 'E2E Updated Report' ? 'PASS' : 'FAIL');

  const pdfExport = await fetch(`${API}/api/export/pdf`, { headers: { Authorization: `Bearer ${token}` } });
  const pdfBuf = await pdfExport.arrayBuffer();
  record('REPORTS', 'PDF Export', 'Download PDF export', 'GET /api/export/pdf', pdfExport.ok && pdfBuf.byteLength > 1000 ? 'PASS' : 'FAIL', `${pdfBuf.byteLength} bytes`);

  const csvExport = await fetch(`${API}/api/export/csv`, { headers: { Authorization: `Bearer ${token}` } });
  const csvText = await csvExport.text();
  record('REPORTS', 'CSV Export', 'Download CSV export', 'GET /api/export/csv', csvExport.ok && (csvText.includes('Dashboard Metrics') || csvText.includes('VEXORA Export')) ? 'PASS' : 'FAIL', `${csvText.length} bytes`);

  const excelExport = await fetch(`${API}/api/export/excel`, { headers: { Authorization: `Bearer ${token}` } });
  const excelBuf = await excelExport.arrayBuffer();
  const isXlsx = excelBuf.byteLength > 1000 && new Uint8Array(excelBuf)[0] === 0x50;
  record('REPORTS', 'Excel Export', 'Download Excel export', 'GET /api/export/excel', excelExport.ok && isXlsx ? 'PASS' : 'FAIL', `${excelBuf.byteLength} bytes`);

  const delReport = await api(`/api/reports/${reportId}`, { method: 'DELETE' }, token);
  record('REPORTS', 'Delete Report', 'Remove report', 'DELETE /api/reports/:id', delReport.res.ok ? 'PASS' : 'FAIL');

  // BILLING
  const plans = await api('/api/billing/plans', {}, token);
  record('BILLING', 'List Plans', 'Show subscription plans', 'GET /api/billing/plans', plans.res.ok && plans.data.plans?.length === 3 ? 'PASS' : 'FAIL');

  const order = await api('/api/billing/create-order', { method: 'POST', body: JSON.stringify({ plan: 'starter' }) }, token);
  record('BILLING', 'Create Order', 'Create Razorpay order', 'POST /api/billing/create-order', order.res.status === 201 && order.data.order?.orderId ? 'PASS' : 'FAIL', order.data.message || '');

  if (order.data.order?.orderId) {
    const orderId = order.data.order.orderId;
    const paymentId = `pay_e2e_${unique}`;
    const sig = signPayment(orderId, paymentId);
    const verify = await api('/api/billing/verify-payment', {
      method: 'POST',
      body: JSON.stringify({ razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: sig }),
    }, token);
    record('BILLING', 'Verify Payment', 'HMAC signature verification', 'POST /api/billing/verify-payment', verify.res.ok ? 'PASS' : 'FAIL', verify.data.message || '');

    const sub = await api('/api/billing/subscription', {}, token);
    record('BILLING', 'Subscription Activation', 'Activate subscription after payment', 'GET /api/billing/subscription', sub.res.ok && sub.data.subscription?.status === 'active' ? 'PASS' : 'FAIL', sub.data.subscription?.plan || '');

    const history = await api('/api/billing/history', {}, token);
    record('BILLING', 'Billing History', 'Store payment records', 'GET /api/billing/history', history.res.ok && history.data.payments?.some((p) => p.status === 'captured') ? 'PASS' : 'FAIL');
  } else {
    record('BILLING', 'Verify Payment', 'HMAC signature verification', 'POST verify-payment', 'WARN', 'Order creation failed — check RAZORPAY_MOCK');
    record('BILLING', 'Subscription Activation', 'Activate subscription', 'GET subscription', 'WARN', 'Skipped');
    record('BILLING', 'Billing History', 'Payment history', 'GET history', 'WARN', 'Skipped');
  }

  // ADMIN
  const adminStats = await api('/api/admin/stats', {}, token);
  record('ADMIN', 'Admin Stats', 'Platform KPI dashboard', 'GET /api/admin/stats', adminStats.res.ok && adminStats.data.stats?.totalUsers >= 1 ? 'PASS' : 'FAIL');

  const users = await api('/api/admin/users', {}, token);
  record('ADMIN', 'User Management', 'List all users', 'GET /api/admin/users', users.res.ok && users.data.users?.length > 0 ? 'PASS' : 'FAIL', `${users.data.users?.length} users`);

  const viewer = users.data.users?.find((u) => u.role === 'Viewer' && u.id !== userId);
  if (viewer) {
    const roleChange = await api(`/api/admin/users/${viewer.id}`, { method: 'PATCH', body: JSON.stringify({ role: 'Manager' }) }, token);
    record('ADMIN', 'Role Change', 'Update user role', 'PATCH /api/admin/users/:id', roleChange.res.ok ? 'PASS' : 'FAIL');
    await api(`/api/admin/users/${viewer.id}`, { method: 'PATCH', body: JSON.stringify({ role: 'Viewer' }) }, token);
  } else {
    record('ADMIN', 'Role Change', 'Update user role', 'PATCH user role', 'WARN', 'No viewer user to test');
  }

  const orgs = await api('/api/admin/organizations', {}, token);
  record('ADMIN', 'Organization List', 'List organizations', 'GET /api/admin/organizations', orgs.res.ok && orgs.data.organizations?.length > 0 ? 'PASS' : 'FAIL');

  if (orgs.data.organizations?.[0]) {
    const orgDetail = await api(`/api/admin/organizations/${orgs.data.organizations[0].id}`, {}, token);
    record('ADMIN', 'Organization Details', 'View org statistics', 'GET /api/admin/organizations/:id', orgDetail.res.ok ? 'PASS' : 'FAIL');
  }

  const audit = await api('/api/admin/audit-logs', {}, token);
  record('ADMIN', 'Audit Logs', 'View platform activity log', 'GET /api/admin/audit-logs', audit.res.ok && Array.isArray(audit.data.logs) ? 'PASS' : 'FAIL', `${audit.data.logs?.length} logs`);

  // AI
  const aiSummary = await api('/api/ai/generate-summary', { method: 'POST' }, token);
  record('AI', 'Executive Summary', 'Generate AI performance summary', 'POST /api/ai/generate-summary', aiSummary.res.status === 201 && aiSummary.data.insight?.response?.length > 50 ? 'PASS' : 'FAIL');

  const aiForecast = await api('/api/ai/generate-forecast', { method: 'POST' }, token);
  record('AI', 'Forecast', 'Generate AI forecast', 'POST /api/ai/generate-forecast', aiForecast.res.status === 201 ? 'PASS' : 'FAIL');

  const aiRecs = await api('/api/ai/generate-recommendations', { method: 'POST' }, token);
  record('AI', 'Recommendations', 'Generate AI recommendations', 'POST /api/ai/generate-recommendations', aiRecs.res.status === 201 ? 'PASS' : 'FAIL');

  const aiRisk = await api('/api/ai/generate-risk-analysis', { method: 'POST' }, token);
  record('AI', 'Risk Analysis', 'Generate AI risk report', 'POST /api/ai/generate-risk-analysis', aiRisk.res.status === 201 ? 'PASS' : 'FAIL');

  const aiHistory = await api('/api/ai/history', {}, token);
  record('AI', 'AI History', 'Retrieve past AI generations', 'GET /api/ai/history', aiHistory.res.ok && aiHistory.data.insights?.length >= 4 ? 'PASS' : 'FAIL', `${aiHistory.data.insights?.length} insights`);

  return { token, creds };
}

async function runUiAudit({ creds }) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const viewports = [
    { name: 'Desktop', width: 1440, height: 900 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 812 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    const shot = (label) => join('portfolio-assets', 'audit-screenshots', `${label}-${vp.name.toLowerCase()}.png`);

    try {
      // Signup page load
      await page.goto(`${APP}/pages/signup.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);
      const signupVisible = await page.locator('#signup-form').isVisible();
      await page.screenshot({ path: join(ROOT, shot('01-signup')), fullPage: false });
      record('RESPONSIVE', `Signup Page (${vp.name})`, 'Signup form renders', `Viewport ${vp.width}x${vp.height}`, signupVisible ? 'PASS' : 'FAIL', '', shot('01-signup'));

      // Login flow
      await page.goto(`${APP}/pages/login.html`);
      await page.fill('#email', creds.email);
      await page.fill('#password', creds.password);
      await page.click('#login-submit');
      await page.waitForTimeout(3000);
      const onDashboard = page.url().includes('dashboard');
      record('AUTH', `Login UI (${vp.name})`, 'Browser login flow', 'Fill login form → dashboard', onDashboard ? 'PASS' : 'FAIL', page.url());

      if (!onDashboard) {
        await context.close();
        continue;
      }

      // Dashboard
      await page.waitForSelector('.kpi-card', { timeout: 10000 }).catch(() => {});
      const kpiCount = await page.locator('.kpi-card').count();
      await page.screenshot({ path: join(ROOT, shot('02-dashboard')), fullPage: false });
      record('DASHBOARD', `KPI Cards UI (${vp.name})`, 'Render KPI cards', 'Count .kpi-card elements', kpiCount >= 6 ? 'PASS' : 'FAIL', `${kpiCount} cards`, shot('02-dashboard'));

      const chartCount = await page.locator('canvas').count();
      record('DASHBOARD', `Charts UI (${vp.name})`, 'Render Chart.js charts', 'Count canvas elements', chartCount >= 2 ? 'PASS' : 'WARN', `${chartCount} charts`);

      // Mobile sidebar
      if (vp.name === 'Mobile') {
        const menuBtn = page.locator('#mobile-sidebar-toggle');
        if (await menuBtn.isVisible()) {
          await menuBtn.click();
          await page.waitForTimeout(500);
          const sidebarOpen = await page.locator('#sidebar.is-mobile-open').isVisible();
          record('RESPONSIVE', 'Mobile Navigation', 'Open mobile sidebar', 'Click hamburger menu', sidebarOpen ? 'PASS' : 'FAIL');
          await page.screenshot({ path: join(ROOT, shot('03-mobile-nav')), fullPage: false });
        }
      }

      // Reports page
      await page.goto(`${APP}/pages/reports.html`);
      await page.waitForTimeout(2500);
      const reportCards = await page.locator('.report-card').count();
      await page.screenshot({ path: join(ROOT, shot('04-reports')), fullPage: false });
      record('REPORTS', `Reports Library UI (${vp.name})`, 'Display report cards', 'Navigate to reports page', reportCards > 0 ? 'PASS' : 'FAIL', `${reportCards} cards`, shot('04-reports'));

      // Billing page
      await page.goto(`${APP}/pages/billing.html`);
      await page.waitForTimeout(2500);
      const billingPlan = await page.locator('.billing-plan-card').count();
      await page.screenshot({ path: join(ROOT, shot('05-billing')), fullPage: false });
      record('BILLING', `Billing Page UI (${vp.name})`, 'Show plan cards & subscription', 'Navigate to billing', billingPlan >= 3 ? 'PASS' : 'FAIL', `${billingPlan} plans`, shot('05-billing'));

      // Admin page
      await page.goto(`${APP}/pages/admin.html`);
      await page.waitForTimeout(3000);
      const adminKpi = await page.locator('.kpi-card').count();
      await page.screenshot({ path: join(ROOT, shot('06-admin')), fullPage: false });
      record('ADMIN', `Admin Panel UI (${vp.name})`, 'Admin dashboard renders', 'Navigate to admin', adminKpi >= 6 ? 'PASS' : 'FAIL', `${adminKpi} KPIs`, shot('06-admin'));

      // AI Insights
      await page.goto(`${APP}/pages/insights.html`);
      await page.waitForTimeout(3000);
      const aiToolbar = await page.locator('.ai-toolbar').isVisible();
      await page.screenshot({ path: join(ROOT, shot('07-insights')), fullPage: false });
      record('AI', `AI Insights UI (${vp.name})`, 'AI generation toolbar', 'Navigate to insights', aiToolbar ? 'PASS' : 'FAIL', '', shot('07-insights'));

      if (vp.name === 'Desktop') {
        const genBtn = page.locator('.ai-gen-btn[data-type="summary"]');
        if (await genBtn.isVisible()) {
          await genBtn.click();
          await page.waitForTimeout(8000);
          const outputVisible = !(await page.locator('#ai-output-panel').isHidden());
          await page.screenshot({ path: join(ROOT, shot('08-ai-generated')), fullPage: false });
          record('AI', 'Generate Summary UI', 'Click Generate Summary button', 'AI output panel appears', outputVisible ? 'PASS' : 'FAIL', '', shot('08-ai-generated'));
        }
      }

      // Logout
      await page.locator('#profile-trigger').click();
      await page.waitForTimeout(500);
      await page.locator('#logout-btn').click();
      await page.waitForTimeout(2000);
      const onLogin = page.url().includes('login');
      record('AUTH', 'Logout UI', 'Sign out via profile menu', 'Click logout → login page', onLogin ? 'PASS' : 'FAIL', page.url());

    } catch (err) {
      record('RESPONSIVE', `UI Audit (${vp.name})`, 'Full page flow', `Viewport test`, 'FAIL', err.message);
    }

    await context.close();
  }

  await browser.close();
}

function generateReport() {
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const warnings = results.filter((r) => r.status === 'WARN').length;

  const byCategory = {};
  results.forEach((r) => {
    if (!byCategory[r.category]) byCategory[r.category] = [];
    byCategory[r.category].push(r);
  });

  let md = `# VEXORA Complete E2E QA Report\n\n`;
  md += `**Date:** ${new Date().toISOString()}\n`;
  md += `**API Base:** ${API}\n`;
  md += `**App Base:** ${APP}\n\n`;
  md += `## Summary\n\n`;
  md += `| Metric | Count |\n|--------|-------|\n`;
  md += `| Total Features Tested | ${results.length} |\n`;
  md += `| Passed | ${passed} |\n`;
  md += `| Failed | ${failed} |\n`;
  md += `| Warnings | ${warnings} |\n\n`;

  Object.entries(byCategory).forEach(([cat, items]) => {
    md += `## ${cat}\n\n`;
    md += `| Feature | Purpose | Test | Result | Notes |\n`;
    md += `|---------|---------|------|--------|-------|\n`;
    items.forEach((r) => {
      md += `| ${r.name} | ${r.purpose} | ${r.test} | **${r.status}** | ${r.notes}${r.screenshot ? ` 📸 \`${r.screenshot}\`` : ''} |\n`;
    });
    md += `\n`;
  });

  const bugs = results.filter((r) => r.status === 'FAIL');
  if (bugs.length) {
    md += `## Bugs Found\n\n`;
    bugs.forEach((b, i) => {
      md += `${i + 1}. **${b.category} — ${b.name}:** ${b.notes || b.test}\n`;
    });
    md += `\n`;
  }

  const warns = results.filter((r) => r.status === 'WARN');
  if (warns.length) {
    md += `## Warnings\n\n`;
    warns.forEach((w) => {
      md += `- **${w.name}:** ${w.notes}\n`;
    });
    md += `\n`;
  }

  md += `## Recommended Fixes\n\n`;
  if (failed === 0 && warnings === 0) {
    md += `No critical issues found. All features operational.\n`;
  } else {
    if (bugs.some((b) => b.category === 'REPORTS' && b.name.includes('Create'))) {
      md += `- Add UI for report create/edit/delete (currently API-only)\n`;
    }
    if (bugs.some((b) => b.name.includes('Billing'))) {
      md += `- Ensure \`RAZORPAY_MOCK=true\` or Razorpay test keys in \`.env\` for billing tests\n`;
    }
    if (bugs.some((b) => b.category === 'AUTH')) {
      md += `- Verify \`npm start\` is running and MongoDB is connected\n`;
    }
    bugs.forEach((b) => {
      md += `- Fix **${b.name}** (${b.category}): ${b.notes || 'See test details above'}\n`;
    });
  }

  return { md, passed, failed, warnings, total: results.length };
}

async function main() {
  console.log('\n🔍 VEXORA Complete E2E Audit Starting...\n');
  console.log(`API: ${API}`);
  console.log(`App: ${APP}\n`);

  let creds;
  try {
    creds = await runApiAudit();
    console.log(`✓ API audit complete (${results.length} checks so far)`);
  } catch (err) {
    console.error('API audit error:', err.message);
    record('SYSTEM', 'API Audit', 'Run all API tests', 'API audit', 'FAIL', err.message);
    creds = { creds: { email: 'demo@vexora.ai', password: 'DemoPass123!' } };
  }

  try {
    await runUiAudit(creds);
    console.log(`✓ UI audit complete`);
  } catch (err) {
    console.error('UI audit error:', err.message);
    record('SYSTEM', 'UI Audit', 'Run Playwright tests', 'UI audit', 'FAIL', err.message);
  }

  const report = generateReport();
  const reportPath = join(ROOT, 'portfolio-assets', 'E2E-QA-REPORT.md');
  writeFileSync(reportPath, report.md);
  writeFileSync(join(ROOT, 'portfolio-assets', 'e2e-audit-results.json'), JSON.stringify(results, null, 2));

  console.log('\n══════════════════════════════════════');
  console.log('  VEXORA E2E QA SUMMARY');
  console.log('══════════════════════════════════════');
  console.log(`  Total:    ${report.total}`);
  console.log(`  Passed:   ${report.passed}`);
  console.log(`  Failed:   ${report.failed}`);
  console.log(`  Warnings: ${report.warnings}`);
  console.log(`\n  Report: portfolio-assets/E2E-QA-REPORT.md`);
  console.log(`  Screenshots: portfolio-assets/audit-screenshots/`);
  console.log('══════════════════════════════════════\n');

  process.exit(report.failed > 0 ? 1 : 0);
}

main();
