"use client";

import { useState } from "react";
import type { Trip } from "@travel-planner/core";
import { countTripDays } from "@travel-planner/core";
import { useI18n } from "@/lib/i18n/context";
import { dayLabel } from "@/lib/format";
import { ArrowRight, Sparkles } from "lucide-react";

interface Props {
  trip: Trip;
}

export function GenerateRemainingBanner({ trip }: Props) {
  const { t, locale } = useI18n();
  const [generating, setGenerating] = useState(false);
  const totalDays = countTripDays(trip.startDate, trip.endDate);
  const currentDay = dayLabel(trip.daysGenerated - 1, locale);
  const nextDay = dayLabel(trip.daysGenerated, locale);

  async function generateNextDay() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromDay: trip.daysGenerated, locale }),
      });
      if (!res.ok) throw new Error();
      window.location.href = `/trip/${trip.id}/day/${trip.daysGenerated}`;
    } catch {
      setGenerating(false);
    }
  }

  if (trip.daysGenerated >= totalDays) return null;

  return (
    <div className="share-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold">{t("nextStep.happyWithDay", { day: currentDay })}</p>
        <p className="text-xs text-[var(--share-muted)]">
          {t("nextStep.planNextDayDesc", { nextDay })}
        </p>
      </div>
      <button
        type="button"
        disabled={generating}
        onClick={generateNextDay}
        className="share-btn-primary share-focus flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50"
      >
        <Sparkles className="h-4 w-4" />
        {generating ? t("nextStep.generating") : t("nextStep.generateNextDay", { day: nextDay })}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
