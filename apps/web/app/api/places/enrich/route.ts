import { NextResponse } from "next/server";
import { enrichPlaceSchema } from "@travel-planner/core";
import { enrichWishlistItem } from "@/lib/ai/pipeline";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = enrichPlaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const place = await enrichWishlistItem(parsed.data.rawInput, parsed.data.destination);
  return NextResponse.json(place);
}
