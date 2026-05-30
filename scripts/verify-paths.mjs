#!/usr/bin/env node
/**
 * VEXORA Path Verification for GitHub Pages
 * Ensures all asset references use relative paths that work when
 * deployed to https://<user>.github.io/<repo>/
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const passed = [];

const HTML_FILES = [
  'index.html',
  '404.html',
  'pages/login.html',
  'pages/signup.html',
  'pages/dashboard.html',
  'pages/analytics.html',
  'pages/insights.html',
  'pages/reports.html',
  'pages/settings.html',
];

/** Patterns that break GitHub Pages project-site deployment */
const FORBIDDEN_PATTERNS = [
  { pattern: /(?:href|src)=["']\/(?!\/)/, message: 'Absolute root path (href="/...") breaks project-site URLs' },
  { pattern: /from\s+["']\/(?!\/)/, message: 'Absolute root import breaks project-site URLs' },
  { pattern: /url\(\s*\/(?!\/)/, message: 'Absolute root url() in CSS breaks project-site URLs' },
];

function collectHtmlFiles(dir, list = []) {
  if (!existsSync(dir)) return list;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory() && entry !== 'node_modules') {
      collectHtmlFiles(full, list);
    } else if (entry.endsWith('.html')) {
      list.push(relative(ROOT, full).replace(/\\/g, '/'));
    }
  }
  return list;
}

function extractRefs(html) {
  const refs = [];
  const re = /(?:href|src)=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    let ref = m[1];
    if (ref.startsWith('http') || ref.startsWith('//') || ref.startsWith('data:') || ref.startsWith('#')) continue;
    ref = ref.split('#')[0].split('?')[0];
    if (ref) refs.push(ref);
  }
  return refs;
}

function verifyHtml(relativePath) {
  const full = join(ROOT, relativePath);
  const html = readFileSync(full, 'utf8');
  const baseDir = dirname(relativePath);

  FORBIDDEN_PATTERNS.forEach(({ pattern, message }) => {
    if (pattern.test(html)) {
      errors.push(`✗ ${relativePath}: ${message}`);
    }
  });

  extractRefs(html).forEach((ref) => {
    const resolved = resolve(join(ROOT, baseDir || '.'), ref);
    if (!existsSync(resolved)) {
      errors.push(`✗ ${relativePath}: broken ref "${ref}"`);
    }
  });

  passed.push(`✓ ${relativePath}`);
}

function verifyJsImports() {
  const jsFiles = ['js/app.js', 'js/auth-client.js', 'js/dashboard-app.js', 'js/shell.js', 'js/chart-utils.js',
    'js/mock-data.js', 'js/micro-interactions.js', 'js/theme.js', 'js/animations.js',
    'js/pages/dashboard.js', 'js/pages/analytics.js', 'js/pages/insights.js',
    'js/pages/reports.js', 'js/pages/settings.js', 'js/pages/login.js', 'js/pages/signup.js'];

  jsFiles.forEach((file) => {
    const content = readFileSync(join(ROOT, file), 'utf8');
    FORBIDDEN_PATTERNS.forEach(({ pattern, message }) => {
      if (pattern.test(content)) errors.push(`✗ ${file}: ${message}`);
    });

    const imports = content.matchAll(/from\s+['"]([^'"]+)['"]/g);
    for (const [, imp] of imports) {
      if (imp.startsWith('.')) {
        const resolved = resolve(join(ROOT, dirname(file)), imp);
        const candidates = [resolved, resolved + '.js'];
        if (!candidates.some(existsSync)) {
          errors.push(`✗ ${file}: broken import "${imp}"`);
        }
      }
    }
    passed.push(`✓ ${file}`);
  });
}

function verifyGhPagesFiles() {
  const required = ['.nojekyll', 'index.html', '404.html'];
  required.forEach((f) => {
    if (existsSync(join(ROOT, f))) {
      passed.push(`✓ GitHub Pages file: ${f}`);
    } else {
      errors.push(`✗ Missing GitHub Pages file: ${f}`);
    }
  });
}

/* Run checks */
verifyGhPagesFiles();
HTML_FILES.forEach(verifyHtml);
verifyJsImports();

console.log('\n══════════════════════════════════════');
console.log('  VEXORA GitHub Pages Path Audit');
console.log('══════════════════════════════════════\n');
console.log(`PASSED: ${passed.length}`);
passed.forEach((p) => console.log(`  ${p}`));

if (errors.length) {
  console.log(`\nERRORS: ${errors.length}`);
  errors.forEach((e) => console.log(`  ${e}`));
  console.log('\n❌ Path audit FAILED\n');
  process.exit(1);
}

console.log('\n✅ All paths compatible with GitHub Pages project-site deployment\n');
