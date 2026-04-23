"use client";

import { FRAMEWORK_LIST, type FrameworkId } from "@/lib/frameworks";
import { cn } from "@/lib/utils";

export function FrameworkSelector({
  value,
  onChange,
  disabled,
}: {
  value: FrameworkId;
  onChange: (id: FrameworkId) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="tablist"
      className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900/60 p-1"
    >
      {FRAMEWORK_LIST.map((fw) => {
        const active = fw.id === value;
        return (
          <button
            key={fw.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(fw.id)}
            disabled={disabled}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all duration-150",
              active
                ? "bg-zinc-950 text-zinc-100 shadow-sm shadow-black/40 ring-1 ring-zinc-700"
                : "text-zinc-400 hover:text-zinc-200",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <span className="font-mono text-[10px] tracking-widest text-indigo-400">
              {fw.badge}
            </span>
            {fw.label}
          </button>
        );
      })}
    </div>
  );
}
