# MongoDB Atlas Setup

VEXORA uses MongoDB via Mongoose. Production should use **MongoDB Atlas**; local development can use a local `mongod` or Atlas.

---

## 1. Create a cluster

1. Sign in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create** → **M0 Free** (or paid tier for production traffic)
3. Choose a cloud region close to your Render region (e.g. `us-east-1` with Oregon Render)
4. Name the cluster (e.g. `vexora-prod`)

---

## 2. Database user

1. **Database Access** → **Add New Database User**
2. Authentication: **Password**
3. Username: `vexora_app` (example)
4. Password: generate a strong password
5. Privileges: **Read and write to any database** (or scoped to `vexora`)

---

## 3. Network access

For Render (dynamic IPs):

1. **Network Access** → **Add IP Address**
2. **Allow Access from Anywhere** (`0.0.0.0/0`) — acceptable for Atlas with strong credentials; tighten with VPC/peering for enterprise

For local development only:

- Add your current IP or `127.0.0.1` if using Atlas from localhost

---

## 4. Connection string

1. **Database** → **Connect** → **Drivers**
2. Copy the connection string:

```
mongodb+srv://vexora_app:<password>@cluster0.xxxxx.mongodb.net/vexora?retryWrites=true&w=majority
```

3. Replace `<password>` with the URL-encoded password
4. Database name `vexora` is set in the path (creates on first write)

---

## 5. Configure VEXORA

**Local `.env`:**

```env
MONGODB_URI=mongodb+srv://vexora_app:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/vexora?retryWrites=true&w=majority
```

**Render:**

- Set `MONGODB_URI` in the service **Environment** tab
- Redeploy after changing the URI

---

## 6. Verify connection

```bash
npm start
```

Expected log:

```
[vexora] MongoDB connected: vexora
```

Health check:

```bash
curl http://localhost:5000/api/health/ready
```

Should return `"database": "connected"`.

---

## 7. Optional: seed data

```bash
npm run seed
```

Only run on empty/non-production databases unless you intend to reset demo data.

---

## Atlas + Render checklist

- [ ] Cluster created and running
- [ ] DB user created with password stored securely
- [ ] Network access allows Render (or `0.0.0.0/0`)
- [ ] `MONGODB_URI` set in Render environment
- [ ] `/api/health/ready` returns `connected` after deploy

See [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) for the full production checklist.
