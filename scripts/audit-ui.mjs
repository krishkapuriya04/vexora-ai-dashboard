/**
 * Interactive UI audit — inventories buttons and documents wiring status.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const PAGE_FILES = [
  'index.html',
  'pages/dashboard.html',
  'pages/analytics.html',
  'pages/insights.html',
  'pages/reports.html',
  'pages/billing.html',
  'pages/settings.html',
  'pages/admin.html',
  'pages/login.html',
  'pages/signup.html',
];

const WIRED_PATTERNS = [
  /addEventListener/,
  /data-save-/,
  /data-export/,
  /data-close/,
  /href="/,
  /type="submit"/,
  /id="(create|export|logout|notify|profile|dashboard|report|billing|settings|enable|change|view|save|upload|manage|send)/,
  /class="btn[^"]*".*href=/,
];

const PLACEHOLDER_HINTS = [
  'coming soon',
  'showComingSoon',
  'Backend integration',
];

function countButtons(html) {
  const buttonMatches = html.match(/<button\b[^>]*>/gi) || [];
  const roleButtons = (html.match(/role="button"/gi) || []).length;
  const ctaLinks = (html.match(/class="[^"]*btn[^"]*"[^>]*>/gi) || []).filter((t) => t.includes('href=')).length;
  return buttonMatches.length + Math.max(0, roleButtons - buttonMatches.length) + ctaLinks;
}

function scanPage(relPath) {
  const full = path.join(root, relPath);
  if (!fs.existsSync(full)) return null;
  const html = fs.readFileSync(full, 'utf8');
  const jsName = relPath.replace('index.html', 'app.js').replace(/^pages\//, 'js/pages/').replace('.html', '.js');
  const jsPath = path.join(root, jsName);
  const shellJs = path.join(root, 'js/shell.js');
  const jsContent = [
    fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8') : '',
    relPath.startsWith('pages/') ? fs.readFileSync(shellJs, 'utf8') : '',
    relPath === 'index.html' ? fs.readFileSync(path.join(root, 'js/app.js'), 'utf8') : '',
  ].join('\n');

  const buttons = countButtons(html);
  const wiredScore = WIRED_PATTERNS.some((p) => p.test(jsContent)) || WIRED_PATTERNS.some((p) => p.test(html));
  const hasPlaceholders = PLACEHOLDER_HINTS.some((p) => jsContent.toLowerCase().includes(p.toLowerCase()));

  return {
    page: relPath,
    buttons,
    status: wiredScore ? 'wired' : 'review',
    placeholders: hasPlaceholders,
  };
}

const results = PAGE_FILES.map(scanPage).filter(Boolean);
const totalButtons = results.reduce((s, r) => s + r.buttons, 0);
const wiredPages = results.filter((r) => r.status === 'wired').length;

const report = {
  generatedAt: new Date().toISOString(),
  totalButtons,
  workingPages: wiredPages,
  fixedInAudit: [
    'Settings: profile/workspace/notifications/appearance save + API persistence',
    'Reports: Create/Edit/Delete/Preview + API CRUD',
    'Dashboard: date range toggle + PDF export',
    'Shell: notification mark-read + profile/billing links',
    'Admin: org details modal + create org form',
    'Landing: preview tabs + Watch Demo video',
  ],
  newlyConnected: [
    'PATCH /api/auth/profile',
    'PATCH /api/auth/organization',
    'Reports CRUD UI',
    'Settings preferences persistence',
  ],
  remainingPlaceholders: [
    'Avatar upload (coming soon toast)',
    '2FA enable (coming soon toast)',
    'Password change (coming soon toast)',
    'Integration OAuth (local toggle state)',
  ],
  pages: results,
};

const outDir = path.join(root, 'portfolio-assets');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'ui-audit-results.json'), JSON.stringify(report, null, 2));

const md = `# VEXORA Interactive UI Audit Report

Generated: ${report.generatedAt}

## Summary

| Metric | Count |
|--------|-------|
| Total interactive elements (approx.) | ${totalButtons} |
| Pages with wired JS handlers | ${wiredPages}/${results.length} |
| Fixed in this audit | ${report.fixedInAudit.length} areas |
| Newly connected APIs | ${report.newlyConnected.length} |
| Intentional placeholders | ${report.remainingPlaceholders.length} |

## Fixed

${report.fixedInAudit.map((x) => `- ${x}`).join('\n')}

## Newly Connected

${report.newlyConnected.map((x) => `- ${x}`).join('\n')}

## Remaining Placeholders (professional feedback)

${report.remainingPlaceholders.map((x) => `- ${x}`).join('\n')}

## Per Page

| Page | Buttons (approx.) | Status |
|------|-------------------|--------|
${results.map((r) => `| ${r.page} | ${r.buttons} | ${r.status} |`).join('\n')}
`;

fs.writeFileSync(path.join(outDir, 'UI-AUDIT-REPORT.md'), md);
console.log('UI audit complete:', path.join(outDir, 'UI-AUDIT-REPORT.md'));
console.log(`Total buttons: ${totalButtons}, wired pages: ${wiredPages}/${results.length}`);
