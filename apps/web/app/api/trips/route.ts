import { NextResponse } from "next/server";
import { createTripSchema } from "@travel-planner/core";
import { prisma } from "@/lib/db";
import { rowToTrip } from "@/lib/trip-store";
import { generateId } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const id = generateId();

  const row = await prisma.trip.create({
    data: {
      id,
      destination: data.destination,
      country: data.country,
      startDate: data.startDate,
      endDate: data.endDate,
      interests: JSON.stringify(data.interests),
      pace: data.pace,
      constraints: JSON.stringify(data.constraints),
      wishlist: "[]",
      days: "[]",
      daysGenerated: 0,
    },
  });

  return NextResponse.json(rowToTrip(row), { status: 201 });
}
