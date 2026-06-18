import {
  constraintsToPrompt,
  getSeasonFromDate,
  hasCuratedMockDestination,
  RESEARCH_POOL_TARGET,
  researchCacheSchema,
  stripGenericCandidates,
  type Place,
  type Trip,
} from "@travel-planner/core";
import { generateId } from "../utils";
import { getOpenAI, hasAI } from "./client";
import { getCuratedNeighborhoods, mockResearchCandidates } from "./mock-data";
import { verifyResearchCandidates } from "./verify-candidates";

type ContentLocale = "en" | "zh";

function languageInstruction(locale: ContentLocale = "en"): string {
  if (locale === "zh") {
    return "Write all user-facing text fields in Simplified Chinese (简体中文). Keep place names in their common local form.";
  }
  return "Write all user-facing text in English.";
}

function destinationLabel(trip: Trip): string {
  return trip.country ? `${trip.destination}, ${trip.country}` : trip.destination;
}

export interface ResearchResult {
  candidates: Place[];
  neighborhoods: string[];
}

async function discoverNeighborhoods(
  trip: Trip,
  locale: ContentLocale
): Promise<string[]> {
  if (hasCuratedMockDestination(trip.destination)) {
    return getCuratedNeighborhoods(trip.destination);
  }

  if (!hasAI()) return [];

  const season = getSeasonFromDate(trip.startDate);
  const openai = getOpenAI()!;
  const prompt = `List real neighborhoods, districts, or areas travelers use when visiting ${destinationLabel(trip)}.
Season: ${season}. Interests: ${trip.interests.join(", ")}.
${languageInstruction(locale)}

Return JSON: { "neighborhoods": string[] } with 5-8 REAL area names locals and guides use.
Do NOT use generic labels like "City Center", "Old Town", or "Waterfront" unless that is the official local name.
Include a mix of areas suited to food, culture, and sightseeing.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a travel geography expert. Output valid JSON only." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(content) as { neighborhoods?: string[] };
    const list = (parsed.neighborhoods ?? []).filter((n) => typeof n === "string" && n.trim());
    if (list.length >= 3) return list;
  } catch {
    // fall through
  }
  return [trip.destination];
}

async function fetchCandidatesFromAI(
  trip: Trip,
  neighborhoods: string[],
  locale: ContentLocale,
  options?: { supplemental?: boolean; existingNames?: string[]; neededKinds?: string[] }
): Promise<Place[]> {
  if (!hasAI()) return [];

  const season = getSeasonFromDate(trip.startDate);
  const openai = getOpenAI()!;
  const target = options?.supplemental ? 30 : RESEARCH_POOL_TARGET;
  const foodHeavy = trip.interests.includes("food");

  const supplementalNote = options?.supplemental
    ? `This is a supplemental pass. Add ${target} MORE candidates not in this list: ${JSON.stringify(options.existingNames?.slice(0, 80) ?? [])}.
Focus on: ${options.neededKinds?.join(", ") ?? "under-represented meal slots and neighborhoods"}.`
    : "";

  const prompt = `Research travel recommendations for ${destinationLabel(trip)}.
Neighborhoods / areas to cover: ${JSON.stringify(neighborhoods)}
Season: ${season}. Interests: ${trip.interests.join(", ")}. Pace: ${trip.pace}.
Constraints: ${constraintsToPrompt(trip.constraints)}
${languageInstruction(locale)}
${supplementalNote}

Return JSON: { "candidates": Place[] } with ${target} diverse REAL places (restaurants, cafes, attractions, activities).
Each item: id (unique string), name (real searchable venue name), neighborhood (from the list above), kind (meal|activity|transit|free_time), mealSlot (breakfast|lunch|dinner|snack if meal), whyRecommended (1-2 sentences, no fake ratings), sourceLinks (array), tags (from interests), confidence (widely_recommended|trending_social|local_hidden_gem), localTips (1-2 tips), isCustom (false).

RULES:
- Use ONLY real establishments that exist in ${destinationLabel(trip)}.
- Spread across all listed neighborhoods.
- ${foodHeavy ? "Include strong breakfast, lunch, dinner, and snack coverage." : "Include meals and activities."}
- NEVER use generic placeholder names like "Morning Market Cafe", "City Museum", or "Local Bistro".
- Do not invent street addresses or review scores.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a travel research assistant. Output valid JSON only." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = researchCacheSchema.safeParse(JSON.parse(content));
  if (!parsed.success) return [];

  return parsed.data.candidates.map((c) => ({ ...c, id: c.id || generateId() }));
}

function mergeCandidatePools(primary: Place[], extra: Place[]): Place[] {
  const seen = new Set(primary.map((c) => c.name.toLowerCase().trim()));
  const merged = [...primary];
  for (const place of extra) {
    const key = place.name.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(place);
  }
  return merged;
}

function underRepresentedKinds(candidates: Place[]): string[] {
  const kinds = new Set(candidates.map((c) => c.kind));
  const missing: string[] = [];
  if (!kinds.has("meal")) missing.push("meal");
  if (!kinds.has("activity")) missing.push("activity");
  return missing;
}

export async function runResearchPass(
  trip: Trip,
  locale: ContentLocale = "en"
): Promise<ResearchResult> {
  const curated = hasCuratedMockDestination(trip.destination);
  const mockPool = curated ? mockResearchCandidates(trip, locale) : [];

  if (!hasAI()) {
    return { candidates: mockPool, neighborhoods: getCuratedNeighborhoods(trip.destination) };
  }

  const neighborhoods = await discoverNeighborhoods(trip, locale);
  let raw = await fetchCandidatesFromAI(trip, neighborhoods, locale);
  raw = stripGenericCandidates(raw);

  let verified = await verifyResearchCandidates(trip, raw);
  let attempts = 0;

  while (verified.length < 50 && attempts < 2) {
    attempts++;
    const supplemental = await fetchCandidatesFromAI(trip, neighborhoods, locale, {
      supplemental: true,
      existingNames: verified.map((c) => c.name),
      neededKinds: underRepresentedKinds(verified),
    });
    const extra = stripGenericCandidates(supplemental);
    if (!extra.length) break;
    const moreVerified = await verifyResearchCandidates(trip, extra);
    verified = mergeCandidatePools(verified, moreVerified);
  }

  if (curated && verified.length < 50) {
    verified = mergeCandidatePools(verified, mockPool);
  }

  return { candidates: verified, neighborhoods };
}
