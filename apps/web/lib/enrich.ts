import type { Place } from "@travel-planner/core";
import { generateId } from "./utils";

export async function fetchPageMeta(url: string): Promise<{ title?: string; description?: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TravelPlannerBot/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();
    const title = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1]
      ?? html.match(/<title>([^<]+)<\/title>/i)?.[1];
    const description = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)?.[1]
      ?? html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1];
    return { title: title?.trim(), description: description?.trim() };
  } catch {
    return {};
  }
}

export function rawInputToPlace(
  rawInput: string,
  destination?: string,
  meta?: { title?: string; description?: string }
): Place {
  const isUrl = /^https?:\/\//i.test(rawInput.trim());
  const name = meta?.title ?? (isUrl ? extractNameFromUrl(rawInput) : rawInput.trim());

  return {
    id: generateId(),
    name: name.slice(0, 120),
    neighborhood: destination,
    kind: guessKind(rawInput, meta?.description),
    mealSlot: guessMealSlot(rawInput, meta?.description),
    whyRecommended: meta?.description ?? (isUrl ? "Added from your saved link." : "Added by you."),
    sourceLinks: isUrl ? [rawInput.trim()] : [],
    tags: [],
    confidence: "user_added",
    localTips: [],
    isCustom: true,
  };
}

function extractNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] ?? u.hostname;
    return decodeURIComponent(last).replace(/[-_+]/g, " ");
  } catch {
    return "Saved place";
  }
}

function guessKind(input: string, desc?: string): Place["kind"] {
  const text = `${input} ${desc ?? ""}`.toLowerCase();
  if (/breakfast|lunch|dinner|restaurant|cafe|food|ramen|sushi/.test(text)) return "meal";
  if (/museum|temple|park|beach|hike|tour/.test(text)) return "activity";
  return "activity";
}

function guessMealSlot(input: string, desc?: string): Place["mealSlot"] | undefined {
  const text = `${input} ${desc ?? ""}`.toLowerCase();
  if (/breakfast|brunch/.test(text)) return "breakfast";
  if (/lunch/.test(text)) return "lunch";
  if (/dinner|supper/.test(text)) return "dinner";
  if (/snack|dessert|coffee/.test(text)) return "snack";
  return undefined;
}
