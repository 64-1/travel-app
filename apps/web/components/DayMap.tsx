"use client";

import type { DayPlan } from "@travel-planner/core";
import { getSelectedPlace } from "@travel-planner/core";
import { useI18n } from "@/lib/i18n/context";

interface Props {
  day: DayPlan;
  destination: string;
}

export function DayMap({ day, destination }: Props) {
  const { t } = useI18n();

  const places = day.blocks
    .map((b, i) => ({ block: b, index: i + 1, place: getSelectedPlace(b) }))
    .filter((p) => p.place && p.block.status !== "skipped");

  if (!places.length) {
    return (
      <div className="rounded-xl border border-border bg-muted p-6 text-center text-sm text-muted-foreground">
        {t("trip.noPlacesMap")}
      </div>
    );
  }

  const embedQuery = encodeURIComponent(
    `${places.map((p) => p.place!.name).join(" to ")} ${destination}`
  );

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border overflow-hidden bg-muted aspect-video relative">
        <iframe
          title="Day map"
          className="w-full h-full min-h-[200px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${embedQuery}&output=embed`}
        />
      </div>
      <ol className="space-y-2">
        {places.map(({ place, index, block }) => (
          <li key={block.id} className="flex items-center gap-2 text-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {index}
            </span>
            <span className="font-medium">{place!.name}</span>
            {block.neighborhood && (
              <span className="text-muted-foreground">· {block.neighborhood}</span>
            )}
          </li>
        ))}
      </ol>
      {day.neighborhoods.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {t("trip.areasToday")} {day.neighborhoods.join(" → ")}
        </p>
      )}
    </div>
  );
}
