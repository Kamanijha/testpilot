"use client";

import { BookOpen } from "lucide-react";

export function ExplanationPanel({
  text,
  streaming,
}: {
  text: string;
  streaming: boolean;
}) {
  return (
    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-indigo-300">
        <BookOpen className="h-4 w-4" /> Explanation
      </div>
      <div className="prose-sm whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
        {text || (streaming ? "Thinking..." : "")}
        {streaming && (
          <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-indigo-400 align-middle" />
        )}
      </div>
    </div>
  );
}
