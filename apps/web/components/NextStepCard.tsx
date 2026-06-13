"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useI18n } from "@/lib/i18n/context";
import { ArrowRight, Sparkles, Heart } from "lucide-react";

interface Props {
  tripId: string;
  hasDay1: boolean;
  hasAllDays: boolean;
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
  wishlistCount,
  onGenerateRemaining,
  generating,
  totalDays,
  context = "overview",
}: Props) {
  const { t } = useI18n();

  if (hasAllDays) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-green-900">{t("nextStep.readyTitle")}</p>
            <p className="text-sm text-green-800 mt-1">{t("nextStep.readyDesc")}</p>
            {context === "day" && (
              <Link href={`/trip/${tripId}`} className="inline-block mt-3">
                <Button variant="outline" size="sm" className="border-green-300 bg-white hover:bg-green-50">
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
    return (
      <div className="rounded-xl border border-primary/20 bg-accent p-5">
        <p className="font-semibold">{t("nextStep.happyDay1")}</p>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          {t("nextStep.happyDay1Desc", { total: totalDays })}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onGenerateRemaining} disabled={generating}>
            {generating ? t("nextStep.generating") : t("nextStep.generateRest", { total: totalDays })}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          {context === "day" ? (
            <Link href={`/trip/${tripId}`}>
              <Button variant="outline">{t("nextStep.viewOverview")}</Button>
            </Link>
          ) : (
            <Link href={`/trip/${tripId}/day/0`}>
              <Button variant="outline">{t("nextStep.reviewDay1")}</Button>
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
