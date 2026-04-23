"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Framework } from "@/lib/frameworks";
import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  framework,
  streaming = false,
  className,
}: {
  code: string;
  framework: Framework;
  streaming?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const cleaned = stripCodeFence(code);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cleaned);
      setCopied(true);
      toast.success("Copied to clipboard.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed — select manually.");
    }
  };

  const download = () => {
    const blob = new Blob([cleaned], { type: framework.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = framework.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="flex h-5 items-center rounded bg-indigo-500/10 px-1.5 font-mono text-[10px] font-medium tracking-widest text-indigo-300 ring-1 ring-indigo-500/30">
            {framework.badge}
          </span>
          <span className="text-xs text-zinc-500">{framework.filename}</span>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={copy} disabled={!cleaned}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={download}
            disabled={!cleaned}
          >
            <Download /> Download
          </Button>
        </div>
      </div>
      <pre className="max-h-[65vh] overflow-auto p-4 font-mono text-xs leading-relaxed text-zinc-200">
        <code>
          {cleaned || (streaming ? "" : "// Generated code will appear here.")}
          {streaming && (
            <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-indigo-400 align-middle" />
          )}
        </code>
      </pre>
    </div>
  );
}

// The model is told to output a single fenced code block, but we strip the
// fence defensively so partial streams still render nicely.
function stripCodeFence(raw: string): string {
  if (!raw) return "";
  const fenceStart = raw.indexOf("```");
  if (fenceStart === -1) return raw;
  const afterFirst = raw.slice(fenceStart + 3);
  const newline = afterFirst.indexOf("\n");
  const body = newline === -1 ? afterFirst : afterFirst.slice(newline + 1);
  const fenceEnd = body.lastIndexOf("```");
  return fenceEnd === -1 ? body : body.slice(0, fenceEnd).replace(/\s+$/, "");
}
