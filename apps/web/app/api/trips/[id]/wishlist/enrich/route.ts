import { NextResponse } from "next/server";
import { getTrip, saveTrip } from "@/lib/trip-store";
import { enrichWishlistItem } from "@/lib/ai/pipeline";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const body = await request.json();
  const itemId = body.itemId as string | undefined;

  const items = itemId
    ? trip.wishlist.filter((w) => w.id === itemId)
    : trip.wishlist.filter((w) => !w.place);

  for (const item of items) {
    item.place = await enrichWishlistItem(item.rawInput, trip.destination);
  }

  await saveTrip(trip);
  return NextResponse.json(trip);
}
