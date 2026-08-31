# Deployment Guide

Target: **Vercel** (web) + **Render** (api + n8n) + **MongoDB Atlas** (database).
Everything also runs locally with `docker compose up`.

## 0. Local (Docker)

```bash
cp .env.example .env          # keep LLM_PROVIDER=mock to run with no keys
docker compose up -d
docker compose exec api node apps/api/src/seed/seed.js --fresh
```

- web → http://localhost:8080
- api → http://localhost:5000  (`/api/docs` for Swagger)
- n8n → http://localhost:5678
- mongo → localhost:27017

## 1. MongoDB Atlas

1. Create a free **M0** cluster. Add a database user and allow your API host's IP (or `0.0.0.0/0`
   for a quick start).
2. Connection string → `MONGODB_URI` (append `/ai-fashion-sales-assistant`).
3. **Atlas Search ▸ Create Search Index ▸ JSON editor** → paste
   [`infra/atlas/vector-index.json`](../infra/atlas/vector-index.json) on the `products`
   collection. Optional — without it the app uses in-process cosine similarity.

## 2. API on Render

1. New ▸ **Blueprint** ▸ point at this repo. `render.yaml` provisions `afsa-api` and `afsa-n8n`.
2. Set the `sync:false` env vars on `afsa-api`:
   - `MONGODB_URI` (Atlas)
   - `GEMINI_API_KEY` (from https://aistudio.google.com/apikey — free tier)
   - `OPENROUTER_API_KEY` (optional fallback, https://openrouter.ai/keys)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - `WEB_ORIGIN` = your Vercel URL
   - keep `LLM_PROVIDER=gemini`, `CHANNEL_TRANSPORT=live`
3. After first deploy, run the seed once from the Render shell:
   `node apps/api/src/seed/seed.js --fresh`
4. Health check path is `/healthz` (already set).

## 3. Web on Vercel

1. Import the repo. `vercel.json` sets the build command / output.
2. Env var: `VITE_API_URL` = your Render API URL (e.g. `https://afsa-api.onrender.com`).
3. Deploy. The SPA rewrite in `vercel.json` handles client-side routing.

## 4. n8n (optional orchestration)

`afsa-n8n` deploys from `render.yaml`. Set `N8N_BASIC_AUTH_USER/PASSWORD` and `WEBHOOK_URL`
(the service's public URL). Then:

1. Import `n8n/workflows/ai-fashion-sales-assistant.workflow.json`.
2. Set container env `AFSA_API_BASE` (Render API URL) and `API_INTERNAL_TOKEN` (match the API).
3. Activate; copy the Inbound Webhook URL.
4. On the API set `ORCHESTRATION_MODE=n8n` and `N8N_INBOUND_WEBHOOK_URL=<that URL>`, redeploy.

## 5. Instagram + WhatsApp (going live)

Until this is done, use the **Chat Simulator** — it drives the identical pipeline.

**Meta app**: developers.facebook.com ▸ create app ▸ add **Instagram** and **WhatsApp** products.

**WhatsApp Cloud API**
- Copy the temporary/permanent token → `WHATSAPP_TOKEN`, and the phone number ID →
  `WHATSAPP_PHONE_NUMBER_ID`.
- Configuration ▸ Webhook ▸ Callback URL `https://<api>/api/webhooks/whatsapp`, Verify Token =
  `WHATSAPP_VERIFY_TOKEN`. Subscribe to the **messages** field.

**Instagram Messaging**
- Connect the IG professional account to a Facebook Page. Get a Page access token →
  `IG_PAGE_ACCESS_TOKEN`; app secret → `IG_APP_SECRET`.
- Webhooks ▸ Callback `https://<api>/api/webhooks/instagram`, Verify Token = `IG_VERIFY_TOKEN`,
  subscribe to **messages**.
- Request the `instagram_manage_messages` / `pages_messaging` permissions (App Review).

Set `CHANNEL_TRANSPORT=live` and redeploy.

## 6. Smoke checklist

```bash
curl https://<api>/healthz
curl "https://<api>/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=<token>&hub.challenge=42"   # → 42
# log into the web app, open Chat Simulator, run docs/DEMO.md
```

## Rollback

- Render: **Deploys** tab ▸ redeploy a previous successful build.
- Vercel: **Deployments** ▸ promote a previous deployment.
- DB: Atlas M0 has no automated backups — export first with `GET /api/export/*/json`.
