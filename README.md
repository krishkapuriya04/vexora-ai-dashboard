# VEXORA

**AI-Powered Business Intelligence & Analytics Platform**

VEXORA helps businesses monitor KPIs, visualize analytics, explore AI-generated insights, and make data-driven decisions — all from a premium, enterprise-grade dashboard experience.

## Tech Stack

- HTML5 (semantic, SEO-friendly)
- CSS3 (custom properties, glassmorphism, responsive)
- Vanilla JavaScript (ES modules)
- Chart.js (data visualization)

No backend. No database. Realistic mock data for demonstration.

## Project Structure

```
vexora/
├── index.html              # Landing page
├── pages/
│   ├── dashboard.html      # Main KPI dashboard
│   ├── analytics.html      # Advanced analytics
│   ├── insights.html       # AI insights explorer
│   └── reports.html        # Reports library
├── assets/
│   ├── images/             # Product imagery
│   └── icons/              # SVG icons & favicons
├── css/
│   ├── variables.css       # Design tokens
│   ├── global.css          # Reset, typography, utilities
│   ├── animations.css      # Keyframes & motion
│   ├── landing.css         # Landing page sections
│   ├── app.css             # Dashboard shell & layout
│   └── pages.css           # Page-specific components
├── js/
│   ├── app.js              # Landing page entry point
│   ├── dashboard-app.js    # App pages bootstrap
│   ├── shell.js            # Sidebar, topbar, modals
│   ├── mock-data.js        # Centralized mock data
│   ├── chart-utils.js      # Shared Chart.js config
│   ├── theme.js            # Theme management
│   ├── animations.js       # Scroll reveals & counters
│   └── pages/              # Page-specific chart init
│       ├── dashboard.js
│       ├── analytics.js
│       ├── insights.js
│       └── reports.js
└── components/
    └── ui-components.js    # Reusable UI factories
```

## Getting Started

Open `index.html` in a browser, or serve locally:

```bash
npx serve .
```

## Design System

| Token | Value |
|-------|-------|
| Primary | `#6C63FF` |
| Secondary | `#8B5CF6` |
| Accent | `#00E5FF` |
| Background | `#0B1020` |
| Card | `#131A2E` |
| Text | `#F8FAFC` |

Fonts: **Inter** (body), **Plus Jakarta Sans** (headings)

## Phase 1 — Complete

- [x] Project architecture & folder structure
- [x] Design system (CSS custom properties)
- [x] Premium landing page with all sections
- [x] Chart.js analytics previews
- [x] Scroll animations & loading screen
- [x] Mobile-responsive navigation

## Phase 2 — Complete

- [x] Dashboard, Analytics, AI Insights, Reports, Settings pages
- [x] Sidebar + topbar + command search + notifications + profile menu
- [x] Theme switcher, video demo, skeleton loaders, aurora effects
- [x] Activity timeline, geography analytics, AI recommendation feed
- [x] Premium UI upgrade layer (`css/upgrade.css`)
- [x] Favicon, Unsplash visuals, automated QA script

## Quality Assurance

Run automated verification:

```bash
npx serve . -p 3456
node scripts/verify.mjs
```

## Next Steps (Phase 3)

- [ ] Client-side SPA routing
- [ ] PWA support & offline caching
- [ ] Open Graph social preview image

## License

MIT License — see [LICENSE](LICENSE) for details.
