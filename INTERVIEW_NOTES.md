# Interview Notes — TestPilot

_Private crib sheet. Not for external sharing._

## 30-second pitch

"TestPilot turns plain-English test scenarios into framework-specific automation code — Selenium Java, Playwright Python, or Cypress JS — and streams the code back token by token. Under the hood it's two Next.js API routes that pipe OpenAI's streaming completions into a `ReadableStream`. The entire thing is one screen: pick a framework, type the scenario, watch the code appear."

## 2-minute walkthrough

"The whole app is a single page. Up top is a framework selector with three options. Below that is a textarea, example chips that prefill scenarios, and a generate button. On submit, the client calls `/api/generate` with the scenario and framework. That route builds a framework-specific system prompt — I keep three separate prompt blocks for Selenium, Playwright, and Cypress so the model only ever sees one set of idioms at a time. The route opens a streaming chat completion and writes each `delta.content` to a `ReadableStream`. The client reads that with a `getReader()` loop, accumulates the string, and re-renders the code block every chunk with a pulsing caret. A small helper strips the opening and closing ``` code fence defensively so partial streams render as code, not literal backticks. Once streaming finishes, an 'Explain this code' button appears. Clicking it sends the code to `/api/explain`, which streams a short markdown explanation back into a second panel. I use an `AbortController` so a new submit cancels the in-flight stream cleanly."

## Likely questions & answers

**1. How is this different from GitHub Copilot?**
Copilot writes any code; this is scoped to test automation. The system prompts enforce per-framework idioms — explicit waits, Page Object patterns, data-testid locators, no `Thread.sleep`. You get code that matches what a QA lead would actually accept in review.

**2. Does the generated code actually run?**
Template-accurate, not runtime-verified. I tell the model to mark any guessed selector with `TODO: verify selector`. A real test engineer will still need to plug in real selectors. I call that out in the README so expectations are set correctly.

**3. Why stream from a server API route instead of calling OpenAI from the client?**
The API key has to stay server-side. The server sits between the client and OpenAI: it terminates the client's fetch with a `ReadableStream` while iterating OpenAI's chunks.

**4. Why multiple frameworks?**
Breadth. Any real QA org uses at least two of these. It also shows that I understand idiom differences — the Selenium prompt requires `WebDriverWait + ExpectedConditions`, the Playwright prompt requires `expect(...).to_be_visible()`, the Cypress prompt bans `cy.wait(ms)`.

**5. Why one system prompt per framework instead of one big conditional prompt?**
A conditional prompt makes the model hedge — it starts inserting "depending on the framework..." comments or mixing idioms. Scoping each prompt to one framework keeps the output clean.

**6. How do you handle code fence artifacts in the stream?**
I wrote a `stripCodeFence` helper on the client that handles three cases: no fence yet (show as-is), fence open but not closed (strip leading fence), fence closed (strip both). It runs on every partial chunk.

**7. What if the user changes framework mid-stream?**
A new submit calls `abortController.abort()` before firing the next fetch. The old reader stops, the old completion dies (OpenAI detects the closed stream), and state is cleared. No race conditions.

**8. How do you prevent prompt injection?**
Scenarios are wrapped in `<scenario>` XML-style tags, and the system prompt tells the model that anything inside those tags is user data, not instructions. It's a soft defense — a hardened version would add an output filter that rejects code containing shell redirections or unexpected imports.

**9. Why `gpt-4o-mini` over `gpt-4o`?**
Latency and cost. For three-framework generation the mini model is more than good enough, and it streams fast. I'd route to `gpt-4o` only if I added a "deep refine" pass.

**10. What's the hardest UX detail you got right?**
The pulsing caret at the end of the stream. It's two lines of Tailwind but it completely changes how the demo feels — it signals liveness in the gap between chunks.

**11. What if someone asks for a framework you don't support?**
Today I return 400 `Unknown framework`. The `FrameworkId` type union makes it a compile-time error to add a fourth framework without updating the prompt guidance, so the server never silently ships broken output.

**12. How would you add a new framework?**
Three edits: add a `FrameworkId` entry in `lib/frameworks.ts`, add its guidance block in `lib/prompts.ts`'s `FRAMEWORK_GUIDANCE`, and the UI picks it up automatically via `FRAMEWORK_LIST`.

**13. What does "deployed on Vercel" mean specifically here?**
Both API routes are Node.js runtime (not Edge) with `maxDuration: 60` so streams don't time out on cold starts. `X-Accel-Buffering: no` prevents Vercel's CDN from buffering the chunked response.

**14. What would you build next?**
Syntax highlighting with Shiki, dynamically imported so the first paint stays fast. Then a "step-by-step" scenario builder where the user adds one action at a time and sees the code grow.

## Numbers to remember

- Three frameworks, one prompt per framework.
- `gpt-4o-mini`, `temperature: 0.2` for generation, `0.3` for explanation.
- Scenario capped at 4,000 chars, code-to-explain capped at 8,000.
- End-to-end generation: ~5–15 seconds depending on scenario length.

## What I would do differently

I'd wire up a small eval harness — a fixture set of scenarios with expected patterns (e.g. "generated code must contain `WebDriverWait`") and run it in CI. Without that, my only regression signal is manual spot-checking after prompt changes.
