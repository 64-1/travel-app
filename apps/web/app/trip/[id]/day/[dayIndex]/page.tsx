"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Trip } from "@travel-planner/core";
import { countTripDays } from "@travel-planner/core";
import { DayTimeline } from "@/components/DayTimeline";
import { DayMap } from "@/components/DayMap";
import { NextStepCard } from "@/components/NextStepCard";
import { TripProgress } from "@/components/TripProgress";
import { PageSkeleton } from "@/components/LoadingSkeleton";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { formatDate, dayLabel } from "@/lib/format";
import { ChevronLeft, ChevronRight, List, Map } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DayDetailPage() {
  const { id, dayIndex: dayIndexStr } = useParams<{ id: string; dayIndex: string }>();
  const dayIndex = parseInt(dayIndexStr, 10);
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [tab, setTab] = useState<"timeline" | "map">("timeline");

  useEffect(() => {
    fetch(`/api/trips/${id}`)
      .then((r) => r.json())
      .then(setTrip)
      .finally(() => setLoading(false));
  }, [id]);

  async function generateRemaining() {
    if (!trip) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/trips/${id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromDay: trip.daysGenerated, locale }),
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

  if (loading) return <PageSkeleton />;
  if (!trip) return <p className="text-center text-muted-foreground py-12">{t("common.notFound")}</p>;

  const day = trip.days.find((d) => d.dayIndex === dayIndex);
  if (!day) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">{t("trip.dayNotPlanned")}</p>
        <Link href={`/trip/${id}/generate`}>
          <Button>{t("wishlist.buildDay1")}</Button>
        </Link>
      </div>
    );
  }

  const totalDays = countTripDays(trip.startDate, trip.endDate);
  const hasAllDays = trip.daysGenerated >= totalDays;
  const confirmed = day.blocks.filter((b) => b.status === "confirmed").length;
  const active = day.blocks.filter((b) => b.status !== "skipped").length;

  return (
    <div className="space-y-6">
      <TripProgress current={hasAllDays ? "complete" : "day1"} />

      <header className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          {dayIndex > 0 ? (
            <Link href={`/trip/${id}/day/${dayIndex - 1}`}>
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4" />
                {dayLabel(dayIndex - 1, locale)}
              </Button>
            </Link>
          ) : (
            <div />
          )}
          {dayIndex < trip.days.length - 1 ? (
            <Link href={`/trip/${id}/day/${dayIndex + 1}`}>
              <Button variant="ghost" size="sm">
                {dayLabel(dayIndex + 1, locale)}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            {dayLabel(day.dayIndex, locale)}
            {day.theme && (
              <span className="block text-base font-normal text-muted-foreground mt-0.5">
                {day.theme}
              </span>
            )}
          </h1>
          {day.date && <p className="text-sm text-muted-foreground mt-1">{formatDate(day.date, locale)}</p>}
        </div>

        {day.neighborhoods.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {day.neighborhoods.map((n, i) => (
              <span key={n} className="inline-flex items-center text-xs">
                <span className="rounded-full bg-accent px-2.5 py-1 font-medium text-primary">{n}</span>
                {i < day.neighborhoods.length - 1 && (
                  <ChevronRight className="h-3 w-3 mx-0.5 text-muted-foreground" />
                )}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-sm">
          <span className="rounded-full bg-muted px-3 py-1 font-medium">
            {t("trip.stopsConfirmed", { confirmed, total: active })}
          </span>
          <Link
            href={`/trip/${id}/itinerary/day/${dayIndex}`}
            className="text-primary text-sm font-medium hover:underline"
          >
            {t("trip.viewPolished")}
          </Link>
        </div>
      </header>

      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => setTab("timeline")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors",
            tab === "timeline" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <List className="h-4 w-4" />
          {t("trip.timeline")}
        </button>
        <button
          type="button"
          onClick={() => setTab("map")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors",
            tab === "map" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Map className="h-4 w-4" />
          {t("trip.map")}
        </button>
      </div>

      {tab === "timeline" ? (
        <DayTimeline trip={trip} day={day} onUpdate={setTrip} />
      ) : (
        <DayMap day={day} destination={trip.destination} />
      )}

      <NextStepCard
        tripId={id}
        hasDay1
        hasAllDays={hasAllDays}
        wishlistCount={trip.wishlist.length}
        onGenerateRemaining={generateRemaining}
        generating={generating}
        totalDays={totalDays}
        context="day"
      />
    </div>
  );
}
