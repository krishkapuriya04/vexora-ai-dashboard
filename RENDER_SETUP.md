# Render Deployment Setup

Deploy VEXORA as a **single Web Service** (Express serves the API and static frontend). Render does **not** deploy automatically unless you connect the repo and trigger a deploy yourself.

## Prerequisites

- GitHub repository pushed (`krishkapuriya04/vexora-ai-dashboard`)
- MongoDB Atlas cluster ([ATLAS_SETUP.md](./ATLAS_SETUP.md))
- Razorpay and Gemini API keys (for billing and AI)

---

## Option A: Blueprint (`render.yaml`)

1. Log in to [Render](https://render.com)
2. **New → Blueprint**
3. Connect the VEXORA repository
4. Render reads `render.yaml` and creates the `vexora` web service
5. Set **secret** environment variables in the dashboard (marked `sync: false` in the blueprint):
   - `MONGODB_URI`
   - `CORS_ORIGIN` (if using split frontend)
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - `GEMINI_API_KEY`
6. **Manual deploy** — click **Deploy** when ready

---

## Option B: Manual Web Service

1. **New → Web Service** → connect repo
2. Settings:

| Field | Value |
|-------|--------|
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/api/health/ready` |

3. Environment variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<generate-32+-char-secret>
CORS_ORIGIN=https://your-app.onrender.com
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash
```

Render injects `PORT` and `RENDER_EXTERNAL_URL` automatically.

4. Deploy manually from the Render dashboard.

---

## After deploy

1. Note the service URL: `https://vexora-xxxx.onrender.com`
2. Verify health: `https://vexora-xxxx.onrender.com/api/health/ready`
3. Open the app: `https://vexora-xxxx.onrender.com/pages/login.html`
4. Run remote verification:

```bash
API_BASE=https://vexora-xxxx.onrender.com npm run verify:deploy
```

---

## Split frontend (GitHub Pages) + Render API

1. Deploy backend on Render (steps above)
2. In `js/api-config.js` on the branch GitHub Pages builds:

```javascript
window.VEXORA_API_BASE = 'https://vexora-xxxx.onrender.com';
```

3. Set Render `CORS_ORIGIN` to your GitHub Pages URL:

```env
CORS_ORIGIN=https://krishkapuriya04.github.io
```

4. Redeploy Render after changing CORS.

---

## Free tier notes

- Service spins down after inactivity; first request may be slow (cold start)
- Use `/api/health/ready` as the health check so Render waits for MongoDB
- Atlas free tier: allow `0.0.0.0/0` or Render egress IPs in Network Access

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails | Check `npm install` logs; Node 18+ on Render |
| Health check fails | Verify `MONGODB_URI`; Atlas IP allowlist |
| CORS errors in browser | Add exact frontend origin to `CORS_ORIGIN` |
| 401 on API | Check `JWT_SECRET` unchanged between deploys |
| Billing/AI errors | Set Razorpay/Gemini keys; do not use `*_MOCK` in production |
