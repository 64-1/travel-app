import { NextResponse } from "next/server";
import { patchBlockSchema } from "@travel-planner/core";
import { getTrip, saveTrip } from "@/lib/trip-store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; dayIndex: string; blockId: string }> }
) {
  const { id, dayIndex: dayIndexStr, blockId } = await params;
  const dayIndex = parseInt(dayIndexStr, 10);
  const trip = await getTrip(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const body = await request.json();
  const parsed = patchBlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const day = trip.days.find((d) => d.dayIndex === dayIndex);
  const block = day?.blocks.find((b) => b.id === blockId);
  if (!block) return NextResponse.json({ error: "Block not found" }, { status: 404 });

  if (parsed.data.status) block.status = parsed.data.status;
  if (parsed.data.selectedPlaceId) block.selectedPlaceId = parsed.data.selectedPlaceId;
  if (parsed.data.notes !== undefined) block.notes = parsed.data.notes;
  if (parsed.data.place) {
    block.suggestions = [parsed.data.place, ...block.suggestions.filter((s) => s.id !== parsed.data.place!.id)];
    block.selectedPlaceId = parsed.data.place.id;
  }

  await saveTrip(trip);
  return NextResponse.json(trip);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; dayIndex: string; blockId: string }> }
) {
  const { id, dayIndex: dayIndexStr, blockId } = await params;
  const dayIndex = parseInt(dayIndexStr, 10);
  const trip = await getTrip(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const day = trip.days.find((d) => d.dayIndex === dayIndex);
  if (!day) return NextResponse.json({ error: "Day not found" }, { status: 404 });

  const before = day.blocks.length;
  day.blocks = day.blocks.filter((b) => b.id !== blockId);
  if (day.blocks.length === before) {
    return NextResponse.json({ error: "Block not found" }, { status: 404 });
  }

  await saveTrip(trip);
  return NextResponse.json(trip);
}
