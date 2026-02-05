# n8n Troubleshooting Quick Reference

## Quick Fixes

| Problem | Most Likely Cause | Quick Fix |
|---------|-------------------|-----------|
| Webhooks return 404 | Missing WEBHOOK_URL | Add `WEBHOOK_URL=http://localhost:5678/` to docker-compose |
| Data lost after restart | Using bind mount | Switch to named volume |
| Can't reach from external service | localhost not public | Use `--tunnel` or ngrok |
| Workflow shows active but 404 | Need to re-register webhook | Toggle workflow off/on |

---

## Docker Compose Commands

```bash
# Start n8n
docker compose up -d

# Stop n8n (keeps data)
docker compose down

# Restart n8n (fixes many issues)
docker compose restart

# View logs
docker compose logs -f n8n

# Check status
docker compose ps

# Full reset (loses data!)
docker compose down -v
docker compose up -d
```

---

## Webhook Issues

### "Webhook not registered" (404)

**Most common cause:** Missing `WEBHOOK_URL` environment variable.

```yaml
# docker-compose.yml - ensure this is set:
environment:
  - WEBHOOK_URL=http://localhost:5678/
```

**Other causes:**
1. Workflow not active - toggle the switch in n8n UI
2. Wrong path - check it's exactly `/webhook/your-path` (case-sensitive)
3. Using test URL with inactive workflow - test URLs only work when workflow is open in editor

### Empty Response (200 but no body)

**Cause:** Workflow doesn't have a "Respond to Webhook" node.

**Fix:** Add "Respond to Webhook" node at the end of every workflow path.

### External Service Can't Reach Webhook

**Cause:** `localhost:5678` isn't accessible from the internet.

**Fix options:**

```bash
# Option 1: Built-in tunnel
docker exec -it n8n n8n start --tunnel

# Option 2: ngrok
ngrok http 5678
# Then update WEBHOOK_URL in docker-compose.yml
```

---

## Data Persistence

### Named Volume (Correct)

```yaml
# docker-compose.yml
volumes:
  n8n_data:

services:
  n8n:
    volumes:
      - n8n_data:/home/node/.n8n  # Named volume - Docker manages it
```

### Bind Mount (Avoid on Windows)

```yaml
# This can cause issues on Windows:
volumes:
  - ./n8n-data:/home/node/.n8n  # Bind mount - filesystem path
```

### Check Your Volume

```bash
# List Docker volumes
docker volume ls

# Inspect n8n volume
docker volume inspect n8n_data
```

---

## Quick Tests

### Test Webhook with curl

```bash
curl -X POST http://localhost:5678/webhook/your-path \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'
```

### Test from Browser Console

```javascript
fetch('http://localhost:5678/webhook/your-path', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: true })
}).then(r => r.json()).then(console.log)
```

### Test Your API Route

```bash
curl -X POST http://localhost:3000/api/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"data": "test"}'
```

---

## Common n8n Code Errors

### "Cannot read property of undefined"

```javascript
// Bad - crashes if body is missing
const value = $json.body.nested.field;

// Good - use optional chaining
const value = $json?.body?.nested?.field ?? 'default';
```

### "$input is not defined"

```javascript
// In Code nodes, use:
const data = $input.first().json;

// In expression fields, use:
{{ $json.fieldName }}
```

### "Unexpected token in JSON"

- Response isn't JSON (maybe HTML error page)
- Check the "Respond to Webhook" node has correct content type

---

## When to Use What

```
Is this a simple request/response?
├─ Yes → Direct API route
└─ No → Does it involve multiple external services?
         ├─ Yes → n8n
         └─ No → Does it need visual editing by non-devs?
                  ├─ Yes → n8n
                  └─ No → Direct API route
```

---

## Environment Comparison

| Factor | Docker Compose n8n | Cloud n8n | Direct API Routes |
|--------|-------------------|-----------|-------------------|
| **Setup** | 5 min | 2 min | Already done |
| **Cost** | Free | Free tier | Free |
| **Offline** | Yes | No | Yes |
| **Best For** | Local dev + testing | Production | Simple operations |

---

## Workflow Backup Strategy

Always export workflows to JSON for version control:

1. In n8n UI, click workflow menu (⋮)
2. Select "Download"
3. Save to `workflows/` folder
4. Commit to git

To restore:
1. In n8n UI, click "Import from file"
2. Select the JSON file
3. Activate the workflow
