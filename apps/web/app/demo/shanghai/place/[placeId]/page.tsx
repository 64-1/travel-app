"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { PlaceDetailView } from "@/components/PlaceDetailView";
import { findPlaceInTrip } from "@/lib/demo/trip-places";
import { useEditableTrip } from "@/lib/editable-trip-context";
import { useI18n } from "@/lib/i18n/context";

export default function ShanghaiPlacePage() {
  const { placeId } = useParams<{ placeId: string }>();
  const { t } = useI18n();
  const { trip } = useEditableTrip();
  const found = findPlaceInTrip(trip, placeId);

  if (!found) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t("common.notFound")}</p>
        <Link href="/demo/shanghai/day/0" className="text-primary mt-4 inline-block text-sm">
          {t("common.backHome")}
        </Link>
      </div>
    );
  }

  return (
    <PlaceDetailView
      place={found.place}
      basePath="/demo/shanghai"
      dayIndex={found.dayIndex}
      blockLabel={found.label}
    />
  );
}
