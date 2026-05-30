# Deploying VEXORA to GitHub Pages

Host VEXORA directly from this repository with **zero build step**. The site is static HTML, CSS, and JavaScript — GitHub Pages serves the repo root as-is.

**Live URL (after enabling Pages):**  
https://krishkapuriya04.github.io/vexora-ai-dashboard/

---

## Quick Deploy (2 minutes)

### Step 1 — Enable GitHub Pages

1. Open your repository on GitHub  
2. Go to **Settings → Pages**  
3. Under **Build and deployment → Source**, select **Deploy from a branch**  
4. Set **Branch** to `main` and **Folder** to `/ (root)`  
5. Click **Save**

GitHub will publish within 1–3 minutes.

### Step 2 — Verify deployment

Visit:

| Page | URL |
|------|-----|
| Landing | https://krishkapuriya04.github.io/vexora-ai-dashboard/ |
| Dashboard | https://krishkapuriya04.github.io/vexora-ai-dashboard/pages/dashboard.html |
| Analytics | https://krishkapuriya04.github.io/vexora-ai-dashboard/pages/analytics.html |
| AI Insights | https://krishkapuriya04.github.io/vexora-ai-dashboard/pages/insights.html |
| Reports | https://krishkapuriya04.github.io/vexora-ai-dashboard/pages/reports.html |
| Settings | https://krishkapuriya04.github.io/vexora-ai-dashboard/pages/settings.html |

---

## Enable via GitHub CLI

```bash
gh api repos/krishkapuriya04/vexora-ai-dashboard/pages \
  -X POST \
  -f build_type=legacy \
  -f source[branch]=main \
  -f source[path]=/
```

Check status:

```bash
gh api repos/krishkapuriya04/vexora-ai-dashboard/pages
```

---

## Why It Works Without Modifications

VEXORA is configured for GitHub Pages project-site deployment out of the box:

| Requirement | How VEXORA satisfies it |
|-------------|-------------------------|
| **Relative paths only** | All CSS, JS, images use `css/`, `../css/`, `pages/` — no `/absolute` paths |
| **No build step** | No bundler; files served directly |
| **ES modules** | GitHub Pages serves `.js` with correct MIME type |
| **Jekyll disabled** | `.nojekyll` prevents Jekyll from ignoring `_` folders |
| **404 handling** | `404.html` at repo root with auto-detect home link |
| **Entry point** | `index.html` at repository root |

---

## Pre-Deploy Verification

Run locally before pushing:

```bash
# Path compatibility audit (no server required)
node scripts/verify-paths.mjs

# Full QA with local server
npx serve . -p 3456
node scripts/verify.mjs
```

Both scripts must pass before deploying.

---

## Project Structure on GitHub Pages

```
https://krishkapuriya04.github.io/vexora-ai-dashboard/
├── index.html              ← Landing page (site entry)
├── 404.html                ← Custom not-found page
├── .nojekyll                 ← Disables Jekyll processing
├── css/                      ← Stylesheets
├── js/                       ← JavaScript modules
├── assets/                   ← Icons, images
├── pages/                    ← Dashboard application
│   ├── dashboard.html
│   ├── analytics.html
│   ├── insights.html
│   ├── reports.html
│   └── settings.html
└── portfolio-assets/         ← Screenshots (optional browsing)
```

---

## What Gets Deployed

GitHub Pages publishes all tracked files in the repository root. These are **not** deployed (gitignored):

- `node_modules/` — dev dependency for screenshot tooling only
- `.env` files — none used

These **are** deployed and safe:

- All HTML, CSS, JS, SVG, PNG assets
- `portfolio-assets/screenshots/` — portfolio images
- `package.json` — harmless static file

---

## Custom Domain (Optional)

1. Add a `CNAME` file to the repo root with your domain:

   ```
   vexora.yourdomain.com
   ```

2. Configure DNS with your provider (A records or CNAME to GitHub Pages)

3. Enable **Enforce HTTPS** in repository Pages settings

See [GitHub Pages custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **404 on all pages** | Confirm Pages source is `main` branch, `/ (root)` folder |
| **CSS/JS not loading** | Check browser Network tab — paths must be relative, not `/css/...` |
| **Blank charts** | Chart.js loads from CDN — ensure network access; no ad-blocker blocking jsdelivr |
| **Modules fail (CORS)** | Always access via `https://`, not `file://` |
| **Old version cached** | Hard refresh (`Ctrl+Shift+R`) or wait for CDN cache |
| **404 page wrong home link** | `404.html` auto-detects GitHub Pages repo path |

---

## CI Verification

On every push to `main`, GitHub Actions runs:

- `node scripts/verify-paths.mjs` — path audit
- Validates all HTML pages and JS imports exist

See `.github/workflows/verify.yml`.

---

## Updating the Live Site

1. Push changes to the `main` branch  
2. GitHub Pages redeploys automatically (1–3 min)  
3. No manual build or upload required

```bash
git add .
git commit -m "your changes"
git push origin main
```

---

## Local vs Production URLs

| Environment | Base URL |
|-------------|----------|
| Local (`npx serve .`) | `http://localhost:3000/` |
| GitHub Pages | `https://krishkapuriya04.github.io/vexora-ai-dashboard/` |

All internal links use **relative paths**, so the same files work in both environments without changes.
