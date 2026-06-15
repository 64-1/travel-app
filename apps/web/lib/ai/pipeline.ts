import {
  aiDayPlanDraftSchema,
  buildResearchCacheKeyForTrip,
  constraintsToPrompt,
  curateSuggestionsForBlock,
  dedupeSuggestionsAcrossDays,
  extractConfirmedPicks,
  extractUsedPlaceNames,
  getSeasonFromDate,
  researchCacheSchema,
  SUGGESTIONS_PER_BLOCK_MAX,
  SUGGESTIONS_PER_BLOCK_MIN,
  validateTrip,
  dateForDayIndex,
  type Trip,
  type DayPlan,
  type Place,
} from "@travel-planner/core";
import { prisma } from "../db";
import { generateId } from "../utils";
import { getOpenAI, hasAI } from "./client";
import { mockGenerateDays, mockResearchCandidates } from "./mock-data";

type ContentLocale = "en" | "zh";

function languageInstruction(locale: ContentLocale = "en"): string {
  if (locale === "zh") {
    return "Write all user-facing text fields (whyRecommended, localTips, labels, themes) in Simplified Chinese (简体中文). Keep place names in their common local form.";
  }
  return "Write all user-facing text in English.";
}

function normalizePlaceName(name: string): string {
  return name.toLowerCase().trim();
}

/** User-saved spots + researched candidates — saved spots never replace the research pool */
function mergeWishlistIntoCandidates(trip: Trip, candidates: Place[]): Place[] {
  const saved = trip.wishlist.filter((w) => w.place).map((w) => w.place!);
  const seen = new Set<string>();
  const merged: Place[] = [];

  for (const place of [...saved, ...candidates]) {
    const key = normalizePlaceName(place.name);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(place);
  }
  return merged;
}

/** Ensure every block has 5–7 ranked, personalized suggestions. */
function ensureBlockSuggestionCount(
  days: DayPlan[],
  pool: Place[],
  trip: Trip,
  fromDay: number
): DayPlan[] {
  const usedPlaceNames = extractUsedPlaceNames(trip, fromDay);
  const confirmedPicks = extractConfirmedPicks(trip, fromDay);

  return days.map((day) => {
    const usedInDay = new Set<string>();
    return {
      ...day,
      blocks: day.blocks.map((block) => {
        if (block.status === "skipped") return block;
        const suggestions = curateSuggestionsForBlock(block, pool, trip, {
          seedSuggestions: block.suggestions,
          usedPlaceNames,
          usedInDay,
          confirmedPicks,
          newId: generateId,
        });
        return { ...block, suggestions };
      }),
    };
  });
}

function formatConfirmedPicksForPrompt(trip: Trip, fromDay: number): string {
  const picks = extractConfirmedPicks(trip, fromDay);
  if (!picks.length) return "None yet.";
  return JSON.stringify(
    picks.map((p) => ({
      name: p.name,
      neighborhood: p.neighborhood,
      kind: p.kind,
      tags: p.tags,
      confidence: p.confidence,
    }))
  );
}

async function getCachedResearch(key: string): Promise<Place[] | null> {
  const row = await prisma.researchCache.findUnique({ where: { cacheKey: key } });
  if (!row || row.expiresAt < new Date()) return null;
  const parsed = researchCacheSchema.safeParse(JSON.parse(row.data));
  return parsed.success ? parsed.data.candidates : null;
}

async function setCachedResearch(key: string, candidates: Place[]): Promise<void> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.researchCache.upsert({
    where: { cacheKey: key },
    create: {
      cacheKey: key,
      data: JSON.stringify({ candidates, neighborhoods: [] }),
      expiresAt,
    },
    update: {
      data: JSON.stringify({ candidates, neighborhoods: [] }),
      expiresAt,
    },
  });
}

async function researchPass(trip: Trip, locale: ContentLocale = "en"): Promise<Place[]> {
  const cacheKey = buildResearchCacheKeyForTrip(trip);
  const cached = await getCachedResearch(cacheKey);
  if (cached) return cached;

  if (!hasAI()) {
    const candidates = mockResearchCandidates(trip, locale);
    await setCachedResearch(cacheKey, candidates);
    return candidates;
  }

  const season = getSeasonFromDate(trip.startDate);
  const openai = getOpenAI()!;
  const prompt = `Research travel recommendations for ${trip.destination}${trip.country ? `, ${trip.country}` : ""}.
Season: ${season}. Interests: ${trip.interests.join(", ")}. Pace: ${trip.pace}.
Constraints: ${constraintsToPrompt(trip.constraints)}
${languageInstruction(locale)}

Return a JSON object with key "candidates" — an array of 50-60 diverse places/restaurants/activities across many neighborhoods.
Each item must have: id (unique string), name, neighborhood, kind (meal|activity|transit|free_time), mealSlot (breakfast|lunch|dinner|snack if meal), whyRecommended (1-2 sentences, no fake star ratings), sourceLinks (array, can be empty), tags (from interests), confidence (widely_recommended|trending_social|local_hidden_gem), localTips (array of 1-2 tips), isCustom (false).

Include a mix of confidence levels and meal slots. Never invent exact street addresses. Do not fabricate review scores.`;

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
  const candidates = parsed.success
    ? parsed.data.candidates.map((c) => ({ ...c, id: c.id || generateId() }))
    : mockResearchCandidates(trip, locale);

  await setCachedResearch(cacheKey, candidates);
  return candidates;
}

async function planningPass(
  trip: Trip,
  candidates: Place[],
  fromDay: number,
  toDay: number,
  locale: ContentLocale = "en"
): Promise<DayPlan[]> {
  if (!hasAI()) {
    return mockGenerateDays(trip, fromDay, toDay, locale);
  }

  const openai = getOpenAI()!;
  const savedSpots = trip.wishlist.filter((w) => w.place).map((w) => w.place!);
  const mustInclude = savedSpots.filter((p) =>
    trip.wishlist.some((w) => w.mustInclude && w.place?.id === p.id)
  );

  const existingDays = trip.days.filter((d) => d.dayIndex < fromDay);
  const researchedOnly = candidates.filter(
    (c) => !savedSpots.some((s) => normalizePlaceName(s.name) === normalizePlaceName(c.name))
  );

  const confirmedPicks = formatConfirmedPicksForPrompt(trip, fromDay);

  const prompt = `Create day plans for ${trip.destination}, days ${fromDay + 1} to ${toDay + 1} (0-indexed: ${fromDay} to ${toDay}).
Trip pace: ${trip.pace}. Interests: ${trip.interests.join(", ")}.
Constraints: ${constraintsToPrompt(trip.constraints)}
User saved spots (from Xiaohongshu/links — schedule in fitting slots on day ${fromDay + 1}): ${JSON.stringify(savedSpots.map((p) => p.name))}
Must-visit (required in itinerary): ${JSON.stringify(mustInclude.map((p) => p.name))}
Confirmed picks from earlier days (match this taste when possible): ${confirmedPicks}
Existing days already planned: ${existingDays.length}
Research candidates pool (curated alternatives — rank by user fit): ${JSON.stringify(researchedOnly.slice(0, 40).map((c) => ({ name: c.name, neighborhood: c.neighborhood, kind: c.kind, mealSlot: c.mealSlot, tags: c.tags })))}

Return JSON: { "days": [ DayPlan[] ] }
Each DayPlan: dayIndex, date (${dateForDayIndex(trip.startDate, fromDay)} format), theme, neighborhoods (ordered), blocks.
Each block: id, kind, label (e.g. "Breakfast in Shibuya"), neighborhood, suggestions (${SUGGESTIONS_PER_BLOCK_MIN}-${SUGGESTIONS_PER_BLOCK_MAX} places with full fields, best match first), backupPlace (optional), status "suggested".
IMPORTANT: Every block must have ${SUGGESTIONS_PER_BLOCK_MIN}-${SUGGESTIONS_PER_BLOCK_MAX} suggestions ranked for this traveler. At most one suggestion per block may be a user saved spot; the rest from the research pool (no duplicate names within a block).
Cluster by neighborhood. Lunch near morning area. No duplicate places across days.
Do not use minute-by-minute times.
${languageInstruction(locale)}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an itinerary planner. Output valid JSON matching the schema." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = aiDayPlanDraftSchema.safeParse(JSON.parse(content));

  if (parsed.success) {
    return parsed.data.days.map((day) => ({
      ...day,
      date: day.date ?? dateForDayIndex(trip.startDate, day.dayIndex),
      blocks: day.blocks.map((b) => ({
        ...b,
        id: b.id || generateId(),
        suggestions: b.suggestions.map((s) => ({ ...s, id: s.id || generateId() })),
      })),
    }));
  }

  return mockGenerateDays(trip, fromDay, toDay, locale);
}

function validationPass(
  trip: Trip,
  newDays: DayPlan[],
  pool: Place[],
  fromDay: number
): DayPlan[] {
  const merged = [...trip.days.filter((d) => !newDays.some((n) => n.dayIndex === d.dayIndex)), ...newDays].sort(
    (a, b) => a.dayIndex - b.dayIndex
  );
  const deduped = dedupeSuggestionsAcrossDays(merged);
  const newDayIndices = new Set(newDays.map((d) => d.dayIndex));
  const toRefill = deduped.filter((d) => newDayIndices.has(d.dayIndex));
  const refilled = ensureBlockSuggestionCount(toRefill, pool, trip, fromDay);
  const finalDays = deduped.map((d) => refilled.find((r) => r.dayIndex === d.dayIndex) ?? d);
  const testTrip = { ...trip, days: finalDays };
  const issues = validateTrip(testTrip);
  if (issues.length > 0) {
    console.warn("Validation issues:", issues);
  }
  return finalDays.filter((d) => newDayIndices.has(d.dayIndex));
}

export async function enrichWishlistItem(
  rawInput: string,
  destination?: string,
  locale: ContentLocale = "en"
): Promise<Place> {
  const { resolvePlaceInput } = await import("../place-resolve");
  const { place } = await resolvePlaceInput(rawInput, destination ?? "Unknown", locale);
  return place;
}

export async function generateTripDays(
  trip: Trip,
  fromDay: number = 0,
  locale: ContentLocale = "en"
): Promise<{ days: DayPlan[]; daysGenerated: number }> {
  const toDay = fromDay;

  const researched = await researchPass(trip, locale);
  const candidates = mergeWishlistIntoCandidates(trip, researched);
  const planned = await planningPass(trip, candidates, fromDay, toDay, locale);
  const withAlternatives = ensureBlockSuggestionCount(planned, candidates, trip, fromDay);
  const validated = validationPass(trip, withAlternatives, candidates, fromDay);

  const allDays = [
    ...trip.days.filter((d) => !validated.some((v) => v.dayIndex === d.dayIndex)),
    ...validated,
  ].sort((a, b) => a.dayIndex - b.dayIndex);

  const daysGenerated = Math.max(trip.daysGenerated, ...allDays.map((d) => d.dayIndex + 1));

  return { days: allDays, daysGenerated };
}

export async function regenerateScope(
  trip: Trip,
  dayIndex: number,
  blockId: string | undefined,
  reason: string,
  customFeedback?: string,
  locale: ContentLocale = "en"
): Promise<DayPlan[]> {
  const reasonText: Record<string, string> = {
    too_touristy: "less touristy, more authentic",
    more_local: "more local favorites",
    rainy_day: "indoor activities and covered areas",
    indoor: "indoor options",
    tired: "lighter pace, fewer activities",
    lighter_pace: "lighter pace",
    more_food: "more food-focused options",
    kid_friendly: "family and kid-friendly options",
    custom: customFeedback ?? "alternative options",
  };

  const feedback = reasonText[reason] ?? customFeedback ?? "alternative options";
  const day = trip.days.find((d) => d.dayIndex === dayIndex);
  if (!day) return trip.days;

  if (!hasAI()) {
    const refreshed = mockGenerateDays(trip, dayIndex, dayIndex, locale);
    return trip.days.map((d) => (d.dayIndex === dayIndex ? refreshed[0] : d));
  }

  const candidates = await researchPass(trip, locale);
  const openai = getOpenAI()!;

  const scopeDesc = blockId
    ? `Regenerate only block ${blockId} on day ${dayIndex + 1}`
    : `Regenerate entire day ${dayIndex + 1}`;

  const confirmedPicks = formatConfirmedPicksForPrompt(trip, dayIndex);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `${scopeDesc} for ${trip.destination}. Reason: ${feedback}.
Trip interests: ${trip.interests.join(", ")}. Constraints: ${constraintsToPrompt(trip.constraints)}
Confirmed picks from earlier days: ${confirmedPicks}
Current day: ${JSON.stringify(day)}
Candidates: ${JSON.stringify(candidates.slice(0, 40).map((c) => ({ name: c.name, kind: c.kind, neighborhood: c.neighborhood })))}
Return JSON: { "days": [single DayPlan] } with ${SUGGESTIONS_PER_BLOCK_MIN}-${SUGGESTIONS_PER_BLOCK_MAX} ranked suggestions per block (best match first). Keep confirmed blocks unchanged if blockId specified.
${languageInstruction(locale)}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const parsed = aiDayPlanDraftSchema.safeParse(
    JSON.parse(response.choices[0]?.message?.content ?? "{}")
  );

  if (parsed.success && parsed.data.days[0]) {
    const newDay = parsed.data.days[0];
    const curatedDay = ensureBlockSuggestionCount([newDay], candidates, trip, dayIndex)[0];
    return trip.days.map((d) => (d.dayIndex === dayIndex ? curatedDay : d));
  }

  const refreshed = mockGenerateDays(trip, dayIndex, dayIndex, locale);
  return trip.days.map((d) => (d.dayIndex === dayIndex ? refreshed[0] : d));
}

export const GENERATION_STATUS_MESSAGES = [
  "Researching top spots and restaurants…",
  "Reading travel guides and reviews…",
  "Clustering neighborhoods for easy flow…",
  "Building your flexible day plan…",
  "Adding backup options and local tips…",
  "Validating your itinerary…",
];
