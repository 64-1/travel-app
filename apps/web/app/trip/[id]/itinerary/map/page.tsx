"use client";

import { useParams } from "next/navigation";
import { ShareMapPanel } from "@/components/ShareDayPanel";
import { useEditableTrip } from "@/lib/editable-trip-context";

export default function OwnerItineraryMapPage() {
  const { id } = useParams<{ id: string }>();
  const { trip } = useEditableTrip();
  return <ShareMapPanel trip={trip} basePath={`/trip/${id}/itinerary`} />;
}
