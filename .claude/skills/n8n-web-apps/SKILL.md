---
name: n8n-web-apps
description: Build web applications that integrate with n8n workflows. Use when creating apps that send data to n8n, receive responses, or need bidirectional communication between a web frontend and n8n backend.
---

# Building Web-to-n8n-to-Web Applications

## Architecture Decision: n8n vs Direct API Routes

**Use n8n when:**
- Orchestrating multiple external services (APIs, databases, notifications)
- Building visual, maintainable workflows for non-developers
- Need built-in retry, error handling across services
- Workflows change frequently and need easy editing
- Integrating with 400+ n8n nodes (Slack, email, databases, etc.)

**Use Direct API Routes when:**
- Simple request/response patterns
- Need reliable, predictable behavior
- Performance is critical (n8n adds latency)
- Complex database queries with operators that don't survive JSON (like pgvector's `<=>`)
- Webhook registration issues are blocking progress

**Hybrid Approach (Recommended):**
- Use Next.js API routes for user-facing interactions (chat, forms)
- Use n8n for background tasks (notifications, scheduled jobs, external integrations)
- Connect them via n8n's HTTP Request node or webhooks

---

## Local Development Setup

### Docker Compose (Recommended)

Use Docker Compose with **named volumes** - this is the reliable way to run n8n locally.

**Create `docker-compose.yml`:**

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

**Commands:**
```bash
# Start n8n (runs in background)
docker compose up -d

# Stop n8n
docker compose down

# View logs
docker compose logs -f n8n

# Restart n8n
docker compose restart
```

**Why this works:**
- **Named volumes** (`n8n_data:`) are managed by Docker, not filesystem paths
- **WEBHOOK_URL** tells n8n what URL to register for webhooks (critical!)
- **restart: unless-stopped** auto-restarts after reboot
- Data persists between restarts

### Common Setup Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Missing `WEBHOOK_URL` | Webhooks return 404 | Add `WEBHOOK_URL=http://localhost:5678/` |
| Using bind mounts on Windows | Data gets lost | Use named volumes instead |
| Using `docker run` | Easy to typo, no persistence | Use docker-compose.yml |
| Forgetting to activate workflow | Production webhooks fail | Toggle workflow to active |

### External Webhook Access

When external services (GitHub, Stripe, etc.) need to reach your local n8n:

**Option A: Built-in Tunnel (Simplest)**
```bash
# n8n has a built-in tunnel for testing
docker exec -it n8n n8n start --tunnel
```
This gives you a temporary public URL. Good for quick testing, not production.

**Option B: ngrok (More Reliable)**
```bash
# Install ngrok, then:
ngrok http 5678

# Update docker-compose.yml with ngrok URL:
environment:
  - WEBHOOK_URL=https://abc123.ngrok.io/
```

**Option C: Cloudflare Tunnel (Free, Permanent URL)**
Best for ongoing development. Set up once, get a permanent subdomain.

---

## n8n Webhook Patterns

### Webhook Types

| Type | URL Pattern | When It Works |
|------|-------------|---------------|
| **Production** | `/webhook/your-path` | Workflow is ACTIVE |
| **Test** | `/webhook-test/your-path` | Workflow is OPEN in editor |

**Important:** Test webhooks timeout after 120 seconds of inactivity.

### Common Webhook Issues

**Issue: "Webhook not registered" (404)**

Most common cause: **Missing WEBHOOK_URL environment variable**

```yaml
# In docker-compose.yml, ensure you have:
environment:
  - WEBHOOK_URL=http://localhost:5678/
```

Other fixes:
1. Toggle workflow inactive → active
2. Check webhook path matches exactly (case-sensitive)
3. `docker compose restart`

**Issue: Empty response body (200 but no data)**

Cause: Missing "Respond to Webhook" node

Fix: Every workflow path must end with a "Respond to Webhook" node.

**Issue: External services can't reach webhook**

Your localhost isn't accessible from the internet. Use tunnel (see above).

### Database Strategy

Keep n8n's database separate from your app's database:

```
Your App Database (Postgres/Neon)     n8n Internal Database (SQLite)
├── users                              ├── workflows
├── knowledge                          ├── credentials
├── chat_history                       └── executions
└── your_data
```

- n8n stores its own workflows/credentials internally
- Your app stores your business data
- They don't need to share a database

---

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  (React components, forms, chat UI)                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Next.js API Routes                      │
│  /api/chat, /api/upload, /api/knowledge                 │
│  (Validation, auth, direct DB/API calls)                │
└─────────────────────────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
┌───────────────────────┐   ┌───────────────────────┐
│   Direct Services     │   │      n8n Workflows     │
│  - Database queries   │   │  - Email notifications │
│  - LLM API calls      │   │  - Slack alerts        │
│  - Embeddings         │   │  - Scheduled tasks     │
│  - Fast operations    │   │  - Multi-step flows    │
└───────────────────────┘   └───────────────────────┘
```

---

## Code Patterns

### Next.js API Route (Reliable Pattern)

```typescript
// app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.requiredField) {
      return NextResponse.json(
        { success: false, error: 'Missing required field' },
        { status: 400 }
      );
    }

    // Your logic here
    const result = await processData(body);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Calling n8n from API Route (When Needed)

```typescript
// Trigger n8n workflow from API route
const n8nResponse = await fetch('http://localhost:5678/webhook/your-workflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: yourData })
});

if (!n8nResponse.ok) {
  // Fallback to direct implementation
  return await directImplementation(yourData);
}
```

### Frontend Fetch Pattern

```typescript
// Always use local API routes, not n8n directly
const response = await fetch('/api/your-endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

const result = await response.json();

if (!result.success) {
  // Handle error with user feedback
  setError(result.error);
  return;
}

// Handle success
setData(result.data);
```

---

## n8n Workflow Structure

Every n8n workflow should follow this pattern:

```
1. Webhook Trigger (or other trigger)
   │
   ▼
2. Input Validation (Function node)
   - Check required fields
   - Validate types
   - Return early with error if invalid
   │
   ▼
3. Main Logic (wrapped in Error Trigger if complex)
   - Your business logic
   - External API calls
   - Database operations
   │
   ▼
4. Response Formatter (Function node)
   - Standardize output format
   - Add metadata (timestamp, requestId)
   │
   ▼
5. Respond to Webhook
   - ALWAYS include this node
   - Set response body explicitly
```

### Function Node: Input Validation

```javascript
const input = $input.first().json;

if (!input.message || typeof input.message !== 'string') {
  return {
    json: {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Message is required and must be a string'
      }
    }
  };
}

// Pass through valid data
return { json: { ...input, validated: true } };
```

### Function Node: Response Formatter

```javascript
const data = $input.first().json;

return {
  json: {
    success: true,
    data: data,
    timestamp: new Date().toISOString(),
    requestId: $execution.id
  }
};
```

---

## Database Integration (pgvector Example)

**Known Issue:** The `<=>` operator for vector similarity gets stripped when importing n8n workflow JSON.

**Solution:** Use direct API routes for vector operations:

```typescript
// In your API route
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Vector similarity search
const result = await pool.query(`
  SELECT content, 1 - (embedding <=> $1::vector) as similarity
  FROM knowledge
  ORDER BY embedding <=> $1::vector
  LIMIT 5
`, [embeddingVector]);
```

---

## Environment Variables

```bash
# .env.local
N8N_WEBHOOK_URL=http://localhost:5678
N8N_API_KEY=your-api-key

# Database
DATABASE_URL=postgresql://user:pass@host/db

# External APIs
COHERE_API_KEY=your-key
GROQ_API_KEY=your-key
OPENAI_API_KEY=your-key

# App config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Debugging Checklist

When things don't work:

1. **Check n8n is running:** `docker ps | grep n8n`
2. **Check workflow is active:** Look for green toggle in n8n UI
3. **Test webhook directly:** `curl -X POST http://localhost:5678/webhook/your-path -H "Content-Type: application/json" -d '{"test":true}'`
4. **Check n8n execution logs:** Open workflow → Executions tab
5. **Check browser console:** Network tab for request/response
6. **Check Next.js terminal:** Server-side errors appear here

---

## Quick Start Template

When building a new n8n-integrated app:

1. **Start with direct API routes** - Get core functionality working
2. **Add n8n for extras** - Notifications, background tasks, integrations
3. **Use hybrid architecture** - Best of both worlds
4. **Always have fallbacks** - If n8n fails, degrade gracefully

```bash
# Project structure
src/
├── app/
│   ├── api/           # Direct API routes (primary)
│   │   ├── chat/
│   │   ├── upload/
│   │   └── webhook/   # Receive n8n callbacks
│   └── page.tsx       # Frontend
├── lib/
│   ├── n8n.ts         # n8n client helper
│   └── db.ts          # Database client
workflows/
└── *.json             # n8n workflow exports
```
