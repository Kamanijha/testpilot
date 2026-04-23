"use client";

import { Sparkles } from "lucide-react";
import { PRESETS, type Preset } from "@/lib/presets";

export function ExampleChips({
  onPick,
}: {
  onPick: (preset: Preset) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
        <Sparkles className="h-3 w-3 text-zinc-600" /> Try:
      </span>
      {PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onPick(p)}
          className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-300 transition-all hover:border-indigo-500/40 hover:bg-zinc-900 hover:text-indigo-300"
        >
          {p.title}
        </button>
      ))}
    </div>
  );
}
