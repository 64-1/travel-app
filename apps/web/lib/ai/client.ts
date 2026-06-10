import OpenAI from "openai";

export function getOpenAI(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export function hasAI(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}
