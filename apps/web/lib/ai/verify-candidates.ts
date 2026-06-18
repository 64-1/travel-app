import type { Place, Trip } from "@travel-planner/core";
import { geocodePlace } from "@/lib/place-resolve";

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

const GENERIC_NEIGHBORHOODS = new Set(["city center", "old town", "waterfront"]);

function isVagueNeighborhood(neighborhood: string | undefined): boolean {
  if (!neighborhood) return true;
  return GENERIC_NEIGHBORHOODS.has(neighborhood.toLowerCase().trim());
}

/** Geocode candidates and keep only those that resolve on OpenStreetMap. */
export async function verifyResearchCandidates(
  trip: Trip,
  candidates: Place[]
): Promise<Place[]> {
  const verified = await mapPool(
    candidates,
    async (place) => {
      const geo = await geocodePlace(place.name, trip.destination, trip.country);
      if (!geo) return null;
      const enriched: Place = {
        ...place,
        lat: geo.lat,
        lng: geo.lng,
        neighborhood: isVagueNeighborhood(place.neighborhood)
          ? geo.neighborhood ?? place.neighborhood
          : place.neighborhood,
      };
      return enriched;
    },
    3
  );

  return verified.filter((p): p is Place => p !== null);
}
