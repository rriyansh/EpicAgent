import { OpenAI } from "openai";
import { env } from "../config/env";
import { logger } from "../config/logger";

const client =
  env.LLM_API_KEY && env.LLM_PROVIDER === "openai"
    ? new OpenAI({ apiKey: env.LLM_API_KEY, baseURL: env.LLM_BASE_URL })
    : null;

export async function llmComplete(prompt: string): Promise<string> {
  if (!client) {
    throw new Error("LLM client not configured");
  }

  const completion = await client.chat.completions.create({
    model: env.LLM_MODEL,
    messages: [{ role: "user", content: prompt }],
  });

  const text = completion.choices[0]?.message?.content ?? "";
  logger.debug({ prompt, text }, "llm completion");
  return text;
}
