"use client";

import type { Trip } from "@travel-planner/core";
import { getSelectedPlace } from "@travel-planner/core";
import { useI18n } from "@/lib/i18n/context";

interface Props {
  trip: Trip;
}

export function ShareTripMap({ trip }: Props) {
  const { t } = useI18n();

  const places = trip.days.flatMap((day) =>
    day.blocks
      .filter((b) => b.status !== "skipped")
      .map((b) => getSelectedPlace(b))
      .filter((p): p is NonNullable<typeof p> => !!p)
  );

  if (!places.length) {
    return (
      <div className="rounded-2xl border border-[#e7e5e4] bg-[#f0eeea] p-8 text-center text-sm text-[#78716c]">
        {t("trip.noPlacesMap")}
      </div>
    );
  }

  const embedQuery = encodeURIComponent(
    `${places.map((p) => p.name).join(" | ")} ${trip.destination}`
  );

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl font-bold text-[#9B2D30]">{t("share.tripMap")}</h2>
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-[#e7e5e4] bg-[#f0eeea]">
        <iframe
          title={t("share.tripMap")}
          className="h-full w-full min-h-[220px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${embedQuery}&output=embed`}
        />
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {places.map((place, i) => (
          <li key={place.id} className="flex items-center gap-2 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#9B2D30] text-xs font-bold text-white">
              {i + 1}
            </span>
            <span className="font-medium text-[#1c1917]">
              {place.nameI18n?.zh ?? place.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
