# VEXORA Interactive UI Audit Report

Generated: 2026-05-30T14:04:37.604Z

## Summary

| Metric | Count |
|--------|-------|
| Total interactive elements (approx.) | 70 |
| Pages with wired JS handlers | 10/10 |
| Fixed in this audit | 6 areas |
| Newly connected APIs | 4 |
| Intentional placeholders | 4 |

## Fixed

- Settings: profile/workspace/notifications/appearance save + API persistence
- Reports: Create/Edit/Delete/Preview + API CRUD
- Dashboard: date range toggle + PDF export
- Shell: notification mark-read + profile/billing links
- Admin: org details modal + create org form
- Landing: preview tabs + Watch Demo video

## Newly Connected

- PATCH /api/auth/profile
- PATCH /api/auth/organization
- Reports CRUD UI
- Settings preferences persistence

## Remaining Placeholders (professional feedback)

- Avatar upload (coming soon toast)
- 2FA enable (coming soon toast)
- Password change (coming soon toast)
- Integration OAuth (local toggle state)

## Per Page

| Page | Buttons (approx.) | Status |
|------|-------------------|--------|
| index.html | 13 | wired |
| pages/dashboard.html | 3 | wired |
| pages/analytics.html | 0 | wired |
| pages/insights.html | 6 | wired |
| pages/reports.html | 15 | wired |
| pages/billing.html | 2 | wired |
| pages/settings.html | 15 | wired |
| pages/admin.html | 14 | wired |
| pages/login.html | 1 | wired |
| pages/signup.html | 1 | wired |
