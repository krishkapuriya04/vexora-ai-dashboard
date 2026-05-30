# VEXORA Deployment Checklist

Use this before and after production deployment. **Do not deploy automatically** — complete each section manually.

---

## Pre-deploy — codebase

- [ ] Latest `main` pushed to GitHub
- [ ] `npm install` succeeds locally
- [ ] `npm start` works with local or Atlas MongoDB
- [ ] `npm run verify:deploy` passes against local API
- [ ] `.env` not committed (only `.env.example`)

---

## MongoDB Atlas

- [ ] Cluster created ([ATLAS_SETUP.md](./ATLAS_SETUP.md))
- [ ] Database user + password created
- [ ] Network access configured for Render
- [ ] `MONGODB_URI` copied and stored securely

---

## Render (or host)

- [ ] Web service created from repo ([RENDER_SETUP.md](./RENDER_SETUP.md))
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI` set
- [ ] `JWT_SECRET` set (32+ random characters, not default)
- [ ] `CORS_ORIGIN` set if frontend is on another domain
- [ ] `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` set (live or test)
- [ ] `GEMINI_API_KEY` set
- [ ] Health check path: `/api/health/ready`
- [ ] Manual deploy triggered

---

## Frontend API URL

**Unified deploy (same Render URL):**

- [ ] No `VEXORA_API_BASE` override needed
- [ ] App opened at `https://<service>.onrender.com/pages/login.html`

**Split deploy (GitHub Pages + Render API):**

- [ ] `js/api-config.js` sets `window.VEXORA_API_BASE = 'https://<api>.onrender.com'`
- [ ] `CORS_ORIGIN` on Render includes GitHub Pages origin
- [ ] GitHub Pages branch rebuilt after api-config change

---

## Post-deploy verification

Run:

```bash
API_BASE=https://your-app.onrender.com npm run verify:deploy
```

Manual browser checks:

### Authentication

- [ ] Register new account
- [ ] Login / logout
- [ ] Session persists on dashboard refresh
- [ ] Profile loads in Settings

### Dashboard & data

- [ ] KPI cards load
- [ ] Charts render
- [ ] Activities and notifications load
- [ ] Date range / export buttons respond

### Reports

- [ ] Report library loads
- [ ] Create / edit / delete report
- [ ] PDF export downloads

### Billing

- [ ] Plans display
- [ ] Checkout opens (Razorpay test/live)
- [ ] Subscription status updates after test payment
- [ ] Billing history shows payments

### AI Insights

- [ ] Generate executive summary
- [ ] Copy response works
- [ ] History sidebar populates

### Admin (Admin user)

- [ ] Admin page accessible
- [ ] Edit user / change role
- [ ] Organization view / create / disable

### Health

- [ ] `GET /api/health/ready` → `"database": "connected"`
- [ ] No CORS errors in browser console

---

## Security final review

- [ ] `JWT_SECRET` is unique and not the dev default
- [ ] Atlas user has least privilege appropriate for the app
- [ ] `RAZORPAY_MOCK` and `GEMINI_MOCK` are **not** `true` in production
- [ ] HTTPS only for production URLs

---

## Rollback

- [ ] Previous Render deploy available in dashboard
- [ ] Atlas backups / point-in-time recovery understood (paid tiers)

---

**Docs:** [DEPLOYMENT-PRODUCTION.md](./DEPLOYMENT-PRODUCTION.md) · [RENDER_SETUP.md](./RENDER_SETUP.md) · [ATLAS_SETUP.md](./ATLAS_SETUP.md)
