"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, AlertTriangle, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FrameworkSelector } from "@/components/framework-selector";
import { ExampleChips } from "@/components/example-chips";
import { CodeBlock } from "@/components/code-block";
import { ExplanationPanel } from "@/components/explanation-panel";
import { FRAMEWORKS, type FrameworkId } from "@/lib/frameworks";

type Phase = "idle" | "streaming" | "done" | "error";

export function PilotClient() {
  const [scenario, setScenario] = useState("");
  const [framework, setFramework] = useState<FrameworkId>("selenium-java");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const fw = FRAMEWORKS[framework];

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (scenario.trim().length < 15) {
      toast.error("Scenario must be at least 15 characters.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setCode("");
    setExplanation("");
    setPhase("streaming");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, framework }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: "Generation failed." }));
        throw new Error(data.error || "Generation failed.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setCode(acc);
      }

      setPhase("done");
      toast.success("Code ready.");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Generation failed.";
      setError(msg);
      setPhase("error");
      toast.error(msg);
    }
  }

  async function onExplain() {
    if (!code) return;
    setExplanation("");
    setExplaining(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: fw.language }),
      });
      if (!res.ok || !res.body) throw new Error("Could not explain.");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setExplanation(acc);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not explain.");
    } finally {
      setExplaining(false);
    }
  }

  function reset() {
    abortRef.current?.abort();
    setScenario("");
    setCode("");
    setExplanation("");
    setError(null);
    setPhase("idle");
  }

  const streaming = phase === "streaming";

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={onGenerate} className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <FrameworkSelector
                value={framework}
                onChange={setFramework}
                disabled={streaming}
              />
              <span className="text-xs tabular-nums text-zinc-500">
                {scenario.length.toLocaleString()} chars
              </span>
            </div>

            <Textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Describe a test scenario in plain English. Include URLs, field labels, and what should be true at the end."
              className="min-h-36 text-sm"
              autoFocus
            />

            <ExampleChips onPick={(p) => setScenario(p.scenario)} />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {error ? (
                <div className="flex items-center gap-2 text-sm text-red-300">
                  <AlertTriangle className="h-4 w-4" /> {error}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">
                  Tip: the more concrete your scenario (URLs, labels, data), the
                  sharper the output.
                </p>
              )}
              <div className="flex gap-2">
                {(code || phase === "error") && (
                  <Button type="button" variant="ghost" onClick={reset}>
                    Reset
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={streaming || scenario.trim().length < 15}
                >
                  {streaming ? (
                    <>
                      <Loader2 className="animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles /> Generate {fw.badge}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {(streaming || code) && (
        <div className="grid gap-4 fade-in">
          <CodeBlock code={code} framework={fw} streaming={streaming} />
          {phase === "done" && (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={onExplain}
                disabled={explaining}
              >
                {explaining ? (
                  <>
                    <Loader2 className="animate-spin" /> Explaining...
                  </>
                ) : (
                  <>
                    <BookOpen /> Explain this code
                  </>
                )}
              </Button>
            </div>
          )}
          {(explaining || explanation) && (
            <ExplanationPanel text={explanation} streaming={explaining} />
          )}
        </div>
      )}
    </div>
  );
}
