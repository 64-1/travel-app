import type { Metadata } from "next";
import type { Trip } from "@travel-planner/core";
import { getTripByShareToken } from "@/lib/trip-store";
import { getTripOgImage } from "@/lib/trip-hero";
import { destinationDisplayName } from "@/lib/destinations/registry";

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://travel-app-seven-kappa.vercel.app";
}

function tripShareTitle(trip: Trip, locale: "en" | "zh" = "en") {
  const name = destinationDisplayName(trip.destination, locale, trip.id);
  return locale === "zh" ? `${name}之旅` : `${name} Trip`;
}

function tripShareDescription(trip: Trip) {
  const dayCount = trip.days.length;
  return `${dayCount}-day itinerary for ${trip.destination} — places, maps, hours, and photos.`;
}

export function metadataForTrip(trip: Trip, path: string): Metadata {
  const title = tripShareTitle(trip);
  const description = tripShareDescription(trip);
  const url = `${getSiteUrl()}${path}`;
  const ogImage = getTripOgImage(trip);
  const images = [{ url: ogImage, width: 1920, height: 823, alt: trip.destination }];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export async function metadataForShareToken(token: string): Promise<Metadata> {
  const trip = await getTripByShareToken(token);
  if (!trip) {
    return { title: "Trip not found | Travel Planner" };
  }
  return metadataForTrip(trip, `/share/${token}/day/0`);
}

export const shanghaiDemoMetadata: Metadata = metadataForTrip(
  {
    id: "demo-shanghai",
    destination: "Shanghai",
    startDate: "2025-06-01",
    endDate: "2025-06-05",
    interests: [],
    pace: "balanced",
    constraints: { budget: "mid", mobility: "moderate", vibe: "balanced" },
    wishlist: [],
    days: [{ dayIndex: 0, theme: "", neighborhoods: [], blocks: [] }],
    daysGenerated: 5,
  },
  "/demo/shanghai/day/0"
);
