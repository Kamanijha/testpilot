import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn(
    "[testpilot] OPENAI_API_KEY is not set. Generation requests will fail."
  );
}

export const openai = new OpenAI({ apiKey: apiKey ?? "missing" });

export const MODELS = {
  fast: "gpt-4o-mini",
  quality: "gpt-4o",
} as const;
