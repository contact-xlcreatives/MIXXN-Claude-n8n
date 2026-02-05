# n8n Workflows

Pre-built workflows for MIXXN Claude. Import these into your n8n instance.

## Quick Start

1. Start n8n: `docker compose up -d`
2. Open n8n: http://localhost:5678
3. Click **Import from file**
4. Select `getting-started.json`
5. Toggle workflow to **Active**
6. Test: `curl -X POST http://localhost:5678/webhook/echo -H "Content-Type: application/json" -d '{"message":"Hello"}'`

## Available Workflows

### getting-started.json

Simple echo workflow to verify n8n connection.

**Webhook:** `/webhook/echo`
**Method:** POST

**Input:**
```json
{ "message": "Hello n8n!" }
```

**Output:**
```json
{
  "success": true,
  "echo": "Hello n8n!",
  "timestamp": "2026-02-05T12:00:00.000Z",
  "requestId": "req_1234567890"
}
```

### echo-working.json

Alternative echo workflow with different path.

**Webhook:** `/webhook/echo-working`

### form-submission.json

Form submission handling workflow.

**Webhook:** `/webhook/form`

## Importing Workflows

### Via n8n UI

1. Go to http://localhost:5678
2. Click "Import from file"
3. Select the JSON file
4. Click "Save"
5. Toggle "Active" switch

### Via curl

```bash
# Import workflow via n8n API
curl -X POST "http://localhost:5678/api/v1/workflows" \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: your-api-key" \
  -d @getting-started.json
```

## Creating New Workflows

1. Build your workflow in n8n UI
2. Click menu (⋮) → Download
3. Save to this `workflows/` folder
4. Commit to git

## Troubleshooting

**Webhook returns 404:**
- Check workflow is Active (green toggle)
- Verify path matches exactly (case-sensitive)
- Ensure WEBHOOK_URL is set in docker-compose.yml

**Empty response:**
- Every workflow must end with "Respond to Webhook" node
- Check the responseBody parameter is set

**Test vs Production:**
- `/webhook/` - Production (requires active workflow)
- `/webhook-test/` - Test (requires workflow open in editor)
