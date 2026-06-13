"use client";

import { createContext, useContext } from "react";
import type { Trip } from "@travel-planner/core";

const ShareTripContext = createContext<Trip | null>(null);

export function ShareTripProvider({
  trip,
  children,
}: {
  trip: Trip;
  children: React.ReactNode;
}) {
  return <ShareTripContext.Provider value={trip}>{children}</ShareTripContext.Provider>;
}

export function useShareTrip() {
  const trip = useContext(ShareTripContext);
  if (!trip) throw new Error("useShareTrip must be used within ShareTripProvider");
  return trip;
}
