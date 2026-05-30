# VEXORA Production Deployment Guide

This document describes how to deploy VEXORA for production. **Deployment is manual** — follow the steps below; nothing deploys automatically from this repository.

## Architecture options

| Model | Frontend | Backend | API URL config |
|-------|----------|---------|----------------|
| **Unified (recommended)** | Express static + API on Render | Same service | Auto same-origin — no `VEXORA_API_BASE` needed |
| **Split** | GitHub Pages / Netlify | Render / VPS | **Required:** `window.VEXORA_API_BASE` in `js/api-config.js` |

---

## API URL resolution (frontend)

All browser API calls go through **`getApiBase()`** in `js/auth-client.js`. Resolution order:

1. **`window.VEXORA_API_BASE`** — set in `js/api-config.js` or inline before that script loads
2. **`<meta name="vexora-api-base" content="https://api.example.com">`** in HTML `<head>`
3. **Auto-detect**
   - `localhost` / LAN → `http://<host>:5000` (development)
   - Same host as the page (unified Render deploy)
   - Static hosts (`github.io`, `netlify.app`, etc.) → **must** set option 1 or 2

### API URL audit (all client usage)

| File | Mechanism | Notes |
|------|-----------|--------|
| `js/auth-client.js` | `getApiBase()` + `fetch` | Auth, profile, health |
| `js/api-client.js` | `getApiBase()` via `auth-client` | Dashboard, reports, billing, AI, admin |
| `js/api-config.js` | Sets `window.VEXORA_API_BASE` / reads meta | Load **before** module scripts |
| `js/api-config.production.example.js` | Example production override | Copy pattern for static frontend |
| `scripts/*.mjs` | `process.env.API_BASE` | Server-side QA only (not browser) |

**No hardcoded production URLs** exist in application JS. Test/audit scripts default to `http://localhost:5000`.

---

## Environment variables (backend)

Copy `.env.example` → `.env` locally. In production (Render), set variables in the dashboard.

| Variable | Required (prod) | Description |
|----------|-----------------|-------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto on Render | HTTP port (default `5000`) |
| `HOST` | No | Bind address (default `0.0.0.0`) |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Strong random secret (≥32 chars) |
| `CORS_ORIGIN` | Split deploy | Comma-separated allowed frontend origins |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Billing | Live or test keys |
| `GEMINI_API_KEY` | AI | Google AI Studio key |
| `VEXORA_PUBLIC_URL` | Optional | Public app URL (Render sets `RENDER_EXTERNAL_URL`) |

Startup runs **`validateEnv()`** — production exits if `JWT_SECRET` or `MONGODB_URI` is missing/invalid.

---

## Health checks

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Legacy liveness (JSON OK) |
| `GET /api/health/ready` | **Readiness** — includes MongoDB connection (use for Render) |
| `GET /api/health/live` | Simple `OK` text for probes |

Frontend login/signup calls `/api/health/ready` via `checkApiHealth()`.

---

## CORS

Configured in `server/config/cors.js` from `CORS_ORIGIN`:

- **Development:** `localhost` and private LAN origins allowed automatically
- **Production:** Only listed origins (comma-separated)
- `CORS_ORIGIN=*` allows all origins (not recommended for production)

Example for GitHub Pages + Render:

```env
CORS_ORIGIN=https://krishkapuriya04.github.io,https://your-app.onrender.com
```

---

## Local development

```bash
cp .env.example .env
# Start MongoDB locally or use Atlas URI in .env
npm install
npm start
```

Open **http://localhost:5000** (not GitHub Pages) so API auto-targets port `5000`.

Optional static-only frontend on another port:

```bash
npm run serve   # port 3456
```

Set in `js/api-config.js`:

```javascript
window.VEXORA_API_BASE = 'http://localhost:5000';
```

---

## Production verification

After deploy:

```bash
API_BASE=https://your-app.onrender.com npm run verify:deploy
```

Full E2E (requires Playwright + running server):

```bash
API_BASE=https://your-app.onrender.com APP_BASE=https://your-app.onrender.com npm run audit:e2e
```

---

## Feature checklist (deployed backend)

| Feature | Verify |
|---------|--------|
| Authentication | Register, login, profile, logout |
| Dashboard | KPIs, activities, notifications |
| Reports | CRUD + PDF/CSV/Excel export |
| Billing | Plans, Razorpay order + verify |
| AI | Generate summary/forecast/risk + history |
| Admin | Users, orgs, audit logs (Admin role) |

See **DEPLOYMENT-CHECKLIST.md** for a printable pre/post deploy list.

---

## Related docs

- [RENDER_SETUP.md](./RENDER_SETUP.md) — Deploy API + static app on Render
- [ATLAS_SETUP.md](./ATLAS_SETUP.md) — MongoDB Atlas cluster
- [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) — Step-by-step checklist
