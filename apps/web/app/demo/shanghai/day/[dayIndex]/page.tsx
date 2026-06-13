"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ShareDayPanel } from "@/components/ShareDayPanel";
import { useEditableTrip } from "@/lib/editable-trip-context";
import { useI18n } from "@/lib/i18n/context";

export default function ShanghaiDayPage() {
  const { dayIndex: dayIndexStr } = useParams<{ dayIndex: string }>();
  const dayIndex = parseInt(dayIndexStr, 10);
  const { t } = useI18n();
  const { trip } = useEditableTrip();

  const day = trip.days.find((d) => d.dayIndex === dayIndex);

  if (!day) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t("trip.dayNotPlanned")}</p>
        <Link href="/demo/shanghai/day/0" className="text-primary mt-4 inline-block text-sm">
          {t("common.backHome")}
        </Link>
      </div>
    );
  }

  return <ShareDayPanel day={day} trip={trip} basePath="/demo/shanghai" />;
}
