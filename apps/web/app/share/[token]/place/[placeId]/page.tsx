"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { PlaceDetailView } from "@/components/PlaceDetailView";
import { findPlaceInTrip } from "@/lib/demo/trip-places";
import { useEditableTrip } from "@/lib/editable-trip-context";
import { useI18n } from "@/lib/i18n/context";

export default function SharePlacePage() {
  const { token, placeId } = useParams<{ token: string; placeId: string }>();
  const { trip } = useEditableTrip();
  const { t } = useI18n();
  const found = findPlaceInTrip(trip, placeId);

  if (!found) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t("common.notFound")}</p>
        <Link href={`/share/${token}/day/0`} className="text-primary mt-4 inline-block text-sm">
          {t("common.backToTrip")}
        </Link>
      </div>
    );
  }

  return (
    <PlaceDetailView
      place={found.place}
      basePath={`/share/${token}`}
      dayIndex={found.dayIndex}
      blockLabel={found.label}
    />
  );
}
