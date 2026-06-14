import type { Trip } from "@travel-planner/core";
import { getDestinationConfig } from "@/lib/destinations/registry";
import { SHANGHAI_HERO, SHANGHAI_HERO_VIDEO, type HeroVideoConfig } from "@/lib/demo/place-images";

const FALLBACK_POSTER = SHANGHAI_HERO;

export function getTripHeroConfig(trip: Trip): HeroVideoConfig {
  const config = getDestinationConfig(trip.destination, trip.id);
  const poster =
    trip.destinationMedia?.poster ?? config?.heroPoster ?? FALLBACK_POSTER;

  if (config?.heroVideo) {
    return { ...config.heroVideo, poster };
  }

  return {
    sources: [],
    poster,
    audio: false,
    preload: "metadata",
  };
}

export function getTripOgImage(trip: Trip): string {
  return trip.destinationMedia?.poster ?? getDestinationConfig(trip.destination, trip.id)?.heroPoster ?? FALLBACK_POSTER;
}
