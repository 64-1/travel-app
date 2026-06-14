import { NextResponse } from "next/server";
import { generateTripSchema } from "@travel-planner/core";
import { getTrip, saveTrip } from "@/lib/trip-store";
import { generateTripDays } from "@/lib/ai/pipeline";
import { enrichTripPlaces } from "@/lib/enrich-trip-places";
import { enrichTripPlaceAbout } from "@/lib/place-about-fetch";

export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const parsed = generateTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const fromDay = parsed.data.fromDay ?? 0;

  if (fromDay > 0 && trip.daysGenerated < 1) {
    return NextResponse.json({ error: "Generate Day 1 first" }, { status: 400 });
  }

  const locale = parsed.data.locale ?? "en";
  const { days, daysGenerated } = await generateTripDays(trip, fromDay, locale);
  const toEnrich = fromDay === 0 ? days : days.filter((d) => d.dayIndex >= fromDay);
  const enriched = await enrichTripPlaces({ ...trip, days }, toEnrich, locale);

  trip.days = days.map((d) => enriched.days.find((e) => e.dayIndex === d.dayIndex) ?? d);
  trip.daysGenerated = daysGenerated;
  trip.placeDetails = enriched.placeDetails;
  trip.destinationMedia = enriched.destinationMedia ?? trip.destinationMedia;

  const placeNames: Record<string, string> = {};
  for (const day of toEnrich) {
    for (const block of day.blocks) {
      for (const p of block.suggestions) placeNames[p.id] = p.name;
    }
  }
  trip.placeAbout = await enrichTripPlaceAbout(
    trip,
    Object.keys(placeNames),
    placeNames,
    locale
  );

  await saveTrip(trip);
  return NextResponse.json(trip);
}
