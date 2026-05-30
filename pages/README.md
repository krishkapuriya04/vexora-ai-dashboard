# VEXORA Dashboard Pages

Production SaaS application pages for the VEXORA platform.

## Routes

| Page | File | Description |
|------|------|-------------|
| Dashboard | `dashboard.html` | KPI metrics, charts, product demo video |
| Analytics | `analytics.html` | Traffic, heatmap, engagement, geography |
| AI Insights | `insights.html` | AI recommendations, risk analysis, forecasting |
| Reports | `reports.html` | Report library, executive summaries, export |
| Settings | `settings.html` | Profile, workspace, security, integrations, billing |

## Shared Infrastructure

All pages share:

- **Shell** (`js/shell.js`) — Sidebar, topbar, search modal, notifications, profile menu
- **App bootstrap** (`js/dashboard-app.js`) — Theme, animations, ripple effects
- **Styles** (`css/app.css`, `css/pages.css`) — Layout, components, page-specific UI
- **Mock data** (`js/mock-data.js`) — Realistic business datasets
- **Chart utils** (`js/chart-utils.js`) — Shared Chart.js configuration

## Navigation

Open any page directly, or enter via the landing page:

```
../index.html → pages/dashboard.html
```

Command search (`⌘K`) provides quick navigation between all pages.

## Video Demo

Replace the demo video URL in `js/mock-data.js`:

```javascript
export const VIDEO_CONFIG = {
  videoUrl: 'https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1',
  ...
};
```
