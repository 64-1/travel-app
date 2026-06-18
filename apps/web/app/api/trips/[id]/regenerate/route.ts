import { NextResponse } from "next/server";
import { dayContainsGenericContent, regenerateSchema } from "@travel-planner/core";
import { getTrip, saveTrip } from "@/lib/trip-store";
import { regenerateScope } from "@/lib/ai/pipeline";
import { enrichTripPlaces, collectPlaceNamesFromDays, getPrioritizedPlaceIds } from "@/lib/enrich-trip-places";
import { enrichTripPlaceAbout } from "@/lib/place-about-fetch";

export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const body = await request.json();
  const parsed = regenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { dayIndex, blockId, reason, customFeedback } = parsed.data;
  const locale = (body as { locale?: "en" | "zh" }).locale ?? "en";
  trip.days = await regenerateScope(trip, dayIndex, blockId, reason, customFeedback, locale);

  const day = trip.days.find((d) => d.dayIndex === dayIndex);
  if (day && dayContainsGenericContent(day)) {
    return NextResponse.json(
      {
        error: `Couldn't find enough real places for ${trip.destination}. Try again or add saved spots first.`,
      },
      { status: 500 }
    );
  }
  if (day) {
    const enriched = await enrichTripPlaces(trip, [day], locale, {
      topPlacesOnly: true,
      skipHero: true,
    });
    trip.days = trip.days.map((d) => (d.dayIndex === dayIndex ? enriched.days[0] : d));
    trip.placeDetails = enriched.placeDetails;
    trip.destinationMedia = enriched.destinationMedia ?? trip.destinationMedia;

    const placeNames = collectPlaceNamesFromDays([day]);
    const prioritizedIds = getPrioritizedPlaceIds([day]);
    trip.placeAbout = await enrichTripPlaceAbout(
      trip,
      prioritizedIds,
      placeNames,
      locale
    );
  }

  await saveTrip(trip);
  return NextResponse.json(trip);
}
