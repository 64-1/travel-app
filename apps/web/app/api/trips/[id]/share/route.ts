import { NextResponse } from "next/server";
import { getTrip, saveTrip } from "@/lib/trip-store";
import { generateId } from "@/lib/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  if (!trip.shareToken) {
    trip.shareToken = generateId();
    await saveTrip(trip);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  return NextResponse.json({
    shareToken: trip.shareToken,
    shareUrl: `${baseUrl}/share/${trip.shareToken}`,
    trip,
  });
}
