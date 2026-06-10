import { NextResponse } from "next/server";
import { regenerateSchema } from "@travel-planner/core";
import { getTrip, saveTrip } from "@/lib/trip-store";
import { regenerateScope } from "@/lib/ai/pipeline";

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
  trip.days = await regenerateScope(trip, dayIndex, blockId, reason, customFeedback);

  await saveTrip(trip);
  return NextResponse.json(trip);
}
