import {
  aiDayPlanDraftSchema,
  buildResearchCacheKeyForTrip,
  cacheRemovalRatio,
  constraintsToPrompt,
  curateSuggestionsForBlock,
  dedupeSuggestionsAcrossDays,
  extractConfirmedPicks,
  extractUsedPlaceNames,
  inferDestinationProfile,
  hasCuratedMockDestination,
  RESEARCH_POOL_MIN,
  researchCacheSchema,
  stripGenericCandidates,
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
import { mockGenerateDays } from "./mock-data";
import { runResearchPass, type ResearchResult } from "./research";

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

function allowMockFallback(trip: Trip): boolean {
  return !hasAI() || hasCuratedMockDestination(trip.destination);
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
        return {
          ...block,
          suggestions,
          selectedPlaceId: suggestions[0]?.id,
        };
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

async function getCachedResearch(key: string): Promise<ResearchResult | null> {
  const row = await prisma.researchCache.findUnique({ where: { cacheKey: key } });
  if (!row || row.expiresAt < new Date()) return null;
  const parsed = researchCacheSchema.safeParse(JSON.parse(row.data));
  if (!parsed.success) return null;
  return {
    candidates: parsed.data.candidates,
    neighborhoods: parsed.data.neighborhoods,
  };
}

async function setCachedResearch(
  key: string,
  candidates: Place[],
  neighborhoods: string[]
): Promise<void> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const payload = JSON.stringify({ candidates, neighborhoods });
  await prisma.researchCache.upsert({
    where: { cacheKey: key },
    create: { cacheKey: key, data: payload, expiresAt },
    update: { data: payload, expiresAt },
  });
}

function isCacheUsable(cached: ResearchResult, curated: boolean): boolean {
  const stripped = stripGenericCandidates(cached.candidates);
  const removalRatio = cacheRemovalRatio(cached.candidates, stripped);
  if (removalRatio > 0.1) return false;
  const minRequired = curated ? 40 : RESEARCH_POOL_MIN;
  return stripped.length >= minRequired;
}

async function researchPass(
  trip: Trip,
  locale: ContentLocale = "en"
): Promise<ResearchResult> {
  const cacheKey = buildResearchCacheKeyForTrip(trip);
  const curated = hasCuratedMockDestination(trip.destination);
  const cached = await getCachedResearch(cacheKey);

  if (cached && isCacheUsable(cached, curated)) {
    return {
      candidates: stripGenericCandidates(cached.candidates),
      neighborhoods: cached.neighborhoods,
    };
  }

  const result = await runResearchPass(trip, locale);
  const stripped = stripGenericCandidates(result.candidates);
  const minToCache = curated ? 40 : RESEARCH_POOL_MIN;

  if (stripped.length >= minToCache) {
    await setCachedResearch(cacheKey, stripped, result.neighborhoods);
    return { candidates: stripped, neighborhoods: result.neighborhoods };
  }

  return { candidates: stripped, neighborhoods: result.neighborhoods };
}

function normalizePlannedDays(
  planned: DayPlan[],
  trip: Trip,
  fromDay: number,
  toDay: number,
  locale: ContentLocale
): DayPlan[] {
  if (!planned.length) {
    return allowMockFallback(trip) ? mockGenerateDays(trip, fromDay, toDay, locale) : [];
  }

  const normalized = planned.map((day, i) => {
    const dayIndex = fromDay === toDay ? fromDay : (day.dayIndex ?? fromDay + i);
    return {
      ...day,
      dayIndex,
      date: day.date ?? dateForDayIndex(trip.startDate, dayIndex),
      blocks: day.blocks.map((b) => ({
        ...b,
        id: b.id || generateId(),
        suggestions: b.suggestions.map((s) => ({ ...s, id: s.id || generateId() })),
      })),
    };
  });

  const targetDay = normalized.find((d) => d.dayIndex === fromDay);
  if (!targetDay || targetDay.blocks.length === 0) {
    return allowMockFallback(trip) ? mockGenerateDays(trip, fromDay, toDay, locale) : [];
  }

  return normalized;
}

async function planningPass(
  trip: Trip,
  candidates: Place[],
  neighborhoods: string[],
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
  const profile = inferDestinationProfile(trip.destination);
  const poolForPrompt = researchedOnly.slice(0, 60);

  const prompt = `Create day plans for ${trip.destination}${trip.country ? `, ${trip.country}` : ""}, days ${fromDay + 1} to ${toDay + 1} (0-indexed: ${fromDay} to ${toDay}).
Destination profile: ${profile.type} (pace blocks: ${profile.suggestedBlockCount[trip.pace]}).
Trip pace: ${trip.pace}. Interests: ${trip.interests.join(", ")}.
Constraints: ${constraintsToPrompt(trip.constraints)}
Neighborhoods to use (real areas only): ${JSON.stringify(neighborhoods)}
User saved spots (from Xiaohongshu/links — schedule in fitting slots on day ${fromDay + 1}): ${JSON.stringify(savedSpots.map((p) => p.name))}
Must-visit (required in itinerary): ${JSON.stringify(mustInclude.map((p) => p.name))}
Confirmed picks from earlier days (match this taste when possible): ${confirmedPicks}
Existing days already planned: ${existingDays.length}
Research candidates pool (curated alternatives — rank by user fit): ${JSON.stringify(poolForPrompt.map((c) => ({ name: c.name, neighborhood: c.neighborhood, kind: c.kind, mealSlot: c.mealSlot, tags: c.tags })))}

Return JSON: { "days": [ DayPlan[] ] }
Each DayPlan: dayIndex, date (${dateForDayIndex(trip.startDate, fromDay)} format), theme, neighborhoods (ordered, from the neighborhoods list), blocks.
Each block: id, kind, label (reference a real neighborhood, e.g. "Breakfast in Queenstown"), neighborhood, suggestions (${SUGGESTIONS_PER_BLOCK_MIN}-${SUGGESTIONS_PER_BLOCK_MAX} places with full fields, best match first), backupPlace (optional), status "suggested".
IMPORTANT: Every block must have ${SUGGESTIONS_PER_BLOCK_MIN}-${SUGGESTIONS_PER_BLOCK_MAX} suggestions ranked for this traveler. At most one suggestion per block may be a user saved spot; the rest from the research pool (no duplicate names within a block).
Theme and block labels MUST use real neighborhood/area names from the list — never "City Center", "Old Town", or "Waterfront" unless they are official local names.
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

  if (parsed.success && parsed.data.days.length > 0) {
    return normalizePlannedDays(parsed.data.days, trip, fromDay, toDay, locale);
  }

  return allowMockFallback(trip) ? mockGenerateDays(trip, fromDay, toDay, locale) : [];
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

  const { candidates: researched, neighborhoods } = await researchPass(trip, locale);
  const candidates = mergeWishlistIntoCandidates(trip, researched);
  const planned = await planningPass(trip, candidates, neighborhoods, fromDay, toDay, locale);
  const withAlternatives = ensureBlockSuggestionCount(planned, candidates, trip, fromDay);
  const validated = validationPass(trip, withAlternatives, candidates, fromDay);

  const allDays = [
    ...trip.days.filter((d) => !validated.some((v) => v.dayIndex === d.dayIndex)),
    ...validated,
  ].sort((a, b) => a.dayIndex - b.dayIndex);

  const daysGenerated = allDays.length
    ? Math.max(trip.daysGenerated, ...allDays.map((d) => d.dayIndex + 1))
    : trip.daysGenerated;

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

  const { candidates, neighborhoods } = await researchPass(trip, locale);
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
        content: `${scopeDesc} for ${trip.destination}${trip.country ? `, ${trip.country}` : ""}. Reason: ${feedback}.
Trip interests: ${trip.interests.join(", ")}. Constraints: ${constraintsToPrompt(trip.constraints)}
Neighborhoods to use: ${JSON.stringify(neighborhoods)}
Confirmed picks from earlier days: ${confirmedPicks}
Current day: ${JSON.stringify(day)}
Candidates: ${JSON.stringify(candidates.slice(0, 60).map((c) => ({ name: c.name, kind: c.kind, neighborhood: c.neighborhood })))}
Return JSON: { "days": [single DayPlan] } with ${SUGGESTIONS_PER_BLOCK_MIN}-${SUGGESTIONS_PER_BLOCK_MAX} ranked suggestions per block (best match first). Use real neighborhood names only. Keep confirmed blocks unchanged if blockId specified.
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

  if (allowMockFallback(trip)) {
    const refreshed = mockGenerateDays(trip, dayIndex, dayIndex, locale);
    return trip.days.map((d) => (d.dayIndex === dayIndex ? refreshed[0] : d));
  }

  return trip.days;
}

export const GENERATION_STATUS_MESSAGES = [
  "Researching top spots and restaurants…",
  "Reading travel guides and reviews…",
  "Clustering neighborhoods for easy flow…",
  "Building your flexible day plan…",
  "Adding backup options and local tips…",
  "Validating your itinerary…",
];
