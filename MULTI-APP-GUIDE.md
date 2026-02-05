# Multi-App Management Guide

Quick reference for creating and managing multiple apps from the MIXXN Claude template.

---

## Folder Structure

```
c:\Users\Rob\Documents\
├── MIXXN Claude\        ← Template (don't modify)
├── client_app_01\       ← Client 1
├── client_app_02\       ← Client 2
└── client_app_03\       ← Client 3
```

---

## Create New App (5 steps)

### 1. Create repo from template
- Go to: https://github.com/contact-xlcreatives/MIXXN-Claude-n8n
- Click **"Use this template"** → **"Create new repository"**
- Name it (e.g., `client_app_02`)

### 2. Clone locally
```bash
cd "c:\Users\Rob\Documents"
git clone https://github.com/contact-xlcreatives/YOUR_APP_NAME.git
cd YOUR_APP_NAME
npm install
```

### 3. Generate API key
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output - this is your new API key.

### 4. Create .env.local
```bash
copy .env.local.example .env.local
```
Edit `.env.local` and set:
- `INTERNAL_API_KEY=your-generated-key`
- `NEXT_PUBLIC_API_KEY=your-generated-key` (same key)
- `N8N_WEBHOOK_URL=https://n8n-production-f598a.up.railway.app`

### 5. Deploy to Vercel
1. Go to https://vercel.com → **Add New Project**
2. Import your new repo from GitHub
3. Add environment variables:
   - `INTERNAL_API_KEY` = your key
   - `NEXT_PUBLIC_API_KEY` = your key
   - `N8N_WEBHOOK_URL` = https://n8n-production-f598a.up.railway.app
4. Click **Deploy**

### 6. Create Deploy Hook (for updates)
1. Vercel → Your Project → **Settings** → **Git**
2. Scroll to **Deploy Hooks**
3. Create hook: name=`deploy`, branch=`main`
4. **Save the URL** (bookmark it!)

---

## Update Workflow

```
1. Edit code locally
2. git add .
3. git commit -m "description"
4. git push
5. Visit your Deploy Hook URL to trigger deployment
```

---

## Key URLs

| Service | URL |
|---------|-----|
| Production n8n | https://n8n-production-f598a.up.railway.app |
| Template repo | https://github.com/contact-xlcreatives/MIXXN-Claude-n8n |
| Vercel dashboard | https://vercel.com/dashboard |

---

## App Registry

Track your apps here:

| App Name | GitHub Repo | Vercel URL | API Key (first 8 chars) | Deploy Hook |
|----------|-------------|------------|-------------------------|-------------|
| client_app_01 | client_app_01 | client-app-01.vercel.app | ccab885d... | [bookmark] |
| | | | | |
| | | | | |

---

## Local Development

```bash
# Start local dev server
cd "c:\Users\Rob\Documents\YOUR_APP"
npm run dev
# Opens at http://localhost:3000

# Start local n8n (if needed)
docker start n8n
# Opens at http://localhost:5678
```

---

## Troubleshooting

**Deploy Hook not working?**
- Make sure you're visiting the URL (not just copying it)
- Check Vercel → Deployments to see if it triggered

**Changes not showing after deploy?**
- Hard refresh: Ctrl+Shift+R
- Clear browser cache
- Check Vercel logs for build errors

**API errors on production?**
- Verify env vars are set in Vercel
- Make sure INTERNAL_API_KEY matches NEXT_PUBLIC_API_KEY
