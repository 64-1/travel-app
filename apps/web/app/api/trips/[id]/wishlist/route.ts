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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const itemId = new URL(request.url).searchParams.get("itemId");
  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 });
  }

  const before = trip.wishlist.length;
  trip.wishlist = trip.wishlist.filter((w) => w.id !== itemId);
  if (trip.wishlist.length === before) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await saveTrip(trip);
  return NextResponse.json(trip);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const body = await request.json();
  const { itemId, mustInclude } = body as { itemId?: string; mustInclude?: boolean };
  if (!itemId || typeof mustInclude !== "boolean") {
    return NextResponse.json({ error: "itemId and mustInclude required" }, { status: 400 });
  }

  const item = trip.wishlist.find((w) => w.id === itemId);
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  item.mustInclude = mustInclude;
  await saveTrip(trip);
  return NextResponse.json(trip);
}
