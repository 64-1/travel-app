import type { Place } from "@travel-planner/core";
import { generateId } from "@/lib/utils";
import { fetchPageMeta } from "@/lib/enrich";
import { createPlaceFromInput } from "@/lib/place-enrich-ai";
import {
  getDestinationCatalog,
  inferCountryCode,
  matchDestinationCatalog,
} from "@/lib/destinations/registry";
import { getPlaceDetails, type PlaceDetailRecord } from "@/lib/demo/place-details";
import { attachPlaceImage } from "@/lib/place-image-search";

export interface ResolvedPlace {
  place: Place;
  details?: PlaceDetailRecord;
  matchedFrom: "catalog" | "geocode" | "url" | "ai";
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
  destination: string,
  country?: string
): Promise<{ lat: number; lng: number; address: string; neighborhood?: string } | null> {
  const countrySuffix = country ? `, ${country}` : "";
  const q = `${name}, ${destination}${countrySuffix}`;
  const countryCode = inferCountryCode(country, destination);

  const params = new URLSearchParams({
    q,
    format: "json",
    limit: "1",
    addressdetails: "1",
  });
  if (countryCode) params.set("countrycodes", countryCode);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: { "User-Agent": "TravelPlannerApp/1.0 (travel-planner)" },
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
  destination = "Unknown",
  locale: "en" | "zh" = "en",
  country?: string
): Promise<ResolvedPlace> {
  const trimmed = rawInput.trim();
  const isUrl = /^https?:\/\//i.test(trimmed);

  if (!isUrl) {
    const catalogHit = matchDestinationCatalog(destination, trimmed);
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

  const geo = await geocodePlace(searchName, destination, country);
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
        en: "Use public transit or taxi to reach this area.",
        zh: "建议乘公共交通或出租车前往。",
      },
    };
  }

  const catalogHit = matchDestinationCatalog(destination, searchName);
  if (catalogHit) {
    return {
      place: { ...catalogHit },
      details: catalogDetails(catalogHit),
      matchedFrom: "catalog",
    };
  }

  const withImage = await attachPlaceImage(place, searchName, destination, ogImage);

  return { place: withImage, details, matchedFrom };
}

export { getDestinationCatalog };
