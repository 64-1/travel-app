import type { DayPlan, Trip, TripConstraints, WishlistItem } from "@travel-planner/core";
import { prisma } from "./db";

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function rowToTrip(row: {
  id: string;
  destination: string;
  country: string | null;
  startDate: string;
  endDate: string;
  interests: string;
  pace: string;
  constraints: string;
  wishlist: string;
  days: string;
  daysGenerated: number;
  shareToken: string | null;
}): Trip {
  return {
    id: row.id,
    destination: row.destination,
    country: row.country ?? undefined,
    startDate: row.startDate,
    endDate: row.endDate,
    interests: parseJson(row.interests, []),
    pace: row.pace as Trip["pace"],
    constraints: parseJson<TripConstraints>(row.constraints, {
      budget: "mid",
      mobility: "moderate",
      vibe: "balanced",
    }),
    wishlist: parseJson<WishlistItem[]>(row.wishlist, []),
    days: parseJson<DayPlan[]>(row.days, []),
    daysGenerated: row.daysGenerated,
    shareToken: row.shareToken ?? undefined,
  };
}

export async function getTrip(id: string): Promise<Trip | null> {
  const row = await prisma.trip.findUnique({ where: { id } });
  return row ? rowToTrip(row) : null;
}

export async function getTripByShareToken(token: string): Promise<Trip | null> {
  const row = await prisma.trip.findUnique({ where: { shareToken: token } });
  return row ? rowToTrip(row) : null;
}

export async function saveTrip(trip: Trip): Promise<Trip> {
  const row = await prisma.trip.upsert({
    where: { id: trip.id },
    create: {
      id: trip.id,
      destination: trip.destination,
      country: trip.country,
      startDate: trip.startDate,
      endDate: trip.endDate,
      interests: JSON.stringify(trip.interests),
      pace: trip.pace,
      constraints: JSON.stringify(trip.constraints),
      wishlist: JSON.stringify(trip.wishlist),
      days: JSON.stringify(trip.days),
      daysGenerated: trip.daysGenerated,
      shareToken: trip.shareToken,
    },
    update: {
      destination: trip.destination,
      country: trip.country,
      startDate: trip.startDate,
      endDate: trip.endDate,
      interests: JSON.stringify(trip.interests),
      pace: trip.pace,
      constraints: JSON.stringify(trip.constraints),
      wishlist: JSON.stringify(trip.wishlist),
      days: JSON.stringify(trip.days),
      daysGenerated: trip.daysGenerated,
      shareToken: trip.shareToken,
    },
  });
  return rowToTrip(row);
}
