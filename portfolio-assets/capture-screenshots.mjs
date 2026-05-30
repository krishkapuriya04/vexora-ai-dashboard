#!/usr/bin/env node
/**
 * VEXORA Portfolio Screenshot Capture
 * Captures premium showcase screenshots at consistent viewport sizes.
 *
 * Usage:
 *   npx serve . -p 3456          (in another terminal)
 *   node portfolio-assets/capture-screenshots.mjs
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'portfolio-assets', 'screenshots');
const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'http://localhost:3456';

/** Premium portfolio viewport — MacBook Pro 14" logical */
const VIEWPORT = { width: 1440, height: 900 };

const CAPTURES = [
  {
    id: 'landing-page',
    url: '/',
    title: 'Landing Page',
    waitMs: 2500,
    fullPage: true,
  },
  {
    id: 'dashboard',
    url: '/pages/dashboard.html',
    title: 'Dashboard',
    waitMs: 2200,
    fullPage: false,
  },
  {
    id: 'analytics',
    url: '/pages/analytics.html',
    title: 'Analytics',
    waitMs: 2200,
    fullPage: false,
  },
  {
    id: 'ai-insights',
    url: '/pages/insights.html',
    title: 'AI Insights',
    waitMs: 2200,
    fullPage: true,
  },
  {
    id: 'reports',
    url: '/pages/reports.html',
    title: 'Reports',
    waitMs: 2000,
    fullPage: false,
  },
  {
    id: 'settings',
    url: '/pages/settings.html',
    title: 'Settings',
    waitMs: 1800,
    fullPage: false,
  },
];

async function waitForReady(page) {
  /* Hide loader on landing */
  await page.waitForFunction(() => {
    const loader = document.getElementById('loader');
    return !loader || loader.classList.contains('is-hidden');
  }, { timeout: 10000 }).catch(() => {});

  /* Wait for app skeleton to clear */
  await page.waitForFunction(() => {
    const skeleton = document.querySelector('.page-skeleton');
    return !skeleton || skeleton.classList.contains('is-hidden');
  }, { timeout: 10000 }).catch(() => {});

  /* Wait for page content visible */
  await page.waitForFunction(() => {
    const content = document.querySelector('.page-content');
    return !content || content.classList.contains('is-loaded');
  }, { timeout: 10000 }).catch(() => {});

  /* Allow charts and counters to animate in */
  await new Promise((r) => setTimeout(r, 800));
}

async function preparePopulatedState(page, capture) {
  if (capture.id === 'landing-page') {
    /* Scroll past loader, ensure hero stats visible */
    await page.evaluate(() => window.scrollTo(0, 0));
    return;
  }

  /* Ensure sidebar expanded for showcase */
  await page.evaluate(() => {
    document.body.classList.remove('sidebar-collapsed');
    localStorage.setItem('vexora-sidebar-collapsed', 'false');
  });

  /* Dashboard: scroll to show KPIs + charts */
  if (capture.id === 'dashboard') {
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  if (capture.id === 'analytics') {
    await page.evaluate(() => window.scrollTo(0, 120));
  }

  if (capture.id === 'ai-insights') {
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  if (capture.id === 'reports') {
    await page.evaluate(() => {
      document.querySelector('.filter-chip.is-active')?.click();
      window.scrollTo(0, 200);
    });
  }

  if (capture.id === 'settings') {
    await page.evaluate(() => {
      const profile = document.querySelector('[data-panel="profile"]');
      profile?.click();
      window.scrollTo(0, 0);
    });
  }
}

async function capture() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(join(OUT_DIR, 'full'), { recursive: true });
  await mkdir(join(OUT_DIR, 'thumb'), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });

  console.log('\n📸 VEXORA Screenshot Capture');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Viewport: ${VIEWPORT.width}×${VIEWPORT.height} @2x\n`);

  for (const item of CAPTURES) {
    const page = await context.newPage();
    const url = `${BASE_URL}${item.url}`;

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await new Promise((r) => setTimeout(r, item.waitMs));
      await waitForReady(page);
      await preparePopulatedState(page, item);
      await new Promise((r) => setTimeout(r, 600));

      const fullPath = join(OUT_DIR, 'full', `${item.id}.png`);
      const thumbPath = join(OUT_DIR, 'thumb', `${item.id}.png`);
      const rootPath = join(OUT_DIR, `${item.id}.png`);

      await page.screenshot({
        path: fullPath,
        fullPage: item.fullPage,
        animations: 'disabled',
      });

      /* Also save to root screenshots folder for easy access */
      await page.screenshot({
        path: rootPath,
        fullPage: item.fullPage,
        animations: 'disabled',
      });

      /* Thumbnail crop — above-the-fold hero */
      await page.setViewportSize({ width: 1440, height: 810 });
      if (!item.fullPage) {
        await page.screenshot({ path: thumbPath, animations: 'disabled' });
      } else {
        await page.screenshot({
          path: thumbPath,
          clip: { x: 0, y: 0, width: 1440, height: 810 },
          animations: 'disabled',
        });
      }

      console.log(`   ✓ ${item.title} → ${item.id}.png`);
    } catch (err) {
      console.error(`   ✗ ${item.title}: ${err.message}`);
      process.exitCode = 1;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\n✅ Capture complete.\n');
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
