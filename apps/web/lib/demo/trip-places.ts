import type { Trip, Place } from "@travel-planner/core";
import { getSelectedPlace } from "@travel-planner/core";

export function findPlaceInTrip(
  trip: Trip,
  placeId: string
): { place: Place; dayIndex: number; label: string } | undefined {
  for (const day of trip.days) {
    for (const block of day.blocks) {
      if (block.status === "skipped") continue;
      const place = getSelectedPlace(block);
      if (place?.id === placeId) {
        return { place, dayIndex: day.dayIndex, label: block.label };
      }
    }
  }
  return undefined;
}
