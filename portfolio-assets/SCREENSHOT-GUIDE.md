# VEXORA Screenshot Capture Guide

Professional guidance for capturing portfolio-grade showcase screenshots of VEXORA.

---

## Before You Capture

### 1. Use populated UI states

VEXORA ships with realistic mock business data. Avoid empty states when capturing:

| Page | Ensure visible |
|------|----------------|
| **Landing** | Wait for loader to finish (~2s); hero stats should animate |
| **Dashboard** | All 6 KPI cards, revenue chart, timeline, AI feed |
| **Analytics** | Heatmap, traffic chart, stat cards |
| **AI Insights** | 6 insight cards, risk rings, forecast chart |
| **Reports** | "All Reports" filter active; 6 report cards visible |
| **Settings** | Profile panel selected (default) |

### 2. Browser setup

| Setting | Recommended value |
|---------|-------------------|
| Theme | Dark (default) |
| Viewport | 1440 × 900 (MacBook Pro 14") |
| Device scale | 2× (Retina) |
| Browser | Chrome or Edge |
| Zoom | 100% |

### 3. Hide dev artifacts

- Close DevTools
- Disable browser extensions that inject UI
- Use incognito/private window for clean captures

---

## Automated Capture (Recommended)

```bash
# Install Playwright browsers (first time only)
npx playwright install chromium

# Start local server
npx serve . -p 3456

# Capture all pages
node portfolio-assets/capture-screenshots.mjs
```

Output locations:

- `portfolio-assets/screenshots/*.png` — Primary exports
- `portfolio-assets/screenshots/full/` — Full @2x resolution
- `portfolio-assets/screenshots/thumb/` — Above-the-fold crops

---

## Manual Capture (Chrome DevTools)

1. Open page (e.g. `http://localhost:3456/pages/dashboard.html`)
2. Wait 2–3 seconds for skeleton loader and charts
3. Press `F12` → Toggle device toolbar (`Ctrl+Shift+M`)
4. Set dimensions: **1440 × 900**
5. Set DPR: **2**
6. `Ctrl+Shift+P` → type **"Capture full size screenshot"** or **"Capture screenshot"**

### Per-page tips

**Landing Page**
- Capture full-page for README hero
- Scroll to demo section for secondary shot
- URL: `/`

**Dashboard**
- Capture viewport (not full page) — KPI row + top charts
- Sidebar should be expanded
- URL: `/pages/dashboard.html`

**Analytics**
- Scroll slightly to include heatmap
- URL: `/pages/analytics.html`

**AI Insights**
- Full-page capture shows entire feed + sidebar charts
- URL: `/pages/insights.html`

**Reports**
- Ensure "All Reports" filter is active
- URL: `/pages/reports.html`

**Settings**
- Profile tab should be active
- URL: `/pages/settings.html`

---

## Post-Processing (Optional)

For extra polish before publishing:

| Tool | Use for |
|------|---------|
| [Squoosh](https://squoosh.app) | PNG compression without quality loss |
| Figma | Add device frame (MacBook mockup) |
| Linear / Stripe style | Subtle drop shadow on framed screenshot |

Recommended export sizes:

| Use case | Size |
|----------|------|
| GitHub README | 1200–1400px wide |
| Portfolio hero | 1920px wide |
| LinkedIn post | 1200 × 627 (crop thumb/) |
| Twitter/X | 1600 × 900 |

---

## Deployed Site Capture

After deploying to GitHub Pages or Vercel:

```bash
SCREENSHOT_BASE_URL=https://krishkapuriya04.github.io/vexora-ai-dashboard \
  node portfolio-assets/capture-screenshots.mjs
```

Replace with your actual deployment URL.

---

## File Naming Convention

```
{page-id}.png           → Primary export
full/{page-id}.png      → Full @2x capture
thumb/{page-id}.png     → Above-the-fold crop
```

Page IDs: `landing-page`, `dashboard`, `analytics`, `ai-insights`, `reports`, `settings`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank charts | Wait longer (3s); ensure Chart.js CDN loaded |
| Skeleton visible | Wait for `.page-content.is-loaded` class |
| Sidebar collapsed | Run capture script (auto-expands) or click collapse button |
| Light theme | Reset: `localStorage.removeItem('vexora-theme')` |
| Empty notifications | Don't click "Mark all read" before capture |

---

## Checklist Before Publishing

- [ ] All 6 screenshots captured at 1440×900 @2x
- [ ] Dark theme consistent across all shots
- [ ] No empty states or loading skeletons visible
- [ ] Charts fully rendered with data
- [ ] Sidebar expanded on app pages
- [ ] No personal browser UI in frame
- [ ] Files saved to `portfolio-assets/screenshots/`
