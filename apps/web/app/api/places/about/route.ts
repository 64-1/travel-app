import { NextResponse } from "next/server";
import { fetchPlaceAbout } from "@/lib/place-about-fetch";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const destination = searchParams.get("destination");
  const locale = (searchParams.get("locale") ?? "en") as "en" | "zh";

  if (!name || !destination) {
    return NextResponse.json({ error: "name and destination required" }, { status: 400 });
  }

  const about = await fetchPlaceAbout(name, destination, locale);
  if (!about) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ about });
}
