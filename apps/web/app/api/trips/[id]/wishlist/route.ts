import { NextResponse } from "next/server";
import { addWishlistSchema } from "@travel-planner/core";
import { getTrip, saveTrip } from "@/lib/trip-store";
import { generateId } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const body = await request.json();
  const parsed = addWishlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  trip.wishlist.push({
    id: generateId(),
    rawInput: parsed.data.rawInput,
    mustInclude: parsed.data.mustInclude,
  });

  await saveTrip(trip);
  return NextResponse.json(trip);
}
