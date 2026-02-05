# n8n Workflow Templates

## Template 1: Simple Echo (Testing)

Use this to verify webhook connectivity:

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "echo",
        "httpMethod": "POST",
        "responseMode": "responseNode"
      }
    },
    {
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: true, echo: $json.body.message, timestamp: new Date().toISOString() } }}"
      }
    }
  ],
  "connections": {
    "Webhook": { "main": [[{ "node": "Respond", "type": "main", "index": 0 }]] }
  }
}
```

## Template 2: Process with Validation

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "process",
        "httpMethod": "POST",
        "responseMode": "responseNode"
      }
    },
    {
      "name": "Validate Input",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const input = $input.first().json.body;\nif (!input.data) {\n  return { json: { valid: false, error: 'Missing data field' } };\n}\nreturn { json: { valid: true, data: input.data } };"
      }
    },
    {
      "name": "Check Valid",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "boolean": [{ "value1": "={{ $json.valid }}", "value2": true }]
        }
      }
    },
    {
      "name": "Process Data",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const data = $input.first().json.data;\n// Your processing logic here\nreturn { json: { processed: data, timestamp: new Date().toISOString() } };"
      }
    },
    {
      "name": "Success Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: true, data: $json } }}"
      }
    },
    {
      "name": "Error Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: false, error: $json.error } }}",
        "options": { "responseCode": 400 }
      }
    }
  ]
}
```

## Template 3: External API Call with Retry

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "external-api",
        "httpMethod": "POST",
        "responseMode": "responseNode"
      }
    },
    {
      "name": "Call External API",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://api.example.com/endpoint",
        "authentication": "genericCredentialType",
        "options": {
          "timeout": 30000,
          "retry": { "enabled": true, "maxTries": 3 }
        }
      }
    },
    {
      "name": "Format Response",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "return { json: { success: true, data: $input.first().json } };"
      }
    },
    {
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json }}"
      }
    }
  ]
}
```

## Template 4: Database Query (Non-Vector)

For simple database operations without vector similarity:

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "db-query",
        "httpMethod": "POST",
        "responseMode": "responseNode"
      }
    },
    {
      "name": "Query Database",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT * FROM your_table WHERE id = $1",
        "options": { "queryParams": "={{ [$json.body.id] }}" }
      }
    },
    {
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: true, results: $json } }}"
      }
    }
  ]
}
```

## Template 5: Multi-Service Orchestration

This is where n8n shines - coordinating multiple services:

```
Webhook Trigger
    │
    ▼
Validate Input
    │
    ▼
┌───┴───┐
│       │
▼       ▼
Save    Send
to DB   Email
│       │
└───┬───┘
    │
    ▼
Post to Slack
    │
    ▼
Respond to Webhook
```

Use n8n's parallel execution for independent operations.

## Common Patterns

### Error Handling Wrapper

```javascript
// In Code node
try {
  // Your logic
  const result = await someOperation();
  return { json: { success: true, data: result } };
} catch (error) {
  return {
    json: {
      success: false,
      error: {
        message: error.message,
        code: 'OPERATION_FAILED'
      }
    }
  };
}
```

### Conditional Routing

Use IF nodes to branch based on:
- Input validation results
- API response status
- Business logic conditions

### Merge Results

When running parallel operations, use Merge node to combine results before responding.
