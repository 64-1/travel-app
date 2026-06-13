"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ShareDayPanel } from "@/components/ShareDayPanel";
import { useEditableTrip } from "@/lib/editable-trip-context";
import { useI18n } from "@/lib/i18n/context";

export default function ShareDayPage() {
  const { token, dayIndex: dayIndexStr } = useParams<{ token: string; dayIndex: string }>();
  const dayIndex = parseInt(dayIndexStr, 10);
  const { trip } = useEditableTrip();
  const { t } = useI18n();

  const day = trip.days.find((d) => d.dayIndex === dayIndex);

  if (!day) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t("trip.dayNotPlanned")}</p>
        <Link href={`/share/${token}/day/0`} className="text-primary mt-4 inline-block text-sm">
          Day 1
        </Link>
      </div>
    );
  }

  return <ShareDayPanel day={day} trip={trip} basePath={`/share/${token}`} />;
}
