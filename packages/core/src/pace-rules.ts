import type { Interest, Pace, Trip, TripConstraints } from "./types";

export interface DestinationProfile {
  type: "urban" | "nature" | "island" | "mixed";
  suggestedBlockCount: Record<Pace, number>;
}

const DEFAULT_PROFILE: DestinationProfile = {
  type: "mixed",
  suggestedBlockCount: { relaxed: 4, balanced: 6, packed: 8 },
};

const URBAN_KEYWORDS = [
  "tokyo", "osaka", "kyoto", "paris", "london", "new york", "hong kong",
  "singapore", "seoul", "bangkok", "taipei", "shanghai", "beijing",
];

const NATURE_KEYWORDS = [
  "bali", "alps", "iceland", "patagonia", "banff", "queenstown",
  "swiss", "hiking", "national park", "new zealand", "zealand",
];

const ISLAND_KEYWORDS = ["bali", "phuket", "okinawa", "hawaii", "maldives", "santorini"];

export function inferDestinationProfile(destination: string): DestinationProfile {
  const lower = destination.toLowerCase();

  if (ISLAND_KEYWORDS.some((k) => lower.includes(k))) {
    return {
      type: "island",
      suggestedBlockCount: { relaxed: 3, balanced: 5, packed: 7 },
    };
  }

  if (NATURE_KEYWORDS.some((k) => lower.includes(k))) {
    return {
      type: "nature",
      suggestedBlockCount: { relaxed: 3, balanced: 4, packed: 6 },
    };
  }

  if (URBAN_KEYWORDS.some((k) => lower.includes(k))) {
    return {
      type: "urban",
      suggestedBlockCount: { relaxed: 5, balanced: 7, packed: 9 },
    };
  }

  return DEFAULT_PROFILE;
}

export function getBlockLabels(
  profile: DestinationProfile,
  interests: Interest[],
  pace: Pace
): string[] {
  const count = profile.suggestedBlockCount[pace];
  const foodHeavy = interests.includes("food");

  if (profile.type === "urban") {
    const base = [
      "Breakfast",
      "Morning explore",
      "Lunch nearby",
      "Afternoon sights",
      foodHeavy ? "Afternoon snack" : "Neighborhood stroll",
      "Dinner",
    ];
    return base.slice(0, count);
  }

  if (profile.type === "nature") {
    const base = [
      "Breakfast",
      "Morning activity",
      "Lunch",
      "Afternoon explore",
      "Relax / free time",
      "Dinner",
    ];
    return base.slice(0, count);
  }

  if (profile.type === "island") {
    const base = [
      "Breakfast",
      "Beach or pool time",
      "Lunch",
      "Afternoon activity",
      "Sunset spot",
      "Dinner",
    ];
    return base.slice(0, count);
  }

  const base = [
    "Breakfast",
    "Morning activity",
    "Lunch",
    "Afternoon explore",
    "Dinner",
  ];
  return base.slice(0, count);
}

export function getSeasonFromDate(dateStr: string): string {
  const month = new Date(dateStr).getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

function constraintsFingerprint(constraints: TripConstraints, pace: Pace): string {
  const dietary = (constraints.dietary ?? []).slice().sort().join("+") || "none";
  return [
    pace,
    constraints.budget,
    constraints.mobility,
    constraints.vibe,
    constraints.groupType ?? "any",
    dietary,
  ].join("|");
}

export function buildResearchCacheKey(
  destination: string,
  interests: Interest[],
  season: string,
  constraints?: TripConstraints,
  pace?: Pace
): string {
  const base = `${destination.toLowerCase().trim()}::${[...interests].sort().join(",")}::${season}`;
  if (!constraints || !pace) return base;
  return `${base}::${constraintsFingerprint(constraints, pace)}`;
}

export function buildResearchCacheKeyForTrip(trip: Pick<Trip, "destination" | "interests" | "startDate" | "constraints" | "pace">): string {
  return buildResearchCacheKey(
    trip.destination,
    trip.interests,
    getSeasonFromDate(trip.startDate),
    trip.constraints,
    trip.pace
  );
}

export function constraintsToPrompt(constraints: TripConstraints): string {
  const parts = [
    `Budget: ${constraints.budget}`,
    `Mobility: ${constraints.mobility}`,
    `Vibe: ${constraints.vibe}`,
  ];
  if (constraints.groupType) parts.push(`Group: ${constraints.groupType}`);
  if (constraints.dietary?.length) {
    parts.push(`Dietary: ${constraints.dietary.join(", ")}`);
  }
  return parts.join(". ");
}
