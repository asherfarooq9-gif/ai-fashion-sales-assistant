# n8n Orchestration

The Express API works on its own (`ORCHESTRATION_MODE=direct`). n8n is an optional
orchestration layer that sits between the messaging webhooks and the AI pipeline so you can
add side effects (Slack alerts, Google Sheet rows, CRM sync) without touching the API.

## Flow

```
Meta webhook ─▶ POST {API}/api/webhooks/:channel
                 (ORCHESTRATION_MODE=n8n)  ─▶ forwards raw payload to N8N_INBOUND_WEBHOOK_URL
                                              │
        n8n: Inbound Webhook ─▶ Config ─▶ Normalize ─▶ Run AI Pipeline
             (POST {API}/api/chat/ingest, send:false)
                              ─▶ Route by Intent ─▶ [complaint ▶ Alert Support]
                              ─▶ Send Reply (POST {API}/api/channels/:channel/send)
```

## Import

1. Start n8n: `docker compose up -d n8n` → open http://localhost:5678 (user/pass from `docker-compose.yml`).
2. **Workflows ▸ Import from File** ▸ select `workflows/ai-fashion-sales-assistant.workflow.json`.
3. Set environment variables for the n8n container (or in the workflow's **Config** node):
   - `AFSA_API_BASE` — e.g. `http://api:5000` (compose) or your deployed API URL.
   - `API_INTERNAL_TOKEN` — must match the API's `API_INTERNAL_TOKEN`.
4. Activate the workflow. Copy the **Inbound Webhook** production URL.
5. On the API, set `ORCHESTRATION_MODE=n8n` and `N8N_INBOUND_WEBHOOK_URL=<that URL>` and restart.

## Test without Meta

```bash
curl -X POST http://localhost:5678/webhook/inbound \
  -H 'content-type: application/json' \
  -d '{"channel":"whatsapp","payload":{"entry":[{"changes":[{"value":{"contacts":[{"wa_id":"92300","profile":{"name":"Sana"}}],"messages":[{"from":"92300","type":"text","text":{"body":"hi"}}]}}]}]}}'
```

The reply is dispatched via `/api/channels/whatsapp/send` (goes to the outbox / live API depending
on `CHANNEL_TRANSPORT`).
