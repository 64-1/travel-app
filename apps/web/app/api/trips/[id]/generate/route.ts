import { NextResponse } from "next/server";
import {
  countTripDays,
  dayContainsGenericContent,
  generateTripSchema,
  hasCuratedMockDestination,
  RESEARCH_POOL_MIN,
  SUGGESTIONS_PER_BLOCK_MIN,
  getSelectedPlace,
} from "@travel-planner/core";
import { getTrip, saveTrip } from "@/lib/trip-store";
import { generateTripDays } from "@/lib/ai/pipeline";
import { enrichTripPlaces, collectPlaceNamesFromDays, getPrioritizedPlaceIds } from "@/lib/enrich-trip-places";
import { enrichTripPlaceAbout } from "@/lib/place-about-fetch";

export const maxDuration = 60;

function isUsableDay(
  days: Awaited<ReturnType<typeof generateTripDays>>["days"],
  fromDay: number,
  destination: string
): boolean {
  const day = days.find((d) => d.dayIndex === fromDay);
  if (!day || day.blocks.length === 0) return false;
  const active = day.blocks.filter((b) => b.status !== "skipped");
  if (active.length === 0) return false;
  if (dayContainsGenericContent(day)) return false;
  const blocksOk = active.every(
    (b) => b.suggestions.length >= SUGGESTIONS_PER_BLOCK_MIN && Boolean(getSelectedPlace(b))
  );
  if (!blocksOk) return false;
  if (!hasCuratedMockDestination(destination)) {
    const poolSize = new Set(
      active.flatMap((b) => b.suggestions.map((s) => s.name.toLowerCase().trim()))
    ).size;
    if (poolSize < RESEARCH_POOL_MIN / 4) return false;
  }
  return true;
}

function generationErrorMessage(destination: string): string {
  return `Couldn't find enough real places for ${destination}. Try adding saved spots on your wishlist or adjusting your interests, then generate again.`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trip = await getTrip(id);
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const parsed = generateTripSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const fromDay = parsed.data.fromDay ?? 0;
    const totalDays = countTripDays(trip.startDate, trip.endDate);

    if (fromDay >= totalDays) {
      return NextResponse.json({ error: "All days already generated" }, { status: 400 });
    }

    if (fromDay > 0 && trip.daysGenerated < 1) {
      return NextResponse.json({ error: "Generate Day 1 first" }, { status: 400 });
    }

    if (fromDay > 0 && fromDay !== trip.daysGenerated) {
      return NextResponse.json({ error: "Generate days in order" }, { status: 400 });
    }

    const locale = parsed.data.locale ?? "en";
    const { days, daysGenerated } = await generateTripDays(trip, fromDay, locale);

    if (!isUsableDay(days, fromDay, trip.destination)) {
      return NextResponse.json(
        { error: generationErrorMessage(trip.destination) },
        { status: 500 }
      );
    }

    const toEnrich = days.filter((d) => d.dayIndex === fromDay);
    const enriched = await enrichTripPlaces(
      { ...trip, days },
      toEnrich,
      locale,
      { topPlacesOnly: true, skipHero: true }
    );

    trip.days = days.map((d) => enriched.days.find((e) => e.dayIndex === d.dayIndex) ?? d);
    trip.daysGenerated = daysGenerated;
    trip.placeDetails = enriched.placeDetails;
    trip.destinationMedia = enriched.destinationMedia ?? trip.destinationMedia;

    const placeNames = collectPlaceNamesFromDays(toEnrich);
    const prioritizedIds = getPrioritizedPlaceIds(toEnrich);
    trip.placeAbout = await enrichTripPlaceAbout(
      trip,
      prioritizedIds,
      placeNames,
      locale
    );

    await saveTrip(trip);
    return NextResponse.json(trip);
  } catch (err) {
    console.error("Generate failed:", err);
    return NextResponse.json(
      { error: "Generation failed. Please try again in a moment." },
      { status: 500 }
    );
  }
}
