import { NextResponse } from "next/server";
import { placeSchema } from "@travel-planner/core";
import { getTrip, saveTrip } from "@/lib/trip-store";
import { generateId } from "@/lib/utils";
import { z } from "zod";

const insertBlockSchema = z.object({
  label: z.string().min(1),
  kind: z.enum(["meal", "activity", "transit", "free_time"]),
  place: placeSchema.optional(),
  afterBlockId: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; dayIndex: string }> }
) {
  const { id, dayIndex: dayIndexStr } = await params;
  const dayIndex = parseInt(dayIndexStr, 10);
  const trip = await getTrip(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const body = await request.json();
  const parsed = insertBlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const day = trip.days.find((d) => d.dayIndex === dayIndex);
  if (!day) return NextResponse.json({ error: "Day not found" }, { status: 404 });

  const place = parsed.data.place ?? {
    id: generateId(),
    name: parsed.data.label,
    kind: parsed.data.kind,
    whyRecommended: "Added by you.",
    sourceLinks: [],
    tags: [],
    confidence: "user_added" as const,
    isCustom: true,
  };

  const newBlock = {
    id: generateId(),
    kind: parsed.data.kind,
    label: parsed.data.label,
    suggestions: [place],
    selectedPlaceId: place.id,
    status: "confirmed" as const,
  };

  if (parsed.data.afterBlockId) {
    const idx = day.blocks.findIndex((b) => b.id === parsed.data.afterBlockId);
    day.blocks.splice(idx + 1, 0, newBlock);
  } else {
    day.blocks.push(newBlock);
  }

  await saveTrip(trip);
  return NextResponse.json(trip);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; dayIndex: string }> }
) {
  const { id, dayIndex: dayIndexStr } = await params;
  const dayIndex = parseInt(dayIndexStr, 10);
  const trip = await getTrip(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const { blockIds } = await request.json();
  const day = trip.days.find((d) => d.dayIndex === dayIndex);
  if (!day) return NextResponse.json({ error: "Day not found" }, { status: 404 });

  const reordered = (blockIds as string[])
    .map((bid) => day.blocks.find((b) => b.id === bid))
    .filter(Boolean) as typeof day.blocks;

  if (reordered.length === day.blocks.length) {
    day.blocks = reordered;
  }

  await saveTrip(trip);
  return NextResponse.json(trip);
}
