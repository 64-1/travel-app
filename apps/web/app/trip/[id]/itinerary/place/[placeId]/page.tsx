"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { PlaceDetailView } from "@/components/PlaceDetailView";
import { findPlaceInTrip } from "@/lib/demo/trip-places";
import { useEditableTrip } from "@/lib/editable-trip-context";
import { useI18n } from "@/lib/i18n/context";

export default function OwnerItineraryPlacePage() {
  const { id, placeId } = useParams<{ id: string; placeId: string }>();
  const { t } = useI18n();
  const { trip } = useEditableTrip();
  const hit = findPlaceInTrip(trip, placeId);

  if (!hit) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t("placeDetail.notFound")}</p>
        <Link href={`/trip/${id}/itinerary/day/0`} className="text-primary mt-4 inline-block text-sm">
          {t("common.backHome")}
        </Link>
      </div>
    );
  }

  return (
    <PlaceDetailView
      place={hit.place}
      basePath={`/trip/${id}/itinerary`}
      dayIndex={hit.dayIndex}
      blockLabel={hit.label}
      destination={trip.destination}
    />
  );
}
