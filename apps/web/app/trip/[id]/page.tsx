"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Trip } from "@travel-planner/core";
import { countTripDays } from "@travel-planner/core";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportTrip } from "@/components/ExportTrip";
import { NextStepCard } from "@/components/NextStepCard";
import { TripProgress } from "@/components/TripProgress";
import { PageSkeleton } from "@/components/LoadingSkeleton";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { useToast } from "@/components/Toast";
import { useI18n } from "@/lib/i18n/context";
import { formatDateRange, dayLabel } from "@/lib/format";
import { getPaceLabel } from "@/lib/i18n";
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

      <header className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          {trip.destination}
        </h1>
        <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
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
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
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
                <Card key={day.dayIndex} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {dayLabel(day.dayIndex, locale)}
                      {day.theme && (
                        <span className="block font-normal text-muted-foreground text-sm mt-0.5">
                          {day.theme}
                        </span>
                      )}
                    </CardTitle>
                    {day.date && <p className="text-xs text-muted-foreground">{day.date}</p>}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {day.neighborhoods.length > 0 && (
                      <p className="text-xs text-primary font-medium">
                        {day.neighborhoods.join(" → ")}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {t("trip.stopsCount", { count: total })}
                      {confirmed > 0 && ` · ${confirmed} ${t("common.confirmed")}`}
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/trip/${id}/day/${day.dayIndex}`} className="flex-1">
                        <Button size="sm" className="w-full">{t("trip.viewEdit")}</Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => duplicateDay(day.dayIndex)}>
                        {t("common.copy")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
