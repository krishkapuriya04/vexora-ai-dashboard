# VEXORA Portfolio Assets

Premium showcase screenshots and guidance for portfolio, LinkedIn, GitHub README, and case studies.

## Folder Structure

```
portfolio-assets/
├── README.md                    ← This file
├── SCREENSHOT-GUIDE.md          ← Detailed capture instructions
├── capture-screenshots.mjs      ← Automated capture script
└── screenshots/
    ├── landing-page.png         ← Primary showcase exports
    ├── dashboard.png
    ├── analytics.png
    ├── ai-insights.png
    ├── reports.png
    ├── settings.png
    ├── full/                    ← Full-resolution @2x captures
    └── thumb/                   ← Above-the-fold crops (1440×810)
```

## Quick Start — Automated Capture

```bash
# Terminal 1 — serve the site
npx serve . -p 3456

# Terminal 2 — capture all screenshots
node portfolio-assets/capture-screenshots.mjs
```

Screenshots are saved to `portfolio-assets/screenshots/` at **1440×900 @2x** (Retina quality).

## What's Included

| Screenshot | Page | Populated State |
|------------|------|-----------------|
| `landing-page.png` | `index.html` | Hero, stats, dashboard preview |
| `dashboard.png` | `pages/dashboard.html` | 6 KPIs, charts, timeline, AI feed |
| `analytics.png` | `pages/analytics.html` | Traffic, heatmap, engagement |
| `ai-insights.png` | `pages/insights.html` | AI feed, risk rings, forecast |
| `reports.png` | `pages/reports.html` | Report library, executive summaries |
| `settings.png` | `pages/settings.html` | Profile panel active |

## Recommended Use

- **GitHub README hero** — `screenshots/dashboard.png` or `landing-page.png`
- **Portfolio case study** — Full set in `screenshots/full/`
- **LinkedIn / Twitter** — `screenshots/thumb/` crops
- **Resume / PDF** — Export at 1440px width for crisp print

## Custom Base URL

For deployed sites (GitHub Pages, Vercel, etc.):

```bash
SCREENSHOT_BASE_URL=https://your-deploy-url.com node portfolio-assets/capture-screenshots.mjs
```

## Requirements

- Node.js 18+
- Playwright Chromium (installed automatically on first run)
- Local server running on port 3456 (or custom URL)

See [SCREENSHOT-GUIDE.md](./SCREENSHOT-GUIDE.md) for manual capture tips and best practices.
