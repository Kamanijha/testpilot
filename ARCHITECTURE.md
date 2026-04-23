# Architecture

## System overview

```
┌─────────────┐   JSON   ┌──────────────────────┐
│  Browser    │ ───────▶ │ POST /api/generate   │
│             │          │  framework + scenario │
│             │          │  → OpenAI stream      │
│             │ ◀────────│  ← delta chunks       │
│             │          └──────────────────────┘
│             │
│             │   JSON   ┌──────────────────────┐
│  (optional) │ ───────▶ │ POST /api/explain    │
│             │ ◀────────│  chunks of markdown   │
└─────────────┘          └──────────────────────┘
```

Both endpoints run on the Node.js runtime (not Edge) so the OpenAI SDK's streaming iterator behaves predictably.

## Data flow

1. User types a scenario and picks a framework (`selenium-java`, `playwright-python`, `cypress-js`).
2. Client POSTs `{ scenario, framework }` to `/api/generate`.
3. Server builds a framework-specific system prompt (`SYSTEM_PROMPT_GENERATE(framework)` in `lib/prompts.ts`) and opens a streaming chat completion with `gpt-4o-mini`.
4. Each `delta.content` is written to a `ReadableStream`; the client reads it chunk-by-chunk and accumulates into `code` state.
5. When the user clicks "Explain this code," the full accumulated code is POSTed to `/api/explain`, which streams a short markdown explanation back.

## Key design decisions

1. **Per-framework system prompts, not a universal one.**
   - Options: (a) one big prompt listing every framework's rules; (b) one prompt per framework, switched in at request time.
   - Chose (b). A single 400-line prompt with "if framework X then..." makes the model hedge. Giving it only Selenium rules when generating Selenium keeps it grounded.
   - Trade-off: triplicated rules in `lib/prompts.ts` when a rule changes. A small cost at three frameworks.

2. **Streaming from OpenAI → `ReadableStream` → client.**
   - Next.js API routes can return a `Response(readableStream)` directly. The iterator-to-stream adapter is ~15 lines and handles backpressure via `controller.enqueue`.
   - `X-Accel-Buffering: no` prevents proxy buffering when deployed behind Vercel's edge.

3. **Defensive code-fence stripping on the client.**
   - The model is told to output a single fenced code block. It usually obeys, but partial streams contain an open fence and no close. The client strips everything up to the first newline after ```` ``` ```` and removes a trailing fence if present, so the UI never shows a raw fence marker.

4. **AbortController tied to the fetch.**
   - A new submit calls `abortRef.current?.abort()` before starting. The in-flight stream is cancelled at both the fetch level and (because the reader is abandoned) the OpenAI level soon after.

5. **Single page, no routing.**
   - The whole UX is one screen: hero, form, output, explanation. Routing would add friction for a single-shot tool.

## Scaling considerations

- Both endpoints are thin: just a prompt builder + streaming client. Throughput is bounded by OpenAI rate limits.
- At 10×: move behind an Upstash queue keyed by `sha256(scenario + framework)`, and serve cached code when the same scenario/framework is requested.
- At 100×: multi-tenant API keys, per-IP rate limits, and a per-user cost budget.

## Security considerations

- `OPENAI_API_KEY` never leaves the server.
- Scenario text is capped at 4,000 characters before prompting.
- Prompt injection mitigation: scenarios are wrapped in `<scenario>` tags and the system prompt says to treat their content as data, not instructions.
- No persistence. No DB. No PII storage.
- Rate limiting is not yet enabled — first production hardening step is per-IP limits (Vercel middleware or Upstash).
