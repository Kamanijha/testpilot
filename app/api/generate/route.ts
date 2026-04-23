import { NextRequest } from "next/server";
import { openai, MODELS } from "@/lib/openai";
import {
  SYSTEM_PROMPT_GENERATE,
  buildGenerateUserMessage,
  PROMPT_VERSION,
} from "@/lib/prompts";
import { isFrameworkId } from "@/lib/frameworks";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Server is not configured (missing OPENAI_API_KEY)." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { scenario, framework } = await req.json();

  if (typeof scenario !== "string" || scenario.trim().length < 15) {
    return new Response(
      JSON.stringify({ error: "Scenario must be at least 15 characters." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!isFrameworkId(framework)) {
    return new Response(
      JSON.stringify({ error: "Unknown framework." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const stream = await openai.chat.completions.create({
    model: MODELS.fast,
    temperature: 0.2,
    stream: true,
    messages: [
      { role: "system", content: SYSTEM_PROMPT_GENERATE(framework) },
      { role: "user", content: buildGenerateUserMessage(scenario.slice(0, 4_000)) },
    ],
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
      "X-Prompt-Version": PROMPT_VERSION,
    },
  });
}
