/**
 * Deployment verification — run against local or production API.
 *
 * Usage:
 *   npm run verify:deploy
 *   API_BASE=https://your-app.onrender.com npm run verify:deploy
 */
const API_BASE = (process.env.API_BASE || process.env.VEXORA_API_BASE || 'http://localhost:5000').replace(/\/$/, '');

const checks = [];
let failed = 0;

function record(name, ok, detail = '') {
  checks.push({ name, ok, detail });
  if (!ok) failed += 1;
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function fetchJson(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

async function main() {
  console.log(`\nVEXORA deployment verify — ${API_BASE}\n`);

  try {
    const health = await fetchJson('/api/health');
    record('GET /api/health', health.res.ok && health.data.success);
  } catch (e) {
    record('GET /api/health', false, e.message);
  }

  try {
    const ready = await fetchJson('/api/health/ready');
    record('GET /api/health/ready', ready.res.ok && ready.data.database === 'connected', ready.data.message || '');
  } catch (e) {
    record('GET /api/health/ready', false, e.message);
  }

  const email = `deploy-${Date.now()}@vexora.test`;
  const password = 'DeployTest123!';

  try {
    const reg = await fetchJson('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Deploy QA', email, password, role: 'Admin' }),
    });
    const token = reg.data.token;
    record('POST /api/auth/register', reg.res.status === 201 && Boolean(token));

    const profile = await fetchJson('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    record('GET /api/auth/profile', profile.res.ok);

    const reports = await fetchJson('/api/reports', {
      headers: { Authorization: `Bearer ${token}` },
    });
    record('GET /api/reports', reports.res.ok);

    const plans = await fetchJson('/api/billing/plans', {
      headers: { Authorization: `Bearer ${token}` },
    });
    record('GET /api/billing/plans', plans.res.ok && plans.data.plans?.length >= 1);

    const ai = await fetchJson('/api/ai/history', {
      headers: { Authorization: `Bearer ${token}` },
    });
    record('GET /api/ai/history', ai.res.ok);
  } catch (e) {
    record('Auth + feature smoke', false, e.message);
  }

  console.log(`\n${checks.length - failed}/${checks.length} passed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
