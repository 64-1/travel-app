import { NextResponse } from "next/server";
import { findPlaceGalleryImages } from "@/lib/place-image-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const destination = searchParams.get("destination");
  const limit = parseInt(searchParams.get("limit") ?? "4", 10);

  if (!name || !destination) {
    return NextResponse.json({ error: "name and destination required" }, { status: 400 });
  }

  const images = await findPlaceGalleryImages(name, destination, limit);
  return NextResponse.json({ images });
}
