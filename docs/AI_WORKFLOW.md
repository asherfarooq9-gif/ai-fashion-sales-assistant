# AI Workflow

## Pipeline

`apps/api/src/services/conversation/pipeline.js` → `handleInboundMessage()`:

1. **Normalize** the raw channel payload (`normalize.js`) → `{channel, senderId, text, attachments}`.
2. **Voice** — if an audio attachment and no text, `voice/transcribe.js` (mock transcript; real
   Google STT is a documented TODO).
3. **Language** — `i18n/detectLang.js` → `en` | `ur` (Urdu script + romanized keyword heuristic).
4. **Customer** — `Customer.findOrCreateByChannel()`.
5. **Conversation** — `Conversation.getOpen()`; persist the inbound `Message`.
6. **Classify (parallel)** — `detectIntent()` + `detectSentiment()`.
7. **Route** — `stateMachine.transition(state, ctx)` → an action.
8. **Act**:
   - `send_menu` → localized 5-option menu.
   - `recommend` → `recommend.js` shortlist → deterministic product list + "see pictures?" + upsell.
   - `show_discounts` → sale / budget query.
   - `track_or_delivery` → order lookup or delivery policy.
   - `handle_complaint` → apology + `needsHuman=true`.
   - `handle_return` → returns policy.
   - order flow (`orderFlow.js`) → collect items → address → confirm → `createOrder()` + tracking + upsell.
   - `freeform` → `replyGen.js` (LLM, few-shot + sentiment-tuned tone).
9. **Persist** the outbound `Message` and update the conversation.
10. **Send** via `channels/index.js` (skipped when `send:false`); always emit to the SSE outbox.

Deterministic branches (menu, discounts, tracking, FAQ hits, order flow) never call the LLM —
this keeps the demo fast and within free-tier rate limits.

## Intents

`greeting · product_search · order_placement · delivery_inquiry · complaint · return_request ·
discount_inquiry`. A `CannedResponse` trigger match short-circuits the LLM; otherwise the provider
returns `{ intent, confidence, entities }` where entities ∈ `{category, gender, color, size,
budget, productName, orderId, quantity}`.

## Sentiment

`happy · angry · frustrated · interested_buyer · neutral` → tone directives passed to `replyGen`
(angry/frustrated → apologise + concrete next step; interested_buyer → move toward the close +
upsell). Two consecutive `angry` turns set `needsHuman`.

## Recommendation scoring

```
score = 0.55·similarity + 0.20·trending + 0.15·preferenceMatch + 0.10·ratingNorm
```

- `similarity` — cosine of the query embedding vs. product embedding (Atlas `$vectorSearch` or
  in-process cosine).
- `trending` — `salesCount` normalised across candidates.
- `preferenceMatch` — favourite colour + previously bought category.
- Filter first: gender, category, `price ≤ budget`, colour, `stock > 0`. No query text → trending.

## LLM providers

`services/llm/` — a common interface `{ chat, json, embed }`:

| provider | chat | embed | when |
|---|---|---|---|
| `gemini` | `gemini-2.0-flash` (`withStructuredOutput`) | `text-embedding-004` (768d) | `LLM_PROVIDER=gemini` + `GEMINI_API_KEY` |
| `openrouter` | free model, JSON-schema prompt + repair retry | local deterministic vectors | fallback / `LLM_PROVIDER=openrouter` |
| `mock` | templated | hashed pseudo-vectors | tests, CI, and any run with no key |

`withFallback()` retries the fallback provider on `429/5xx/timeout`. `NODE_ENV=test` always uses
`mock` so the suite is deterministic and offline.

## "Train AI Responses"

The **AI Training** dashboard page manages `CannedResponse` rows:
- `isFewShot=false` → deterministic shortcut answers matched (by trigger example) before the LLM.
- `isFewShot=true` → injected as style examples into the `replyGen` prompt for that intent/language.

## n8n

See [`../n8n/README.md`](../n8n/README.md). The importable workflow
(`n8n/workflows/ai-fashion-sales-assistant.workflow.json`) calls `/api/chat/ingest` (`send:false`)
then `/api/channels/:channel/send`, with an intent switch for side effects.
