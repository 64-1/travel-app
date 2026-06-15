import type { MealSlot, Place, PlanBlock, Trip } from "./types";
import {
  SUGGESTIONS_PER_BLOCK_MAX,
  SUGGESTIONS_PER_BLOCK_MIN,
} from "./constants";
import { getSelectedPlace } from "./validation";

export interface CurationContext {
  /** Names already chosen on prior days (confirmed picks). */
  usedPlaceNames?: Set<string>;
  /** Names already used within the current day. */
  usedInDay?: Set<string>;
  /** Confirmed picks from earlier days for preference learning. */
  confirmedPicks?: Place[];
  /** Existing AI/user suggestions to preserve and rank first. */
  seedSuggestions?: Place[];
  /** Fresh ID generator for cloned places. */
  newId?: () => string;
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim();
}

export function inferMealSlotFromLabel(label: string): MealSlot | undefined {
  const lower = label.toLowerCase();
  if (lower.includes("breakfast") || lower.includes("早餐")) return "breakfast";
  if (lower.includes("lunch") || lower.includes("午餐")) return "lunch";
  if (lower.includes("dinner") || lower.includes("晚餐")) return "dinner";
  if (
    lower.includes("snack") ||
    lower.includes("tea") ||
    lower.includes("下午茶")
  ) {
    return "snack";
  }
  return undefined;
}

function tagOverlap(a: string[], b: string[]): number {
  const setB = new Set(b);
  return a.filter((t) => setB.has(t)).length;
}

function neighborhoodMatch(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const na = normalizeName(a);
  const nb = normalizeName(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

function vibeConfidenceScore(
  vibe: Trip["constraints"]["vibe"],
  confidence: Place["confidence"]
): number {
  if (vibe === "hidden_gems") {
    if (confidence === "local_hidden_gem") return 4;
    if (confidence === "trending_social") return 2;
    if (confidence === "widely_recommended") return 0;
  }
  if (vibe === "must_see") {
    if (confidence === "widely_recommended") return 4;
    if (confidence === "trending_social") return 2;
    if (confidence === "local_hidden_gem") return 1;
  }
  return confidence === "widely_recommended" ? 2 : 1;
}

function groupTypeScore(
  groupType: Trip["constraints"]["groupType"],
  place: Place
): number {
  if (!groupType) return 0;
  if (groupType === "family" && place.tags.includes("family")) return 3;
  if (groupType === "elderly" && place.kind !== "activity") return 1;
  if (groupType === "couple" && place.tags.includes("food")) return 1;
  return 0;
}

function mobilityScore(
  mobility: Trip["constraints"]["mobility"],
  place: Place
): number {
  if (mobility === "minimal_walking" && place.kind === "free_time") return 2;
  if (mobility === "lots_of_walking" && place.kind === "activity") return 1;
  return 0;
}

function preferenceSimilarity(place: Place, picks: Place[]): number {
  let score = 0;
  for (const pick of picks) {
    score += tagOverlap(place.tags, pick.tags) * 2;
    if (place.kind === pick.kind) score += 1;
    if (place.confidence === pick.confidence) score += 1;
    if (neighborhoodMatch(place.neighborhood, pick.neighborhood)) score += 2;
  }
  return score;
}

export function scoreCandidateForBlock(
  place: Place,
  block: PlanBlock,
  trip: Trip,
  context: CurationContext = {}
): number {
  let score = 0;

  score += tagOverlap(place.tags, trip.interests) * 3;

  const slot = inferMealSlotFromLabel(block.label);
  if (block.kind === "meal" && place.kind === "meal") score += 3;
  if (block.kind !== "meal" && place.kind !== "meal") score += 2;
  if (slot && place.mealSlot === slot) score += 4;

  if (neighborhoodMatch(place.neighborhood, block.neighborhood)) score += 3;

  score += vibeConfidenceScore(trip.constraints.vibe, place.confidence);
  score += groupTypeScore(trip.constraints.groupType, place);
  score += mobilityScore(trip.constraints.mobility, place);

  if (trip.constraints.budget === "budget" && place.confidence === "local_hidden_gem") {
    score += 1;
  }
  if (trip.constraints.budget === "splurge" && place.confidence === "widely_recommended") {
    score += 1;
  }

  for (const item of trip.wishlist) {
    if (!item.place) continue;
    const wish = item.place;
    if (normalizeName(wish.name) === normalizeName(place.name)) {
      score += item.mustInclude ? 20 : 12;
    } else {
      score += tagOverlap(place.tags, wish.tags);
      if (neighborhoodMatch(place.neighborhood, wish.neighborhood)) score += 1;
    }
  }

  if (context.confirmedPicks?.length) {
    score += preferenceSimilarity(place, context.confirmedPicks);
  }

  const used = context.usedPlaceNames ?? new Set<string>();
  if (used.has(normalizeName(place.name))) score -= 15;

  const usedDay = context.usedInDay ?? new Set<string>();
  if (usedDay.has(normalizeName(place.name))) score -= 10;

  if (place.isCustom) score += 2;

  return score;
}

export function extractConfirmedPicks(trip: Trip, beforeDayIndex: number): Place[] {
  const picks: Place[] = [];
  for (const day of trip.days) {
    if (day.dayIndex >= beforeDayIndex) continue;
    for (const block of day.blocks) {
      if (block.status !== "confirmed") continue;
      const place = getSelectedPlace(block);
      if (place) picks.push(place);
    }
  }
  return picks;
}

export function extractUsedPlaceNames(trip: Trip, beforeDayIndex: number): Set<string> {
  const used = new Set<string>();
  for (const day of trip.days) {
    if (day.dayIndex >= beforeDayIndex) continue;
    for (const block of day.blocks) {
      if (block.status !== "confirmed") continue;
      const place = getSelectedPlace(block);
      if (place) used.add(normalizeName(place.name));
    }
  }
  return used;
}

export function curateSuggestionsForBlock(
  block: PlanBlock,
  pool: Place[],
  trip: Trip,
  context: CurationContext = {}
): Place[] {
  const newId = context.newId ?? (() => `cur-${Math.random().toString(36).slice(2, 11)}`);
  const usedInDay = new Set(context.usedInDay ?? []);
  const targetMax = SUGGESTIONS_PER_BLOCK_MAX;
  const targetMin = SUGGESTIONS_PER_BLOCK_MIN;

  const seeds = context.seedSuggestions ?? [];
  const ranked: { place: Place; score: number }[] = [];
  const seen = new Set<string>();

  for (const seed of seeds) {
    const key = normalizeName(seed.name);
    if (seen.has(key)) continue;
    seen.add(key);
    ranked.push({
      place: seed,
      score: scoreCandidateForBlock(seed, block, trip, context) + 50,
    });
  }

  for (const candidate of pool) {
    const key = normalizeName(candidate.name);
    if (seen.has(key)) continue;
    seen.add(key);
    ranked.push({
      place: candidate,
      score: scoreCandidateForBlock(candidate, block, trip, context),
    });
  }

  ranked.sort((a, b) => b.score - a.score);

  const result: Place[] = [];
  for (const { place } of ranked) {
    if (result.length >= targetMax) break;
    const key = normalizeName(place.name);
    if (usedInDay.has(key)) continue;
    result.push({ ...place, id: newId() });
    usedInDay.add(key);
  }

  if (result.length < targetMin) {
    for (const candidate of pool) {
      if (result.length >= targetMin) break;
      const key = normalizeName(candidate.name);
      if (usedInDay.has(key)) continue;
      if (result.some((r) => normalizeName(r.name) === key)) continue;
      result.push({ ...candidate, id: newId() });
      usedInDay.add(key);
    }
  }

  if (context.usedInDay) {
    for (const key of usedInDay) context.usedInDay.add(key);
  }

  return result.slice(0, targetMax);
}
