import type { LocalizedText } from "@travel-planner/core";
import { getOpenAI, hasAI } from "@/lib/ai/client";

export async function fetchPlaceAbout(
  placeName: string,
  destination: string,
  locale: "en" | "zh" = "en"
): Promise<LocalizedText | null> {
  if (!hasAI()) {
    return {
      en: `${placeName} is a popular stop in ${destination}.`,
      zh: `${placeName}是${destination}的热门地点。`,
    };
  }

  const openai = getOpenAI()!;
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Write exactly 2 informative sentences about "${placeName}" in ${destination} for travelers.
Return JSON: { "en": "...", "zh": "..." }
No fake ratings or prices. ${locale === "zh" ? "Make zh natural Simplified Chinese." : ""}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  try {
    const parsed = JSON.parse(response.choices[0]?.message?.content ?? "{}") as LocalizedText;
    if (parsed.en && parsed.zh) return parsed;
  } catch {
    // fall through
  }
  return null;
}

export async function enrichTripPlaceAbout(
  trip: { destination: string; placeAbout?: Record<string, LocalizedText> },
  placeIds: string[],
  placeNames: Record<string, string>,
  locale: "en" | "zh" = "en"
): Promise<Record<string, LocalizedText>> {
  const about = { ...(trip.placeAbout ?? {}) };
  const missing = placeIds.filter((id) => !about[id]).slice(0, 12);

  for (const id of missing) {
    const name = placeNames[id];
    if (!name) continue;
    const text = await fetchPlaceAbout(name, trip.destination, locale);
    if (text) about[id] = text;
  }

  return about;
}
