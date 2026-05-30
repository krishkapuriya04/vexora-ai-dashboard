#!/usr/bin/env node
/**
 * VEXORA AI Engine QA
 */

import dotenv from 'dotenv';

dotenv.config();

const API_BASE = process.env.API_BASE || 'http://localhost:5000';
const results = [];
let failed = 0;
let token = '';
let tokenB = '';

function pass(msg) { results.push(`✓ ${msg}`); }
function fail(msg) { results.push(`✗ ${msg}`); failed += 1; }

async function request(path, options = {}, authToken = token) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function run() {
  try {
    const unique = Date.now();

    const regA = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'AI QA User A',
        email: `ai.qa.a.${unique}@vexora.test`,
        password: 'TestPass123!',
        role: 'Admin',
      }),
    }, null);

    if (regA.response.ok && regA.data.token) {
      token = regA.data.token;
      pass('Org A user registered');
    } else fail('Org A registration failed');

    const regB = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'AI QA User B',
        email: `ai.qa.b.${unique}@vexora.test`,
        password: 'TestPass123!',
        role: 'Admin',
      }),
    }, null);

    if (regB.response.ok && regB.data.token) {
      tokenB = regB.data.token;
      pass('Org B user registered');
    } else fail('Org B registration failed');

    const historyEmpty = await request('/api/ai/history');
    if (historyEmpty.response.ok && Array.isArray(historyEmpty.data.insights)) {
      pass('AI history API works');
    } else fail('AI history failed');

    const summary = await request('/api/ai/generate-summary', { method: 'POST' });
    if (summary.response.ok && summary.data.insight?.response?.length > 50) {
      pass('Executive summary generated');
    } else fail(`Summary generation failed: ${summary.data.message || summary.response.status}`);

    const forecast = await request('/api/ai/generate-forecast', { method: 'POST' });
    if (forecast.response.ok && forecast.data.insight?.category === 'Forecast') {
      pass('Forecast generated');
    } else fail('Forecast generation failed');

    const recs = await request('/api/ai/generate-recommendations', { method: 'POST' });
    if (recs.response.ok && recs.data.insight?.category === 'Recommendation') {
      pass('Recommendations generated');
    } else fail('Recommendations generation failed');

    const risk = await request('/api/ai/generate-risk-analysis', { method: 'POST' });
    if (risk.response.ok && risk.data.insight?.category === 'Risk Analysis') {
      pass('Risk analysis generated');
    } else fail('Risk analysis generation failed');

    const history = await request('/api/ai/history');
    if (history.response.ok && history.data.insights?.length >= 4) {
      pass('AI history stored (4+ entries)');
    } else fail('AI history not stored correctly');

    const historyB = await request('/api/ai/history', {}, tokenB);
    const historyA = await request('/api/ai/history', {}, token);
    if (historyB.response.ok && historyA.response.ok) {
      const bHasA = historyB.data.insights?.some((i) =>
        historyA.data.insights?.some((a) => a.id === i.id),
      );
      if (!bHasA && historyA.data.insights?.length > 0) {
        pass('Organization isolation works');
      } else if (historyB.data.insights?.length === 0) {
        pass('Organization isolation works');
      } else {
        fail('Organization isolation failed — cross-org data leak');
      }
    } else fail('Isolation check failed');

    const adminStats = await request('/api/admin/stats');
    if (adminStats.response.ok && adminStats.data.stats?.ai?.totalAIRequests >= 4) {
      pass('Admin AI statistics work');
    } else fail('Admin AI stats failed');

    const noAuth = await fetch(`${API_BASE}/api/ai/history`);
    if (noAuth.status === 401) {
      pass('AI APIs require authentication');
    } else fail('Unauthenticated AI access should return 401');
  } catch (error) {
    fail(error.message);
  }

  console.log('\n══════════════════════════════════════');
  console.log('  VEXORA AI QA REPORT');
  console.log('══════════════════════════════════════\n');
  results.forEach((line) => console.log(`  ${line}`));
  console.log(`\n${failed === 0 ? '✅ AI QA PASSED' : '❌ AI QA FAILED'} (${results.length} checks, ${failed} failed)\n`);
  process.exit(failed === 0 ? 0 : 1);
}

run();
