# n8n Local Setup Guide

Step-by-step guide to set up n8n locally with Docker Compose.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Terminal/Command Prompt

---

## Step 1: Create docker-compose.yml

In your project root, create a file called `docker-compose.yml`:

```yaml
version: '3.8'

volumes:
  n8n_data:

services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - WEBHOOK_URL=http://localhost:5678/
      - N8N_SECURE_COOKIE=false
    volumes:
      - n8n_data:/home/node/.n8n
```

**What each line does:**
- `volumes: n8n_data:` - Creates a named volume for persistent storage
- `image:` - Uses the official n8n Docker image
- `restart: unless-stopped` - Auto-restarts n8n after reboot
- `ports:` - Maps port 5678 to localhost
- `WEBHOOK_URL` - **Critical!** Tells n8n what URL to use for webhooks
- `N8N_SECURE_COOKIE=false` - Allows HTTP (not HTTPS) for local dev
- `volumes:` - Stores n8n data in the named volume

---

## Step 2: Start n8n

```bash
docker compose up -d
```

This starts n8n in the background. Wait ~30 seconds for it to fully start.

---

## Step 3: Access n8n

Open your browser and go to:

```
http://localhost:5678
```

First time setup:
1. Create an account (email + password)
2. Choose a name for your n8n instance
3. Complete the onboarding

---

## Step 4: Create Your First Workflow

1. Click **"Add workflow"**
2. Click **"+"** to add a node
3. Search for **"Webhook"** and add it
4. Configure the webhook:
   - **HTTP Method:** POST
   - **Path:** `echo` (or any name you want)
5. Add another node: **"Respond to Webhook"**
6. Configure it to respond with: `{{ $json }}`
7. Connect the nodes: Webhook → Respond to Webhook
8. Click **"Save"**
9. Toggle the workflow to **Active** (top right)

---

## Step 5: Test the Webhook

Open terminal and run:

```bash
curl -X POST http://localhost:5678/webhook/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello n8n!"}'
```

You should see your message echoed back.

---

## Step 6: Connect to Your Next.js App

In your Next.js app, call the webhook:

```typescript
// app/api/test/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  // Call n8n webhook
  const n8nResponse = await fetch('http://localhost:5678/webhook/echo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result = await n8nResponse.json();
  return NextResponse.json(result);
}
```

---

## Common Commands

```bash
# Start n8n
docker compose up -d

# Stop n8n (keeps data)
docker compose down

# Restart n8n
docker compose restart

# View logs
docker compose logs -f n8n

# Check if running
docker compose ps
```

---

## Exposing to External Services

If you need GitHub, Stripe, or other services to reach your local n8n:

### Option A: Built-in Tunnel

```bash
docker exec -it n8n n8n start --tunnel
```

This gives you a temporary public URL like `https://abc123.hooks.n8n.cloud`.

### Option B: ngrok

1. Install ngrok: https://ngrok.com/download
2. Run: `ngrok http 5678`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Update docker-compose.yml:
   ```yaml
   environment:
     - WEBHOOK_URL=https://abc123.ngrok.io/
   ```
5. Restart: `docker compose restart`

---

## Backup Your Workflows

Always export workflows to version control:

1. In n8n, open your workflow
2. Click the menu (⋮) → **Download**
3. Save the JSON file to your project's `workflows/` folder
4. Commit to git

To restore:
1. In n8n, click **Import from file**
2. Select the JSON file
3. Activate the workflow

---

## Troubleshooting

### Webhooks return 404

1. Check `WEBHOOK_URL` is set in docker-compose.yml
2. Make sure workflow is **Active** (green toggle)
3. Try: `docker compose restart`

### Data lost after restart

You're probably using a bind mount instead of named volume. Check your docker-compose.yml uses:

```yaml
volumes:
  - n8n_data:/home/node/.n8n  # Named volume ✓
```

Not:

```yaml
volumes:
  - ./n8n-data:/home/node/.n8n  # Bind mount ✗
```

### Can't connect

1. Check Docker Desktop is running
2. Run `docker compose ps` - n8n should show "running"
3. Check port 5678 isn't used by something else

---

## Next Steps

- Read the [SKILL.md](SKILL.md) for architecture patterns
- See [troubleshooting.md](troubleshooting.md) for common issues
- Check [workflow-templates.md](workflow-templates.md) for example workflows
