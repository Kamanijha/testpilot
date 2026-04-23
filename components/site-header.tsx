import Link from "next/link";
import { Plane } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-900/70 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/15 ring-1 ring-indigo-500/40 transition-all group-hover:bg-indigo-500/25">
            <Plane className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <span className="font-semibold tracking-tight text-zinc-100">
            TestPilot
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <a
            href="https://github.com/Kamanijha/testpilot"
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-3 py-1.5 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
