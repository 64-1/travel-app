import type { Trip, Place } from "@travel-planner/core";
import { getSelectedPlace } from "@travel-planner/core";

export interface MapStop {
  place: Place;
  index: number;
  dayIndex: number;
}

export function getTripMapStops(trip: Trip, dayIndex?: number): MapStop[] {
  const stops: MapStop[] = [];
  let globalIndex = 0;

  for (const day of trip.days) {
    if (dayIndex !== undefined && day.dayIndex !== dayIndex) continue;

    for (const block of day.blocks) {
      if (block.status === "skipped") continue;
      const place = getSelectedPlace(block);
      if (!place?.lat || !place?.lng) continue;
      globalIndex += 1;
      stops.push({
        place,
        index: dayIndex !== undefined ? stops.length + 1 : globalIndex,
        dayIndex: day.dayIndex,
      });
    }
  }

  return stops;
}
