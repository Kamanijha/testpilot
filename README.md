# TestPilot

> Describe a test in plain English. Get idiomatic Selenium Java, Playwright Python, or Cypress JS code — streamed live.

![Hero screenshot](./docs/screenshots/hero.png)

**Live demo:** _(add after deploy)_ · **Author:** [Kamani Jha](https://github.com/Kamanijha)

## Why this project

Automation engineers spend a lot of time translating scenarios into framework-specific boilerplate. TestPilot is the "describe → ship" shortcut: you type the scenario, pick a framework, and the test streams in. It's the project I'd hand to a tester who knows what to test but hasn't touched Selenium before.

## Features

- **Three frameworks** — Selenium · Java, Playwright · Python, Cypress · JavaScript.
- **Streaming output** — code appears token-by-token. No spinners.
- **Six preset scenarios** — login, checkout, form validation, search+sort, file upload, dynamic waits.
- **Explain this code** — one-click secondary streaming call that breaks down the generated test for a junior engineer.
- **Copy + download** with the right filename and MIME per framework.
- **Abortable generations** — a new submit cancels the in-flight stream.

## Tech stack

| Layer       | Technology                                              |
| ----------- | ------------------------------------------------------- |
| Frontend    | Next.js 15 (App Router), React 19, TypeScript, Tailwind v4 |
| UI          | shadcn-style components, Sonner, Lucide                 |
| AI          | OpenAI `gpt-4o-mini` streaming for both generation and explanation |
| Deployment  | Vercel                                                  |

## Architecture

```
Browser
  │
  ├─ POST /api/generate   → chunked Java/Python/JS test code
  └─ POST /api/explain    → chunked markdown explanation
```

Framework-specific style guidance is injected into the system prompt (see `lib/prompts.ts`). The model only sees one framework's rules per request, so it doesn't mix idioms.

Full detail in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Getting started

```bash
git clone https://github.com/Kamanijha/testpilot
cd testpilot
npm install
cp .env.example .env.local   # add OPENAI_API_KEY
npm run dev
```

## Design decisions (short version)

- **Streaming everywhere.** Both endpoints pipe OpenAI's `delta.content` through a `ReadableStream`. Perceived latency drops from "is it broken?" to "I can see it typing".
- **Per-framework system prompt.** Separate guidance blocks per framework, switched in when the user picks. Keeps the model grounded in one set of idioms at a time.
- **Guessed selectors are marked.** Every framework prompt demands that locators the model had to infer be tagged `// TODO: verify selector`. The output is a strong skeleton, not blindly-trusted code.
- **Abort on re-submit.** `AbortController` cancels the running fetch if the user changes framework or resubmits, so stale streams don't race with fresh ones.
- **Code fence stripping in the UI.** The model is told to return a fenced block, but we strip the fence defensively so partial streams render correctly.

## Future work

- Syntax highlighting via Shiki (dynamic import to keep first-paint fast).
- "Step-by-step builder" mode for multi-step scenarios.
- Run-in-browser sandbox for Playwright (overkill, but would be a killer demo).

## License

MIT
