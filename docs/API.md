# API Reference

Base URL: `http://localhost:5000` (dev). Interactive docs at `GET /api/docs` (Swagger UI, served
from [`openapi.yaml`](./openapi.yaml)). A Postman collection is in
[`infra/postman/AFSA.postman_collection.json`](../infra/postman/AFSA.postman_collection.json).

## Auth

- **Admin JWT** — `POST /api/auth/login` → `{ token }`. Send as `Authorization: Bearer <token>`.
- **Internal token** — `x-internal-token: <API_INTERNAL_TOKEN>` for `/api/chat/ingest`,
  `/api/channels/:channel/send`, and `POST /api/orders`. An admin JWT also satisfies these.

## Error envelope

```json
{ "error": { "code": "validation_error", "message": "Request validation failed", "details": [ … ] } }
```

Codes: `bad_request`, `validation_error`, `unauthorized`, `forbidden`, `not_found`, `conflict`,
`internal_error`.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/healthz` | – | status, db, provider |
| POST | `/api/auth/login` | – | `{email,password}` → `{token, admin}` |
| GET | `/api/auth/me` | admin | current admin |
| GET | `/api/products` | – | filters: `category, gender, color, maxPrice, minPrice, q, trending, page, limit` |
| POST | `/api/products` | admin | create |
| GET/PATCH/DELETE | `/api/products/:id` | GET – / mutate admin | |
| GET | `/api/customers`, `/api/customers/:id` | admin | detail includes `orderHistory` + `conversations` |
| PATCH | `/api/customers/:id` | admin | |
| GET | `/api/orders`, `/api/orders/:id` | admin | `?status=`, `?customerId=` |
| POST | `/api/orders` | internal | `{customerId, items:[{productId,quantity,size,color}], channel, shippingAddress}` |
| PATCH | `/api/orders/:id` | admin | `{status?, paymentStatus?, trackingNumber?}` |
| GET | `/api/conversations`, `/api/conversations/:id` | admin | detail includes `messages[]` |
| GET/POST/PATCH/DELETE | `/api/canned-responses` | admin | "Train AI Responses" |
| GET | `/api/export/:entity/:format` | admin | entity ∈ products,customers,orders,conversations · format ∈ csv,json |
| POST | `/api/chat/ingest` | internal | run the pipeline; returns `{reply,intent,sentiment,state,products,orderId,conversationId}` |
| GET | `/api/chat/stream` | – | SSE feed of outbound messages (`?channel=`) |
| POST | `/api/channels/:channel/send` | internal | `{to, text?, images?}` |
| GET | `/api/webhooks/:channel` | – | Meta verify handshake |
| POST | `/api/webhooks/:channel` | signature | receive IG / WhatsApp events |

## Webhook payloads

**Verify (GET):** Meta calls with `hub.mode=subscribe&hub.verify_token=<token>&hub.challenge=<n>`.
The API echoes `<n>` when the token matches `IG_VERIFY_TOKEN` / `WHATSAPP_VERIFY_TOKEN`.

**Receive (POST):** standard Instagram Messaging (`entry[].messaging[]`) and WhatsApp Cloud
(`entry[].changes[].value.messages[]`) shapes. `X-Hub-Signature-256` is verified when
`IG_APP_SECRET` / `WHATSAPP_TOKEN` is set. The API responds `200` immediately.

## Example

```bash
TOKEN=$(curl -s localhost:5000/api/auth/login -H 'content-type: application/json' \
  -d '{"email":"admin@brand.test","password":"change-me-admin"}' | jq -r .token)

curl -s localhost:5000/api/chat/ingest \
  -H 'content-type: application/json' -H "x-internal-token: change-me-internal" \
  -d '{"channel":"simulator","senderId":"u1","text":"I need a black dress for Eid under 6000"}' | jq .data
```
