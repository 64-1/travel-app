import type { Place } from "@travel-planner/core";
import { generateId } from "@/lib/utils";
import { getOpenAI, hasAI } from "@/lib/ai/client";
import { fetchPageMeta, rawInputToPlace } from "@/lib/enrich";

export type ContentLocale = "en" | "zh";

function languageInstruction(locale: ContentLocale = "en"): string {
  if (locale === "zh") {
    return "Write all user-facing text fields (whyRecommended, localTips, labels, themes) in Simplified Chinese (简体中文). Keep place names in their common local form.";
  }
  return "Write all user-facing text in English.";
}

/** AI + heuristic fallback — used by resolvePlaceInput and wishlist enrichment. */
export async function createPlaceFromInput(
  rawInput: string,
  destination?: string,
  locale: ContentLocale = "en"
): Promise<Place> {
  const isUrl = /^https?:\/\//i.test(rawInput.trim());
  const meta = isUrl ? await fetchPageMeta(rawInput) : {};

  if (hasAI()) {
    const openai = getOpenAI()!;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Turn this into a travel Place JSON for destination ${destination ?? "unknown"}.
Input: ${rawInput}
Meta: ${JSON.stringify(meta)}
Fields: id, name, neighborhood, kind, mealSlot, whyRecommended, sourceLinks, tags, confidence (user_added), localTips, isCustom (true).
No fake ratings. ${languageInstruction(locale)}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    try {
      const place = JSON.parse(response.choices[0]?.message?.content ?? "{}") as Place;
      return { ...place, id: place.id || generateId(), confidence: "user_added", isCustom: true };
    } catch {
      // fall through
    }
  }

  return rawInputToPlace(rawInput, destination, meta);
}
