import type {
  DayPlan,
  DestinationMedia,
  Place,
  PlaceDetailRecord,
  Trip,
} from "@travel-planner/core";
import { findPlaceImage } from "@/lib/place-image-search";
import { resolvePlaceInput } from "@/lib/place-resolve";

type Locale = "en" | "zh";

async function mapPool<T, R>(items: T[], fn: (item: T) => Promise<R>, limit: number): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

function collectPlaces(days: DayPlan[]): Place[] {
  const byId = new Map<string, Place>();
  for (const day of days) {
    for (const block of day.blocks) {
      for (const p of block.suggestions) byId.set(p.id, p);
      if (block.backupPlace) byId.set(block.backupPlace.id, block.backupPlace);
    }
  }
  return [...byId.values()];
}

function needsEnrichment(place: Place): boolean {
  return !place.imageUrl || place.lat === undefined || place.lng === undefined;
}

function mergePlace(existing: Place, enriched: Place): Place {
  return {
    ...existing,
    lat: enriched.lat ?? existing.lat,
    lng: enriched.lng ?? existing.lng,
    imageUrl: enriched.imageUrl ?? existing.imageUrl,
    imageCredit: enriched.imageCredit ?? existing.imageCredit,
    nameI18n: enriched.nameI18n ?? existing.nameI18n,
    intro: enriched.intro ?? existing.intro,
    neighborhood: enriched.neighborhood ?? existing.neighborhood,
  };
}

function applyEnrichmentToDays(
  days: DayPlan[],
  byName: Map<string, { place: Place; details?: PlaceDetailRecord }>,
  placeDetails: Record<string, PlaceDetailRecord>
): DayPlan[] {
  return days.map((day) => ({
    ...day,
    blocks: day.blocks.map((block) => ({
      ...block,
      suggestions: block.suggestions.map((s) => {
        const hit = byName.get(s.name.toLowerCase().trim());
        if (!hit) return s;
        const merged = mergePlace(s, hit.place);
        if (hit.details) {
          placeDetails[s.id] = { ...placeDetails[s.id], ...hit.details };
        }
        return merged;
      }),
      backupPlace: block.backupPlace
        ? (() => {
            const hit = byName.get(block.backupPlace!.name.toLowerCase().trim());
            if (!hit) return block.backupPlace;
            const merged = mergePlace(block.backupPlace!, hit.place);
            if (hit.details) {
              placeDetails[block.backupPlace!.id] = {
                ...placeDetails[block.backupPlace!.id],
                ...hit.details,
              };
            }
            return merged;
          })()
        : undefined,
    })),
  }));
}

export async function enrichDestinationMedia(
  trip: Trip
): Promise<DestinationMedia | undefined> {
  if (trip.destinationMedia?.poster) return trip.destinationMedia;

  const hero = await findPlaceImage(`${trip.destination} skyline`, trip.destination, {
    kind: "activity",
  });
  if (!hero) return trip.destinationMedia;

  return {
    ...trip.destinationMedia,
    poster: hero.url,
    heroImage: hero.url,
  };
}

export async function enrichTripPlaces(
  trip: Trip,
  days: DayPlan[],
  locale: Locale = "en"
): Promise<{
  days: DayPlan[];
  placeDetails: Record<string, PlaceDetailRecord>;
  destinationMedia?: DestinationMedia;
}> {
  const placeDetails: Record<string, PlaceDetailRecord> = { ...(trip.placeDetails ?? {}) };
  const places = collectPlaces(days);
  const toEnrich = places.filter(needsEnrichment);
  const byName = new Map<string, { place: Place; details?: PlaceDetailRecord }>();

  await mapPool(
    toEnrich,
    async (place) => {
      const key = place.name.toLowerCase().trim();
      if (byName.has(key)) return;
      const resolved = await resolvePlaceInput(
        place.name,
        trip.destination,
        locale,
        trip.country
      );
      byName.set(key, { place: resolved.place, details: resolved.details });
    },
    5
  );

  for (const place of places) {
    if (!needsEnrichment(place) && !placeDetails[place.id] && place.lat && place.lng) {
      placeDetails[place.id] = {
        address: {
          en: place.neighborhood ?? trip.destination,
          zh: place.neighborhood ?? trip.destination,
        },
        relatedInfo: {
          en: place.whyRecommended,
          zh: place.whyRecommended,
        },
      };
    }
  }

  const enrichedDays = applyEnrichmentToDays(days, byName, placeDetails);
  const destinationMedia = await enrichDestinationMedia(trip);

  return { days: enrichedDays, placeDetails, destinationMedia };
}
