# ✈️ Voyager AI

AI-powered trip planner — 10-step intake wizard, one-shot itinerary generation, structured trip plan view.

Node 20+ · React 18 · DeepSeek Chat · MIT License

---

## How it works

1. **Collection wizard (10 steps, zero API calls)** — Answer questions about destination, dates, flights, accommodation, group, budget, dietary needs, and travel style via chips, calendar, and text inputs.
2. **Single generation call** — When you finish step 10, Voyager sends one streaming request to DeepSeek and builds your full plan.
3. **Trip Plan view** — Itinerary days stream in as they are generated; checklist and insider tips appear when complete. Download as `.txt` anytime.

There is **no post-generation chat** — the plan panel is the product.

---

## Prerequisites

- Node.js 20+
- DeepSeek API key — [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys)

---

## Quick start

```bash
git clone <repo-url>
cd voyager-ai
cp .env.example .env
# Add DEEPSEEK_API_KEY to .env
npm install
npm run dev
# Open http://localhost:5173
```

Development runs **Vite on :5173** (frontend) and **Express on :3001** (API). Vite proxies `/api` to Express.

---

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DEEPSEEK_API_KEY` | Yes | — | DeepSeek API key. Never sent to the browser. |
| `ALLOWED_ORIGIN` | Prod only | `http://localhost:5173` (dev) | CORS origin for production server. |
| `PORT` | No | `8080` | Production server port. |

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite + Express API concurrently |
| `npm run build` | Build frontend to `dist/` |
| `npm start` | Production server (static + API) |
| `npm run deploy:local` | Build and start production locally |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Playwright smoke tests (needs `DEEPSEEK_API_KEY` for full flow) |

---

## Architecture

```
useTripCollection (10 steps) → useChat → buildMegaPrompt → POST /api/chat (SSE)
  → streamParser (live days) + tripParser (batch) → TripSummaryPanel
```

- **`src/hooks/useTripCollection.js`** — Collection state machine (do not refactor internals lightly).
- **`src/hooks/useChat.js`** — Orchestrator, streaming, persistence.
- **`src/utils/tripParser.js`** — Tag-based parsers (frozen public API).
- **`src/utils/streamParser.js`** — Incremental day extraction during SSE.
- **`api/routes/chat.js`** — SSE proxy with server-side auto-continue.

---

## localStorage keys

| Key | Version | Contents |
|-----|---------|----------|
| `voyager-collection` | 3 | Wizard progress |
| `voyager-session` | 2 | Plan + messages after collection |
| `voyager-checklist-state` | — | Checkbox states |

---

## Production / Docker

```bash
npm run deploy:local
# or
docker build -t voyager-ai .
docker run -p 8080:8080 -e DEEPSEEK_API_KEY=sk-... -e ALLOWED_ORIGIN=http://localhost:8080 voyager-ai
```

---

## Testing

```bash
npm test              # 38 unit tests (parsers + stream parser)
npm run test:e2e      # Playwright (skips API-dependent tests without key)
```

---

## License

MIT — see [LICENSE](LICENSE).
