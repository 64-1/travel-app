"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useI18n } from "@/lib/i18n/context";
import { dayLabel } from "@/lib/format";
import { ArrowRight, Sparkles, Heart } from "lucide-react";

interface Props {
  tripId: string;
  hasDay1: boolean;
  hasAllDays: boolean;
  daysGenerated: number;
  wishlistCount: number;
  onGenerateRemaining?: () => void;
  generating?: boolean;
  totalDays: number;
  /** When shown on a day page, swap "Review Day 1" for a link back to overview */
  context?: "overview" | "day";
}

export function NextStepCard({
  tripId,
  hasDay1,
  hasAllDays,
  daysGenerated,
  wishlistCount,
  onGenerateRemaining,
  generating,
  totalDays,
  context = "overview",
}: Props) {
  const { t, locale } = useI18n();

  if (hasAllDays) {
    return (
      <div className="rounded-xl border border-[var(--share-green-soft)] bg-[var(--share-green-soft)] p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-[var(--share-green)] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-[#006644]">{t("nextStep.readyTitle")}</p>
            <p className="text-sm text-[#00875a] mt-1">{t("nextStep.readyDesc")}</p>
            {context === "day" && (
              <Link href={`/trip/${tripId}`} className="inline-block mt-3">
                <Button variant="outline" size="sm" className="rounded-full border-[var(--share-border)] bg-white">
                  {t("nextStep.viewOverview")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (hasDay1) {
    const currentDay = dayLabel(daysGenerated - 1, locale);
    const nextDay = dayLabel(daysGenerated, locale);

    return (
      <div className="share-card p-5">
        <p className="font-semibold">{t("nextStep.happyWithDay", { day: currentDay })}</p>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          {t("nextStep.planNextDayDesc", { nextDay })}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onGenerateRemaining} disabled={generating}>
            {generating ? t("nextStep.generating") : t("nextStep.generateNextDay", { day: nextDay })}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          {context === "day" ? (
            <Link href={`/trip/${tripId}`}>
              <Button variant="outline">{t("nextStep.viewOverview")}</Button>
            </Link>
          ) : (
            <Link href={`/trip/${tripId}/day/${daysGenerated - 1}`}>
              <Button variant="outline">{t("nextStep.reviewDay", { day: currentDay })}</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-accent p-5">
      <p className="font-semibold">{t("nextStep.whatsNext")}</p>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        {wishlistCount > 0
          ? t(wishlistCount > 1 ? "nextStep.hasSpotsPlural" : "nextStep.hasSpots", { count: wishlistCount })
          : t("nextStep.noSpots")}
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href={`/trip/${tripId}/generate`}>
          <Button>
            <Sparkles className="h-4 w-4 mr-1" />
            {t("wishlist.buildDay1")}
          </Button>
        </Link>
        <Link href={`/trip/${tripId}/wishlist`}>
          <Button variant="outline">
            <Heart className="h-4 w-4 mr-1" />
            {wishlistCount > 0 ? t("nextStep.editSpots") : t("nextStep.addSpots")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
