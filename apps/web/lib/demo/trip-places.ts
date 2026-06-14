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

export function collectAllPlacesFromTrip(trip: Trip): Place[] {
  const byId = new Map<string, Place>();
  for (const day of trip.days) {
    for (const block of day.blocks) {
      if (block.status === "skipped") continue;
      for (const p of block.suggestions) byId.set(p.id, p);
      const selected = getSelectedPlace(block);
      if (selected) byId.set(selected.id, selected);
      if (block.backupPlace) byId.set(block.backupPlace.id, block.backupPlace);
    }
  }
  return [...byId.values()];
}
