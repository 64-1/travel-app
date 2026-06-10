"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Trip } from "@travel-planner/core";
import { getSelectedPlace } from "@travel-planner/core";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";
import { dayLabel, formatDateRange } from "@/lib/format";
import { PageSkeleton } from "@/components/LoadingSkeleton";

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const { t, locale } = useI18n();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setTrip)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <PageSkeleton />;
  if (notFound || !trip) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-xl font-bold">{t("share.notFound")}</h1>
        <Link href="/" className="text-primary mt-4 inline-block">{t("common.backHome")}</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex justify-end mb-4">
        <LanguageSwitcher compact />
      </div>
      <p className="text-sm text-muted-foreground mb-2">{t("share.readOnly")}</p>
      <h1 className="text-2xl font-bold">{trip.destination}</h1>
      <p className="text-muted-foreground mb-8">
        {formatDateRange(trip.startDate, trip.endDate, locale)}
      </p>

      {trip.days.map((day) => (
        <section key={day.dayIndex} className="mb-8">
          <h2 className="text-lg font-semibold mb-3">
            {dayLabel(day.dayIndex, locale)}{day.theme ? `: ${day.theme}` : ""}
          </h2>
          <ul className="space-y-3">
            {day.blocks.filter((b) => b.status !== "skipped").map((block) => {
              const place = getSelectedPlace(block);
              return (
                <li key={block.id} className="rounded-lg border border-border p-3">
                  <p className="font-medium text-sm text-muted-foreground">{block.label}</p>
                  {place && (
                    <>
                      <p className="font-semibold">{place.name}</p>
                      <p className="text-sm text-muted-foreground">{place.whyRecommended}</p>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <Link href="/" className="text-primary text-sm">{t("share.planOwn")}</Link>
    </main>
  );
}
