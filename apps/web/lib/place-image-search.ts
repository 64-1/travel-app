import type { Place } from "@travel-planner/core";

export interface FoundImage {
  url: string;
  credit: string;
}

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const FALLBACK_BY_KIND: Record<string, FoundImage> = {
  meal: { url: UNSPLASH("1559847844-5315695dadae"), credit: "Unsplash" },
  activity: { url: UNSPLASH("1536595153853-d9514839d51c"), credit: "Unsplash" },
};

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, "").trim();
}

async function wikiApi<T>(base: string, params: Record<string, string>): Promise<T | null> {
  try {
    const qs = new URLSearchParams({ ...params, format: "json", origin: "*" });
    const res = await fetch(`${base}?${qs}`, {
      signal: AbortSignal.timeout(6000),
      headers: { "User-Agent": "TravelPlannerApp/1.0" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function searchWikimediaCommons(query: string): Promise<FoundImage | null> {
  type WikiResponse = {
    query?: {
      pages?: Record<
        string,
        {
          imageinfo?: {
            thumburl?: string;
            url?: string;
            extmetadata?: { Artist?: { value?: string } };
          }[];
        }
      >;
    };
  };

  const data = await wikiApi<WikiResponse>("https://commons.wikimedia.org/w/api.php", {
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "6",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "1200",
  });

  const pages = data?.query?.pages;
  if (!pages) return null;

  for (const page of Object.values(pages)) {
    const info = page.imageinfo?.[0];
    const url = info?.thumburl || info?.url;
    if (!url || !/\.(jpe?g|png|webp)/i.test(url)) continue;
    const artist = info.extmetadata?.Artist?.value;
    const credit = artist
      ? `Wikimedia Commons / ${stripHtml(artist).slice(0, 60)}`
      : "Wikimedia Commons";
    return { url, credit };
  }
  return null;
}

async function searchWikipediaImage(
  query: string,
  lang: "en" | "zh"
): Promise<FoundImage | null> {
  type OpenSearch = [string, string[], string[], string[]];
  const search = await wikiApi<OpenSearch>(`https://${lang}.wikipedia.org/w/api.php`, {
    action: "opensearch",
    search: query,
    limit: "1",
  });
  const title = search?.[1]?.[0];
  if (!title) return null;

  type PageImage = {
    query?: { pages?: Record<string, { thumbnail?: { source: string } }> };
  };
  const page = await wikiApi<PageImage>(`https://${lang}.wikipedia.org/w/api.php`, {
    action: "query",
    titles: title,
    prop: "pageimages",
    pithumbsize: "1200",
  });

  const pages = page?.query?.pages;
  if (!pages) return null;
  const thumb = Object.values(pages)[0]?.thumbnail?.source;
  if (!thumb) return null;
  return { url: thumb, credit: `Wikipedia (${lang})` };
}

export async function findPlaceImage(
  name: string,
  destination: string,
  opts?: { ogImage?: string; kind?: Place["kind"] }
): Promise<FoundImage | null> {
  if (opts?.ogImage && /^https?:\/\//i.test(opts.ogImage)) {
    return { url: opts.ogImage, credit: "Source link" };
  }

  const queries = [`${name} ${destination}`, name];

  for (const q of queries) {
    const commons = await searchWikimediaCommons(q);
    if (commons) return commons;
  }

  for (const lang of ["zh", "en"] as const) {
    for (const q of queries) {
      const wiki = await searchWikipediaImage(q, lang);
      if (wiki) return wiki;
    }
  }

  const kind = opts?.kind ?? "activity";
  return FALLBACK_BY_KIND[kind] ?? FALLBACK_BY_KIND.activity;
}

export async function attachPlaceImage(
  place: Place,
  searchName: string,
  destination: string,
  ogImage?: string
): Promise<Place> {
  if (place.imageUrl) return place;

  const found = await findPlaceImage(searchName, destination, {
    ogImage,
    kind: place.kind,
  });

  if (!found) return place;

  return {
    ...place,
    imageUrl: found.url,
    imageCredit: found.credit,
  };
}

export async function findPlaceGalleryImages(
  name: string,
  destination: string,
  limit = 4
): Promise<{ url: string; credit: string }[]> {
  const results: { url: string; credit: string }[] = [];
  const queries = [`${name} ${destination}`, name];

  for (const q of queries) {
    if (results.length >= limit) break;
    const found = await searchWikimediaCommons(q);
    if (found && !results.some((r) => r.url === found.url)) {
      results.push(found);
    }
  }

  return results.slice(0, limit);
}
