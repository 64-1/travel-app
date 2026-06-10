import {
  aiDayPlanResponseSchema,
  buildResearchCacheKey,
  constraintsToPrompt,
  dedupeSuggestionsAcrossDays,
  getSeasonFromDate,
  researchCacheSchema,
  validateTrip,
  countTripDays,
  dateForDayIndex,
  type Trip,
  type DayPlan,
  type Place,
} from "@travel-planner/core";
import { prisma } from "../db";
import { generateId } from "../utils";
import { getOpenAI, hasAI } from "./client";
import { mockGenerateDays, mockResearchCandidates } from "./mock-data";
import { rawInputToPlace, fetchPageMeta } from "../enrich";

type ContentLocale = "en" | "zh";

function languageInstruction(locale: ContentLocale = "en"): string {
  if (locale === "zh") {
    return "Write all user-facing text fields (whyRecommended, localTips, labels, themes) in Simplified Chinese (简体中文). Keep place names in their common local form.";
  }
  return "Write all user-facing text in English.";
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
  const season = getSeasonFromDate(trip.startDate);
  const cacheKey = buildResearchCacheKey(trip.destination, trip.interests, season);
  const cached = await getCachedResearch(cacheKey);
  if (cached) return cached;

  if (!hasAI()) {
    const candidates = mockResearchCandidates(trip, locale);
    await setCachedResearch(cacheKey, candidates);
    return candidates;
  }

  const openai = getOpenAI()!;
  const prompt = `Research travel recommendations for ${trip.destination}${trip.country ? `, ${trip.country}` : ""}.
Season: ${season}. Interests: ${trip.interests.join(", ")}.
Constraints: ${constraintsToPrompt(trip.constraints)}
${languageInstruction(locale)}

Return a JSON object with key "candidates" — an array of 12-20 places/restaurants/activities.
Each item must have: id (unique string), name, neighborhood, kind (meal|activity|transit|free_time), mealSlot (breakfast|lunch|dinner|snack if meal), whyRecommended (1-2 sentences, no fake star ratings), sourceLinks (array, can be empty), tags (from interests), confidence (widely_recommended|trending_social|local_hidden_gem), localTips (array of 1-2 tips), isCustom (false).

Never invent exact street addresses. Do not fabricate review scores.`;

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
  const mustInclude = trip.wishlist
    .filter((w) => w.mustInclude && w.place)
    .map((w) => w.place!);

  const existingDays = trip.days.filter((d) => d.dayIndex < fromDay);

  const prompt = `Create day plans for ${trip.destination}, days ${fromDay + 1} to ${toDay + 1} (0-indexed: ${fromDay} to ${toDay}).
Trip pace: ${trip.pace}. Interests: ${trip.interests.join(", ")}.
Constraints: ${constraintsToPrompt(trip.constraints)}
Must-include places (schedule these first on day ${fromDay + 1}): ${JSON.stringify(mustInclude.map((p) => p.name))}
Existing days already planned: ${existingDays.length}
Candidates pool: ${JSON.stringify(candidates.slice(0, 15).map((c) => ({ name: c.name, neighborhood: c.neighborhood, kind: c.kind })))}

Return JSON: { "days": [ DayPlan[] ] }
Each DayPlan: dayIndex, date (${dateForDayIndex(trip.startDate, fromDay)} format), theme, neighborhoods (ordered), blocks.
Each block: id, kind, label (e.g. "Breakfast in Shibuya"), neighborhood, suggestions (2-3 places from candidates with full fields), backupPlace (optional), status "suggested".
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
  const parsed = aiDayPlanResponseSchema.safeParse(JSON.parse(content));

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

function validationPass(trip: Trip, newDays: DayPlan[]): DayPlan[] {
  const merged = [...trip.days.filter((d) => !newDays.some((n) => n.dayIndex === d.dayIndex)), ...newDays].sort(
    (a, b) => a.dayIndex - b.dayIndex
  );
  const deduped = dedupeSuggestionsAcrossDays(merged);
  const testTrip = { ...trip, days: deduped };
  const issues = validateTrip(testTrip);
  if (issues.length > 0) {
    console.warn("Validation issues:", issues);
  }
  return deduped.filter((d) => newDays.some((n) => n.dayIndex === d.dayIndex));
}

export async function enrichWishlistItem(
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

export async function generateTripDays(
  trip: Trip,
  fromDay: number = 0,
  locale: ContentLocale = "en"
): Promise<{ days: DayPlan[]; daysGenerated: number }> {
  const totalDays = countTripDays(trip.startDate, trip.endDate);
  const toDay = fromDay === 0 ? 0 : totalDays - 1;

  const candidates = await researchPass(trip, locale);
  const newDays = await planningPass(trip, candidates, fromDay, toDay, locale);
  const validated = validationPass(trip, newDays);

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

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `${scopeDesc} for ${trip.destination}. Reason: ${feedback}.
Current day: ${JSON.stringify(day)}
Candidates: ${JSON.stringify(candidates.slice(0, 12).map((c) => c.name))}
Return JSON: { "days": [single DayPlan] } with 2-3 suggestions per block. Keep confirmed blocks unchanged if blockId specified.
${languageInstruction(locale)}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const parsed = aiDayPlanResponseSchema.safeParse(
    JSON.parse(response.choices[0]?.message?.content ?? "{}")
  );

  if (parsed.success && parsed.data.days[0]) {
    const newDay = parsed.data.days[0];
    return trip.days.map((d) => (d.dayIndex === dayIndex ? newDay : d));
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
