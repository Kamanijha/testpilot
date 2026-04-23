import { NextRequest } from "next/server";
import { openai, MODELS } from "@/lib/openai";
import {
  SYSTEM_PROMPT_EXPLAIN,
  buildExplainUserMessage,
} from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Server is not configured (missing OPENAI_API_KEY)." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { code, language } = await req.json();
  if (typeof code !== "string" || code.trim().length < 30) {
    return new Response(
      JSON.stringify({ error: "Code is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const stream = await openai.chat.completions.create({
    model: MODELS.fast,
    temperature: 0.3,
    stream: true,
    messages: [
      { role: "system", content: SYSTEM_PROMPT_EXPLAIN },
      {
        role: "user",
        content: buildExplainUserMessage(
          code.slice(0, 8_000),
          typeof language === "string" ? language : "text"
        ),
      },
    ],
  });

  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
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
    }),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    }
  );
}
