import type { Place } from "@travel-planner/core";
import { generateId } from "@/lib/utils";
import { fetchPageMeta } from "@/lib/enrich";
import { createPlaceFromInput } from "@/lib/place-enrich-ai";
import { SHANGHAI_PLACE_CATALOG } from "@/lib/demo/shanghai-trip";
import { getPlaceDetails, type PlaceDetailRecord } from "@/lib/demo/place-details";
import { attachPlaceImage } from "@/lib/place-image-search";

export interface ResolvedPlace {
  place: Place;
  details?: PlaceDetailRecord;
  matchedFrom: "catalog" | "geocode" | "url" | "ai";
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[·・\-_]/g, "");
}

function isShanghaiDestination(destination?: string) {
  if (!destination) return false;
  const d = destination.toLowerCase();
  return d.includes("shanghai") || destination.includes("上海");
}

export function matchShanghaiCatalog(query: string): Place | undefined {
  const q = normalize(query);
  if (!q) return undefined;

  for (const place of SHANGHAI_PLACE_CATALOG) {
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

function parseGoogleMapsUrl(url: string): {
  name?: string;
  lat?: number;
  lng?: number;
} {
  try {
    const u = new URL(url);
    const path = decodeURIComponent(u.pathname);
    const placeMatch = path.match(/\/place\/([^/@]+)/);
    const name = placeMatch?.[1]?.replace(/\+/g, " ").trim();
    const coordMatch = path.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    return {
      name: name || undefined,
      lat: coordMatch ? parseFloat(coordMatch[1]) : undefined,
      lng: coordMatch ? parseFloat(coordMatch[2]) : undefined,
    };
  } catch {
    return {};
  }
}

interface NominatimHit {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    suburb?: string;
    district?: string;
    city?: string;
    road?: string;
    house_number?: string;
  };
}

async function geocodePlace(
  name: string,
  destination: string
): Promise<{ lat: number; lng: number; address: string; neighborhood?: string } | null> {
  const q = `${name}, ${destination}, China`;
  const params = new URLSearchParams({
    q,
    format: "json",
    limit: "1",
    addressdetails: "1",
    countrycodes: "cn",
  });

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: { "User-Agent": "TravelPlannerApp/1.0 (travel-planner demo)" },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as NominatimHit[];
    const hit = data[0];
    if (!hit) return null;

    const addr = hit.address;
    const neighborhood = addr?.suburb || addr?.district || addr?.city;
    const street = [addr?.road, addr?.house_number].filter(Boolean).join(" ");

    return {
      lat: parseFloat(hit.lat),
      lng: parseFloat(hit.lon),
      address: street ? `${street}, ${hit.display_name}` : hit.display_name,
      neighborhood,
    };
  } catch {
    return null;
  }
}

function catalogDetails(place: Place): PlaceDetailRecord | undefined {
  return getPlaceDetails(place.id);
}

export async function resolvePlaceInput(
  rawInput: string,
  destination = "Shanghai",
  locale: "en" | "zh" = "en"
): Promise<ResolvedPlace> {
  const trimmed = rawInput.trim();
  const isUrl = /^https?:\/\//i.test(trimmed);

  if (isShanghaiDestination(destination) && !isUrl) {
    const catalogHit = matchShanghaiCatalog(trimmed);
    if (catalogHit) {
      return {
        place: { ...catalogHit },
        details: catalogDetails(catalogHit),
        matchedFrom: "catalog",
      };
    }
  }

  let searchName = trimmed;
  let lat: number | undefined;
  let lng: number | undefined;
  let matchedFrom: ResolvedPlace["matchedFrom"] = "ai";
  let ogImage: string | undefined;

  if (isUrl) {
    matchedFrom = "url";
    if (/google\.\w+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(trimmed)) {
      const parsed = parseGoogleMapsUrl(trimmed);
      searchName = parsed.name ?? searchName;
      lat = parsed.lat;
      lng = parsed.lng;
    }
    const meta = await fetchPageMeta(trimmed);
    if (meta.title) searchName = meta.title;
    if (meta.image) ogImage = meta.image;
  }

  const geo = await geocodePlace(searchName, destination);
  if (geo) matchedFrom = "geocode";

  const base = await createPlaceFromInput(trimmed, destination, locale);

  const place: Place = {
    ...base,
    id: base.id || generateId(),
    name: (searchName || base.name).slice(0, 120),
    nameI18n: base.nameI18n ?? {
      en: searchName || base.name,
      zh: searchName || base.name,
    },
    lat: lat ?? geo?.lat ?? base.lat,
    lng: lng ?? geo?.lng ?? base.lng,
    neighborhood: geo?.neighborhood ?? base.neighborhood ?? destination,
    sourceLinks: isUrl ? [trimmed, ...base.sourceLinks] : base.sourceLinks,
    intro: base.intro ?? {
      en: base.whyRecommended,
      zh: base.whyRecommended,
    },
    isCustom: true,
    confidence: "user_added",
  };

  let details: PlaceDetailRecord | undefined;
  if (geo) {
    details = {
      address: { en: geo.address, zh: geo.address },
      relatedInfo: {
        en: `Found via map search in ${destination}.`,
        zh: `通过地图搜索于${destination}找到。`,
      },
      gettingThere: {
        en: "Use metro or taxi to reach this area.",
        zh: "建议乘地铁或出租车前往。",
      },
    };
  }

  if (isShanghaiDestination(destination)) {
    const catalogHit = matchShanghaiCatalog(searchName);
    if (catalogHit) {
      return {
        place: { ...catalogHit },
        details: catalogDetails(catalogHit),
        matchedFrom: "catalog",
      };
    }
  }

  const withImage = await attachPlaceImage(place, searchName, destination, ogImage);

  return { place: withImage, details, matchedFrom };
}
