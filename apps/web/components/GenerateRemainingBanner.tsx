"use client";

import { useState } from "react";
import type { Trip } from "@travel-planner/core";
import { countTripDays } from "@travel-planner/core";
import { useI18n } from "@/lib/i18n/context";
import { ArrowRight, Sparkles } from "lucide-react";

interface Props {
  trip: Trip;
}

export function GenerateRemainingBanner({ trip }: Props) {
  const { t, locale } = useI18n();
  const [generating, setGenerating] = useState(false);
  const totalDays = countTripDays(trip.startDate, trip.endDate);

  async function generateRemaining() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromDay: trip.daysGenerated, locale }),
      });
      if (!res.ok) throw new Error();
      window.location.reload();
    } catch {
      setGenerating(false);
    }
  }

  return (
    <div className="share-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold">{t("nextStep.happyDay1")}</p>
        <p className="text-xs text-[var(--share-muted)]">
          {t("nextStep.happyDay1Desc", { total: totalDays })}
        </p>
      </div>
      <button
        type="button"
        disabled={generating}
        onClick={generateRemaining}
        className="share-btn-primary share-focus flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50"
      >
        <Sparkles className="h-4 w-4" />
        {generating ? t("nextStep.generating") : t("nextStep.generateRest", { total: totalDays })}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
