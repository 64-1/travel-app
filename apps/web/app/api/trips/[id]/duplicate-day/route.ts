import { NextResponse } from "next/server";
import { getTrip, saveTrip } from "@/lib/trip-store";
import { generateId } from "@/lib/utils";
import { countTripDays, dateForDayIndex } from "@travel-planner/core";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const { dayIndex } = await request.json();
  const source = trip.days.find((d) => d.dayIndex === dayIndex);
  if (!source) return NextResponse.json({ error: "Day not found" }, { status: 404 });

  const totalDays = countTripDays(trip.startDate, trip.endDate);
  const newIndex = trip.days.length;
  if (newIndex >= totalDays) {
    return NextResponse.json({ error: "No room for more days in trip dates" }, { status: 400 });
  }

  const copy = {
    ...source,
    dayIndex: newIndex,
    date: dateForDayIndex(trip.startDate, newIndex),
    theme: `${source.theme ?? "Day"} (copy)`,
    blocks: source.blocks.map((b) => ({
      ...b,
      id: generateId(),
      suggestions: b.suggestions.map((s) => ({ ...s, id: generateId() })),
      backupPlace: b.backupPlace ? { ...b.backupPlace, id: generateId() } : undefined,
      status: "suggested" as const,
    })),
  };

  trip.days.push(copy);
  trip.daysGenerated = Math.max(trip.daysGenerated, newIndex + 1);
  await saveTrip(trip);
  return NextResponse.json(trip);
}
