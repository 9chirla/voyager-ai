# Decision Log — Voyager AI Refactor Sprint

## 2026-06-07 Checklist prompt vs parser mismatch
**Context:** `buildPrompt.js` instructed Documents/Clothing/Tech subsections but parser only understood PACKING/BOOKING.
**Options considered:** (A) Fix prompt only, (B) Fix parser only, (C) Both prompt + parser fallback.
**Decision:** Option C — align prompt to PACKING/BOOKING and add subsection label aliases in parser.
**Rationale:** Prompt reduces model drift; parser fallback catches remainder without changing return API.
**Consequences:** Checklist files must ship atomically; tests cover both formats.

## 2026-06-07 isBuildingItinerary replaced by isStreamingPlan
**Context:** Incremental days during stream conflicted with `!itinerary.length` spinner gate.
**Options considered:** Keep isBuildingItinerary, use streamedDays.length, dedicated isStreamingPlan flag.
**Decision:** `isStreamingPlan` for lifecycle; `showInitialSpinner = isStreamingPlan && !itinerary.length`; generating badge when days exist.
**Rationale:** Unambiguous separation of full spinner vs partial progress.
**Consequences:** TripSummaryPanel props simplified; ChatWindow no longer shows building state.

## 2026-06-07 streamApiResponse renamed to streamMegaPlanResponse
**Context:** Removing dead `planOnly=false` path left a single-purpose streaming function.
**Decision:** Rename to `streamMegaPlanResponse`, keep as module-private function in useChat.js.
**Rationale:** Name reflects sole caller; keeps SSE logic testable separately from hook wiring.
**Consequences:** No generic multi-mode stream helper remains in client.

## 2026-06-07 StageIndicator hidden post-collection
**Context:** 7-stage header misaligned with 10-step wizard and irrelevant after plan view.
**Decision:** Show 8 grouped collection steps while `isCollecting`; hide entirely in plan view.
**Rationale:** Avoids forcing legacy 7-stage metaphor; reduces header noise when viewing plan.
**Consequences:** E2E stage assertions use `data-current-stage` on collection steps only.

## 2026-06-07 SESSION_VERSION 1 → 2
**Context:** Session shape evolved with plan-only architecture.
**Decision:** Bump to v2; `migrateSession` clears stale v1 data on load.
**Rationale:** Prevents corrupted restore without try/catch user impact.
**Consequences:** Users mid-session on deploy lose in-progress plan (acceptable for pre-release).
