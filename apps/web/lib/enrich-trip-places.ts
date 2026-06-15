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

function collectPlacesPrioritized(days: DayPlan[]): Place[] {
  const top: Place[] = [];
  const rest: Place[] = [];
  const seenIds = new Set<string>();

  for (const day of days) {
    for (const block of day.blocks) {
      if (block.status === "skipped") continue;
      const first = block.suggestions[0];
      if (first && !seenIds.has(first.id)) {
        top.push(first);
        seenIds.add(first.id);
      }
    }
  }

  for (const day of days) {
    for (const block of day.blocks) {
      for (let i = 1; i < block.suggestions.length; i++) {
        const p = block.suggestions[i];
        if (!seenIds.has(p.id)) {
          rest.push(p);
          seenIds.add(p.id);
        }
      }
      if (block.backupPlace && !seenIds.has(block.backupPlace.id)) {
        rest.push(block.backupPlace);
        seenIds.add(block.backupPlace.id);
      }
    }
  }

  return [...top, ...rest];
}

/** Top-ranked suggestion per block first — for about-text enrichment cap. */
export function getPrioritizedPlaceIds(days: DayPlan[]): string[] {
  const placeNames: Record<string, string> = {};
  const ordered: string[] = [];
  const seen = new Set<string>();

  for (const day of days) {
    for (const block of day.blocks) {
      if (block.status === "skipped") continue;
      const top = block.suggestions[0];
      if (top && !seen.has(top.id)) {
        ordered.push(top.id);
        seen.add(top.id);
        placeNames[top.id] = top.name;
      }
      for (const p of block.suggestions) {
        placeNames[p.id] = p.name;
      }
    }
  }

  for (const id of Object.keys(placeNames)) {
    if (!seen.has(id)) ordered.push(id);
  }

  return ordered;
}

export function collectPlaceNamesFromDays(days: DayPlan[]): Record<string, string> {
  const placeNames: Record<string, string> = {};
  for (const day of days) {
    for (const block of day.blocks) {
      for (const p of block.suggestions) placeNames[p.id] = p.name;
    }
  }
  return placeNames;
}

/** One top-ranked place per block — fast path for generate/regenerate on serverless. */
export function collectTopPlacesPerBlock(days: DayPlan[]): Place[] {
  const places: Place[] = [];
  const seenIds = new Set<string>();
  for (const day of days) {
    for (const block of day.blocks) {
      if (block.status === "skipped") continue;
      const top = block.suggestions[0];
      if (top && !seenIds.has(top.id)) {
        places.push(top);
        seenIds.add(top.id);
      }
    }
  }
  return places;
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
  locale: Locale = "en",
  options?: { topPlacesOnly?: boolean; skipHero?: boolean }
): Promise<{
  days: DayPlan[];
  placeDetails: Record<string, PlaceDetailRecord>;
  destinationMedia?: DestinationMedia;
}> {
  const placeDetails: Record<string, PlaceDetailRecord> = { ...(trip.placeDetails ?? {}) };
  const places = options?.topPlacesOnly
    ? collectTopPlacesPerBlock(days)
    : collectPlacesPrioritized(days);
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
    3
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
  const destinationMedia = options?.skipHero
    ? trip.destinationMedia
    : await enrichDestinationMedia(trip);

  return { days: enrichedDays, placeDetails, destinationMedia };
}
