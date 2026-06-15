import type { DayPlan, Pace, Place, Trip, WishlistItem } from "./types";
import { inferDestinationProfile } from "./pace-rules";

export interface ValidationIssue {
  code: string;
  message: string;
  dayIndex?: number;
  blockId?: string;
}

export function getAllPlaceIdsFromDays(days: DayPlan[]): string[] {
  const ids: string[] = [];
  for (const day of days) {
    for (const block of day.blocks) {
      for (const s of block.suggestions) ids.push(s.id);
      if (block.selectedPlaceId) ids.push(block.selectedPlaceId);
      if (block.backupPlace) ids.push(block.backupPlace.id);
    }
  }
  return ids;
}

export function findDuplicatePlaces(days: DayPlan[]): ValidationIssue[] {
  const seen = new Map<string, number>();
  const issues: ValidationIssue[] = [];

  for (const day of days) {
    for (const block of day.blocks) {
      const placeId = block.selectedPlaceId ?? block.suggestions[0]?.id;
      if (!placeId) continue;
      const prev = seen.get(placeId);
      if (prev !== undefined) {
        issues.push({
          code: "duplicate_place",
          message: `Place appears on day ${prev + 1} and day ${day.dayIndex + 1}`,
          dayIndex: day.dayIndex,
          blockId: block.id,
        });
      } else {
        seen.set(placeId, day.dayIndex);
      }
    }
  }
  return issues;
}

export function validateBlockCount(trip: Trip): ValidationIssue[] {
  const profile = inferDestinationProfile(trip.destination);
  const issues: ValidationIssue[] = [];

  for (const day of trip.days) {
    const expected = profile.suggestedBlockCount[trip.pace];
    const tolerance = 2;
    if (Math.abs(day.blocks.length - expected) > tolerance) {
      issues.push({
        code: "block_count_mismatch",
        message: `Day ${day.dayIndex + 1} has ${day.blocks.length} blocks, expected ~${expected} for ${trip.pace} pace`,
        dayIndex: day.dayIndex,
      });
    }
  }
  return issues;
}

export function validateMustIncludeWishlist(
  wishlist: WishlistItem[],
  days: DayPlan[]
): ValidationIssue[] {
  const mustInclude = wishlist.filter((w) => w.mustInclude && w.place);
  if (!mustInclude.length || !days.length) return [];

  const placedNames = new Set<string>();
  for (const day of days) {
    for (const block of day.blocks) {
      for (const s of block.suggestions) placedNames.add(s.name.toLowerCase());
      if (block.selectedPlaceId) {
        const selected = block.suggestions.find((s) => s.id === block.selectedPlaceId);
        if (selected) placedNames.add(selected.name.toLowerCase());
      }
    }
  }

  const issues: ValidationIssue[] = [];
  for (const item of mustInclude) {
    const name = item.place!.name.toLowerCase();
    if (!placedNames.has(name)) {
      issues.push({
        code: "must_include_missing",
        message: `Must-include "${item.place!.name}" not found in itinerary`,
      });
    }
  }
  return issues;
}

export function validateSuggestionCounts(days: DayPlan[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const day of days) {
    for (const block of day.blocks) {
      if (block.status === "skipped") continue;
      if (block.suggestions.length === 1) continue;
      if (block.suggestions.length < 5) {
        issues.push({
          code: "insufficient_suggestions",
          message: `Day ${day.dayIndex + 1} block "${block.label}" has ${block.suggestions.length} suggestions (expected at least 5)`,
          dayIndex: day.dayIndex,
          blockId: block.id,
        });
      }
    }
  }
  return issues;
}

export function validateTrip(trip: Trip): ValidationIssue[] {
  return [
    ...findDuplicatePlaces(trip.days),
    ...validateBlockCount(trip),
    ...validateMustIncludeWishlist(trip.wishlist, trip.days),
    ...validateSuggestionCounts(trip.days),
  ];
}

export function dedupeSuggestionsAcrossDays(days: DayPlan[]): DayPlan[] {
  const usedPlaceNames = new Set<string>();

  return days.map((day) => ({
    ...day,
    blocks: day.blocks.map((block) => {
      const filtered = block.suggestions.filter((s) => {
        const key = s.name.toLowerCase();
        if (usedPlaceNames.has(key)) return false;
        return true;
      });

      const selected = block.selectedPlaceId
        ? filtered.find((s) => s.id === block.selectedPlaceId) ?? filtered[0]
        : filtered[0];

      if (selected) usedPlaceNames.add(selected.name.toLowerCase());

      return {
        ...block,
        suggestions: filtered.length ? filtered : block.suggestions,
        selectedPlaceId: selected?.id,
      };
    }),
  }));
}

export function countTripDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

export function dateForDayIndex(startDate: string, dayIndex: number): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayIndex);
  return d.toISOString().split("T")[0];
}

export function getSelectedPlace(block: { suggestions: Place[]; selectedPlaceId?: string }): Place | undefined {
  if (block.selectedPlaceId) {
    const selected = block.suggestions.find((s) => s.id === block.selectedPlaceId);
    if (selected) return selected;
  }
  return block.suggestions[0];
}

export function paceLabel(pace: Pace): string {
  return { relaxed: "Relaxed", balanced: "Balanced", packed: "Packed" }[pace];
}
