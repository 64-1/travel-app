"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ShareDayPanel } from "@/components/ShareDayPanel";
import { useEditableTrip } from "@/lib/editable-trip-context";
import { useI18n } from "@/lib/i18n/context";

export default function TripDayPage() {
  const { id, dayIndex: dayIndexStr } = useParams<{ id: string; dayIndex: string }>();
  const dayIndex = parseInt(dayIndexStr, 10);
  const { t } = useI18n();
  const { trip } = useEditableTrip();

  const day = trip.days.find((d) => d.dayIndex === dayIndex);

  if (!day) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-muted-foreground">{t("trip.dayNotPlanned")}</p>
        <Link href={`/trip/${id}/generate`} className="text-primary inline-block text-sm font-medium">
          {t("trip.generateCta")}
        </Link>
      </div>
    );
  }

  if (day.blocks.filter((b) => b.status !== "skipped").length === 0) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-muted-foreground">{t("generate.errorGeneric")}</p>
        <Link href={`/trip/${id}/generate`} className="text-primary inline-block text-sm font-medium">
          {t("common.tryAgain")}
        </Link>
      </div>
    );
  }

  return <ShareDayPanel day={day} trip={trip} basePath={`/trip/${id}`} />;
}
