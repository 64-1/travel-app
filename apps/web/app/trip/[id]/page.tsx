"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Trip } from "@travel-planner/core";
import { countTripDays } from "@travel-planner/core";
import Link from "next/link";
import { ExportTrip } from "@/components/ExportTrip";
import { NextStepCard } from "@/components/NextStepCard";
import { TripProgress } from "@/components/TripProgress";
import { PageSkeleton } from "@/components/LoadingSkeleton";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { useToast } from "@/components/Toast";
import { useI18n } from "@/lib/i18n/context";
import { formatDateRange, dayLabel } from "@/lib/format";
import { getPaceLabel } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";

export default function TripOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { t, locale } = useI18n();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/trips/${id}`)
      .then((r) => r.json())
      .then(setTrip)
      .finally(() => setLoading(false));
  }, [id]);

  async function generateRemaining() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/trips/${id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromDay: trip!.daysGenerated, locale }),
      });
      if (!res.ok) throw new Error();
      setTrip(await res.json());
      toast(t("trip.toastDaysReady"), "success");
    } catch {
      toast(t("trip.toastDaysFailed"), "error");
    } finally {
      setGenerating(false);
    }
  }

  async function duplicateDay(dayIndex: number) {
    const res = await fetch(`/api/trips/${id}/duplicate-day`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayIndex }),
    });
    setTrip(await res.json());
    toast(t("trip.toastDuplicated"), "success");
  }

  if (loading) return <PageSkeleton />;
  if (!trip) return <p className="text-center text-muted-foreground py-12">{t("common.notFound")}</p>;

  const totalDays = countTripDays(trip.startDate, trip.endDate);
  const hasDay1 = trip.daysGenerated >= 1;
  const hasAllDays = trip.daysGenerated >= totalDays;
  const progressPercent = hasAllDays ? 100 : hasDay1 ? Math.round((trip.daysGenerated / totalDays) * 100) : 0;

  return (
    <div className="space-y-6">
      <ServiceWorkerRegister />
      <TripProgress current={hasAllDays ? "complete" : hasDay1 ? "day1" : "wishlist"} />

      <header className="share-card p-5 space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2 font-[family-name:var(--font-share-serif)]">
          <MapPin className="h-6 w-6 text-[var(--share-accent)]" />
          {trip.destination}
        </h1>
        <p className="text-[var(--share-muted)] flex items-center gap-1.5 text-sm">
          <Calendar className="h-4 w-4" />
          {formatDateRange(trip.startDate, trip.endDate, locale)} · {getPaceLabel(locale, trip.pace)} · {totalDays} {locale === "zh" ? "天" : totalDays === 1 ? "day" : "days"}
        </p>
      </header>

      {hasDay1 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">{t("trip.progress")}</span>
            <span>{t("trip.daysPlanned", { generated: trip.daysGenerated, total: totalDays })}</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--share-bg)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--share-accent)] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <NextStepCard
        tripId={id}
        hasDay1={hasDay1}
        hasAllDays={hasAllDays}
        wishlistCount={trip.wishlist.length}
        onGenerateRemaining={generateRemaining}
        generating={generating}
        totalDays={totalDays}
      />

      {trip.days.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{t("trip.yourDays")}</h2>
            <ExportTrip trip={trip} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {trip.days.map((day) => {
              const confirmed = day.blocks.filter((b) => b.status === "confirmed").length;
              const total = day.blocks.filter((b) => b.status !== "skipped").length;
              return (
                <div key={day.dayIndex} className="share-card overflow-hidden transition-shadow hover:shadow-md">
                  <div className="h-1 bg-gradient-to-r from-[var(--share-accent)] via-[#C9A227] to-[var(--share-accent)]" />
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-[family-name:var(--font-share-serif)] text-base font-bold">
                        {dayLabel(day.dayIndex, locale)}
                      </h3>
                      {day.theme && (
                        <p className="text-sm text-[var(--share-muted)] mt-0.5">{day.theme}</p>
                      )}
                      {day.date && <p className="text-xs text-[var(--share-muted)] mt-1">{day.date}</p>}
                    </div>
                    {day.neighborhoods.length > 0 && (
                      <p className="text-xs font-medium text-[var(--share-accent)]">
                        {day.neighborhoods.join(" → ")}
                      </p>
                    )}
                    <p className="text-sm text-[var(--share-muted)]">
                      {t("trip.stopsCount", { count: total })}
                      {confirmed > 0 && ` · ${confirmed} ${t("common.confirmed")}`}
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/trip/${id}/day/${day.dayIndex}`} className="flex-1">
                        <Button size="sm" className="w-full share-btn-primary rounded-full border-0">
                          {t("trip.viewTrip")}
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                        onClick={() => duplicateDay(day.dayIndex)}
                      >
                        {t("common.copy")}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
