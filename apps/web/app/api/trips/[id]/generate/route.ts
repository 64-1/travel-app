import { NextResponse } from "next/server";
import { generateTripSchema } from "@travel-planner/core";
import { getTrip, saveTrip } from "@/lib/trip-store";
import { generateTripDays } from "@/lib/ai/pipeline";

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
  trip.days = days;
  trip.daysGenerated = daysGenerated;

  await saveTrip(trip);
  return NextResponse.json(trip);
}
