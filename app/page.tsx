import { SiteHeader } from "@/components/site-header";
import { PilotClient } from "./pilot-client";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        <section className="mb-10 text-center sm:mb-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            English → executable test code
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
            Describe the test.{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Ship the code.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
            Type a scenario in plain English. Get idiomatic Selenium Java,
            Playwright Python, or Cypress JS — streamed in real time.
          </p>
        </section>

        <PilotClient />

        <footer className="mt-16 border-t border-zinc-900 pt-8 text-center text-xs text-zinc-500">
          Built by{" "}
          <a
            className="text-zinc-300 hover:text-indigo-400"
            href="https://github.com/Kamanijha"
          >
            Kamani Jha
          </a>{" "}
          · Streaming with OpenAI · Next.js · Vercel
        </footer>
      </main>
    </>
  );
}
