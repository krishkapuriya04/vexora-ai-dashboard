#!/usr/bin/env node
/**
 * VEXORA Automated QA Verification
 * Validates file structure, asset references, and optional HTTP availability.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const passed = [];

const REQUIRED_PAGES = [
  'index.html',
  'pages/login.html',
  'pages/signup.html',
  'pages/dashboard.html',
  'pages/analytics.html',
  'pages/insights.html',
  'pages/reports.html',
  'pages/settings.html',
];

const REQUIRED_JS = [
  'js/app.js',
  'js/auth-client.js',
  'js/api-client.js',
  'js/app-config.js',
  'js/dashboard-app.js',
  'js/shell.js',
  'js/mock-data.js',
  'js/chart-utils.js',
  'js/theme.js',
  'js/animations.js',
  'js/pages/dashboard.js',
  'js/pages/analytics.js',
  'js/pages/insights.js',
  'js/pages/reports.js',
  'js/pages/settings.js',
  'js/pages/login.js',
  'js/pages/signup.js',
  'js/micro-interactions.js',
];

const REQUIRED_CSS = [
  'css/variables.css',
  'css/global.css',
  'css/animations.css',
  'css/landing.css',
  'css/app.css',
  'css/pages.css',
  'css/upgrade.css',
  'css/polish.css',
  'css/auth.css',
];

function checkExists(relativePath, label) {
  const full = join(ROOT, relativePath);
  if (existsSync(full)) {
    passed.push(`✓ ${label}: ${relativePath}`);
    return true;
  }
  errors.push(`✗ MISSING ${label}: ${relativePath}`);
  return false;
}

function extractAssetRefs(html, baseDir) {
  const refs = [];
  const linkRe = /(?:href|src)=["']([^"']+)["']/g;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    let ref = m[1];
    if (ref.startsWith('http') || ref.startsWith('//') || ref.startsWith('data:')) continue;
    ref = ref.split('#')[0];
    if (!ref || ref === '') continue;
    refs.push(ref);
  }
  return refs;
}

/* Step 1: Required files */
[...REQUIRED_PAGES, ...REQUIRED_JS, ...REQUIRED_CSS].forEach((f) => checkExists(f, 'file'));
checkExists('assets/icons/favicon.svg', 'asset');
checkExists('components/ui-components.js', 'file');

/* Step 2: Validate HTML asset references */
REQUIRED_PAGES.forEach((page) => {
  const full = join(ROOT, page);
  if (!existsSync(full)) return;
  const html = readFileSync(full, 'utf8');
  const baseDir = dirname(page).replace(/\\/g, '/');
  const refs = extractAssetRefs(html, baseDir === '.' ? '' : baseDir);

  refs.forEach((ref) => {
    const base = join(ROOT, baseDir || '.');
    const resolved = resolve(base, ref);
    if (!existsSync(resolved) && !ref.includes('?')) {
      errors.push(`✗ BROKEN REF in ${page}: ${ref}`);
    }
  });

  /* Check module script tags */
  if (page !== 'index.html' && !html.includes('dashboard-app.js') && !html.includes('pages/')) {
    if (!html.includes('type="module"')) {
      warnings.push(`⚠ No ES module entry in ${page}`);
    }
  }
});

/* Step 3: Chart canvas IDs in dashboard */
const dashHtml = existsSync(join(ROOT, 'pages/dashboard.html'))
  ? readFileSync(join(ROOT, 'pages/dashboard.html'), 'utf8') : '';
const dashJs = existsSync(join(ROOT, 'js/pages/dashboard.js'))
  ? readFileSync(join(ROOT, 'js/pages/dashboard.js'), 'utf8') : '';

const chartIds = ['chart-revenue-trend', 'chart-user-growth', 'chart-devices', 'chart-traffic', 'chart-funnel', 'chart-geography-dashboard'];
chartIds.forEach((id) => {
  if (dashHtml.includes(`id="${id}"`) && dashJs.includes(id)) {
    passed.push(`✓ Chart wired: ${id}`);
  } else if (dashHtml.includes(`id="${id}"`)) {
    warnings.push(`⚠ Chart canvas ${id} in HTML but may lack JS init`);
  }
});

/* Step 4: No remaining broken internal # links in shell */
const shellJs = existsSync(join(ROOT, 'js/shell.js'))
  ? readFileSync(join(ROOT, 'js/shell.js'), 'utf8') : '';
if (shellJs.includes("href: '#'") || shellJs.includes('href="#"')) {
  warnings.push('⚠ Shell still contains placeholder # hrefs');
} else {
  passed.push('✓ Shell navigation links configured');
}

if (shellJs.includes('settings.html')) {
  passed.push('✓ Settings route in shell');
}

/* Step 5: Optional HTTP check */
const port = process.env.QA_PORT || '3456';
const baseUrl = `http://localhost:${port}`;

async function checkHttp() {
  const urls = [
    '/',
    '/pages/login.html',
    '/pages/signup.html',
    '/pages/dashboard.html',
    '/pages/analytics.html',
    '/pages/insights.html',
    '/pages/reports.html',
    '/pages/settings.html',
    '/css/polish.css',
    '/assets/icons/logo-mark.svg',
    '/assets/icons/favicon.svg',
  ];

  for (const url of urls) {
    try {
      const res = await fetch(`${baseUrl}${url}`);
      if (res.ok) {
        passed.push(`✓ HTTP ${res.status}: ${url}`);
      } else {
        errors.push(`✗ HTTP ${res.status}: ${url}`);
      }
    } catch {
      warnings.push(`⚠ HTTP check skipped (no server on port ${port}): ${url}`);
    }
  }
}

await checkHttp();

/* Report */
console.log('\n══════════════════════════════════════');
console.log('  VEXORA QA VERIFICATION REPORT');
console.log('══════════════════════════════════════\n');

console.log(`PASSED: ${passed.length}`);
passed.forEach((p) => console.log(`  ${p}`));

if (warnings.length) {
  console.log(`\nWARNINGS: ${warnings.length}`);
  warnings.forEach((w) => console.log(`  ${w}`));
}

if (errors.length) {
  console.log(`\nERRORS: ${errors.length}`);
  errors.forEach((e) => console.log(`  ${e}`));
  console.log('\n❌ QA FAILED\n');
  process.exit(1);
}

console.log('\n✅ QA PASSED — All checks successful\n');
process.exit(0);
