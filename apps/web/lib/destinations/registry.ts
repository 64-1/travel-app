import type { Place, Trip } from "@travel-planner/core";
import { SHANGHAI_PLACE_CATALOG, shanghaiDemoTrip } from "@/lib/demo/shanghai-trip";
import {
  SHANGHAI_HERO,
  SHANGHAI_HERO_VIDEO,
  type HeroVideoConfig,
} from "@/lib/demo/place-images";

export interface DestinationConfig {
  slug: string;
  name: { en: string; zh: string };
  country: string;
  countryCode: string;
  catalog?: Place[];
  demoTrip?: Trip;
  heroVideo?: HeroVideoConfig;
  heroPoster?: string;
}

const REGISTRY: Record<string, DestinationConfig> = {
  shanghai: {
    slug: "shanghai",
    name: { en: "Shanghai", zh: "上海" },
    country: "China",
    countryCode: "cn",
    catalog: SHANGHAI_PLACE_CATALOG,
    demoTrip: shanghaiDemoTrip,
    heroVideo: SHANGHAI_HERO_VIDEO,
    heroPoster: SHANGHAI_HERO,
  },
};

const COUNTRY_CODES: Record<string, string> = {
  china: "cn",
  japan: "jp",
  france: "fr",
  italy: "it",
  spain: "es",
  germany: "de",
  "united states": "us",
  usa: "us",
  "united kingdom": "gb",
  uk: "gb",
  "south korea": "kr",
  korea: "kr",
  thailand: "th",
  singapore: "sg",
  australia: "au",
  canada: "ca",
  taiwan: "tw",
  "hong kong": "hk",
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[·・\-_]/g, "");
}

export function slugifyDestination(destination: string): string {
  const base = destination
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "");
  if (base.includes("shanghai") || destination.includes("上海")) return "shanghai";
  return base || "trip";
}

export function getDestinationConfig(
  destination: string,
  tripId?: string
): DestinationConfig | undefined {
  if (tripId === "demo-shanghai") return REGISTRY.shanghai;
  const slug = slugifyDestination(destination);
  return REGISTRY[slug] ?? (slug.includes("shanghai") ? REGISTRY.shanghai : undefined);
}

export function getDestinationCatalog(destination: string, tripId?: string): Place[] {
  return getDestinationConfig(destination, tripId)?.catalog ?? [];
}

export function listDemoDestinations(): DestinationConfig[] {
  return Object.values(REGISTRY).filter((d) => d.demoTrip);
}

export function getDemoTrip(slug: string): Trip | undefined {
  return REGISTRY[slug]?.demoTrip;
}

export function inferCountryCode(country?: string, destination?: string): string | undefined {
  if (country) {
    const code = COUNTRY_CODES[country.toLowerCase().trim()];
    if (code) return code;
  }
  const dest = (destination ?? "").toLowerCase();
  if (dest.includes("shanghai") || dest.includes("beijing") || dest.includes("上海")) return "cn";
  if (dest.includes("tokyo") || dest.includes("osaka") || dest.includes("kyoto")) return "jp";
  if (dest.includes("paris") || dest.includes("lyon")) return "fr";
  if (dest.includes("london")) return "gb";
  if (dest.includes("seoul")) return "kr";
  return undefined;
}

export function matchDestinationCatalog(destination: string, query: string): Place | undefined {
  const catalog = getDestinationCatalog(destination);
  if (!catalog.length) return undefined;

  const q = normalize(query);
  if (!q) return undefined;

  for (const place of catalog) {
    const candidates = [
      place.name,
      place.nameI18n?.en,
      place.nameI18n?.zh,
      place.neighborhood,
    ].filter(Boolean) as string[];

    for (const c of candidates) {
      const n = normalize(c);
      if (n === q || n.includes(q) || q.includes(n)) return place;
    }
  }
  return undefined;
}

export function destinationDisplayName(
  destination: string,
  locale: "en" | "zh",
  tripId?: string
): string {
  const config = getDestinationConfig(destination, tripId);
  if (config) return config.name[locale];
  return destination;
}
