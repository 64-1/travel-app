import { NextResponse } from "next/server";
import { enrichPlaceSchema } from "@travel-planner/core";
import { resolvePlaceInput } from "@/lib/place-resolve";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = enrichPlaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const resolved = await resolvePlaceInput(
    parsed.data.rawInput,
    parsed.data.destination ?? "Shanghai"
  );
  return NextResponse.json(resolved);
}
