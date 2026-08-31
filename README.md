# AI Fashion Sales Assistant

An AI sales representative for clothing brands. It auto-replies to **Instagram DM** and
**WhatsApp**, detects customer **intent** and **sentiment**, **recommends products**,
**collects orders**, and ships with an **admin dashboard** and a **chat simulator** so the whole
flow is demoable without Meta app review.

> Runs fully offline with `LLM_PROVIDER=mock` — no API keys needed for development or CI.

## Stack

| Layer | Tech |
|---|---|
| Web | React + Vite + Tailwind CSS |
| API | Node + Express (ESM), Mongoose |
| DB | MongoDB (Atlas M0 in prod) |
| AI | LangChain — Google Gemini free tier (`gemini-2.0-flash` + `text-embedding-004`), OpenRouter free model fallback, deterministic mock provider |
| Orchestration | n8n (optional; API works standalone) |
| Messaging | Instagram Graph API + WhatsApp Business (Cloud) API |

## Layout

```
apps/api        Express API, AI pipeline, seed, tests
apps/web        React admin dashboard + chat simulator
packages/shared enums + zod schemas (used by api and web)
packages/eval   the ~50 spec NL queries, used by intent tests
n8n/            importable orchestration workflow
infra/          Atlas vector index, Postman collection
docs/           DATABASE, API, AI_WORKFLOW, DEPLOYMENT, DEMO, openapi.yaml
```

## Quick start

```bash
npm install
cp .env.example .env                    # defaults work as-is (mock provider)
docker compose up -d mongo              # or point MONGODB_URI at any mongo
npm run seed                            # ~40 products, 8 customers, canned responses, admin
npm run dev                             # api :5000, web :5173
```

Open http://localhost:5173, sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`, and open
**Chat Simulator**. Follow [`docs/DEMO.md`](docs/DEMO.md).

To use the real free LLM instead of the mock:

```bash
# get a free key at https://aistudio.google.com/apikey
LLM_PROVIDER=gemini GEMINI_API_KEY=... npm run dev
```

## Scripts

| command | what |
|---|---|
| `npm run dev` | api + web with reload |
| `npm run seed` | seed the database (`-- --fresh` to drop first) |
| `npm test` | all workspace tests (Vitest, mock provider) |
| `npm run test:api` / `test:web` | one workspace |
| `npm run lint` / `format` | eslint / prettier |
| `npm run build` | production web build |
| `docker compose up` | full stack: mongo + api + web + n8n |

## Deliverables

- [x] Complete source code (this monorepo)
- [x] AI workflow — [`n8n/workflows/ai-fashion-sales-assistant.workflow.json`](n8n/workflows/ai-fashion-sales-assistant.workflow.json)
- [x] Database design — [`docs/DATABASE.md`](docs/DATABASE.md)
- [x] Admin dashboard — products CRUD, customers, orders, conversations, AI training, export
- [x] Instagram DM integration — webhook verify/receive + Graph API send adapter
- [x] WhatsApp integration — webhook verify/receive + Cloud API send adapter
- [x] API documentation — [`docs/API.md`](docs/API.md) + `openapi.yaml` (served at `/api/docs`)
- [x] Deployment guide — [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

Bonus: voice-note handling (mock transcription), Urdu + English, AI-generated replies, auto-upsell.

## Tests

`npm test` runs Vitest across both workspaces with the deterministic mock provider and an
in-memory MongoDB — no network, no keys. Coverage gate ≥ 80 % on the AI / conversation / LLM
layer. CI: `.github/workflows/ci.yml`.
