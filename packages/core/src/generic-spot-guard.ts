import type { DayPlan, Place } from "./types";

/** Generic mock neighborhoods from DEFAULT_SPOTS fallback. */
export const GENERIC_NEIGHBORHOODS = new Set(
  ["city center", "old town", "waterfront"].map((s) => s.toLowerCase())
);

/** Place names from DEFAULT_SPOTS — generic placeholders, not real venues. */
export const GENERIC_SPOT_NAMES = new Set(
  [
    "Morning Market Cafe",
    "Riverside Bakery",
    "Old Town Espresso Bar",
    "Sunrise Brunch House",
    "Harbor Morning Grill",
    "Historic Main Square",
    "City Museum",
    "Cathedral Quarter Walk",
    "Central Park Gardens",
    "Waterfront Sculpture Trail",
    "Local Bistro",
    "Market Hall Food Stalls",
    "Hidden Alley Eatery",
    "Dockside Seafood Lunch",
    "Garden Terrace Cafe",
    "Art District Walk",
    "Riverside Promenade",
    "Vintage Shopping Lane",
    "Rooftop Lookout",
    "Canal Side Stroll",
    "Afternoon Tea Salon",
    "Patisserie Corner",
    "Harbor Restaurant",
    "Chef's Table Downtown",
    "Old Town Wine Bar",
    "Sunset Viewpoint",
    "Night Market Stalls",
    "Jazz Club Supper",
    "Lantern Lit Alley",
    "Street Food Crawl",
    "Botanical Conservatory",
    "Craft Workshop Studio",
    "Kayak Harbor Tour",
    "Farmers Market Morning",
    "Bookshop Cafe",
    "Gallery District Loop",
    "Pier Ice Cream Stand",
    "Historic Tavern Lunch",
    "Observation Deck",
    "Moonlit Pier Walk",
    "Neighborhood Ramen Shop",
    "Courtyard Coffee House",
  ].map((s) => s.toLowerCase())
);

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

export function isGenericPlace(place: Pick<Place, "name" | "neighborhood">): boolean {
  return GENERIC_SPOT_NAMES.has(normalize(place.name));
}

export function isDefaultMockTheme(theme: string): boolean {
  const t = theme.toLowerCase();
  const hits = [...GENERIC_NEIGHBORHOODS].filter((n) => t.includes(n));
  return hits.length >= 2;
}

export function isGenericNeighborhood(neighborhood: string | undefined): boolean {
  return neighborhood ? GENERIC_NEIGHBORHOODS.has(normalize(neighborhood)) : false;
}

export function stripGenericCandidates(candidates: Place[]): Place[] {
  return candidates.filter((c) => !isGenericPlace(c));
}

export function cacheRemovalRatio(
  original: Place[],
  stripped: Place[]
): number {
  if (original.length === 0) return 0;
  return 1 - stripped.length / original.length;
}

export function dayContainsGenericContent(day: DayPlan): boolean {
  if (day.theme && isDefaultMockTheme(day.theme)) return true;

  for (const block of day.blocks) {
    if (block.status === "skipped") continue;
    for (const s of block.suggestions) {
      if (isGenericPlace(s)) return true;
    }
  }
  return false;
}
