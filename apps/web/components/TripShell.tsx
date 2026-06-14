"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Trip } from "@travel-planner/core";
import { TripNav } from "./TripNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";
import { MapPin } from "lucide-react";

interface Props {
  tripId: string;
  children: React.ReactNode;
}

export function TripShell({ tripId, children }: Props) {
  const { t } = useI18n();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoadError(false);
    fetch(`/api/trips/${tripId}`)
      .then((r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then(setTrip)
      .catch(() => {
        setTrip(null);
        setLoadError(true);
      });
  }, [tripId]);

  if (loadError) {
    return (
      <div className="share-page min-h-dvh pb-8">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <p className="text-[var(--share-muted)]">{t("common.notFound")}</p>
          <Link href="/" className="text-[var(--share-accent)] mt-4 inline-block text-sm">
            {t("common.backHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="share-page min-h-dvh pb-8">
      <nav className="sticky top-0 z-40 border-b border-[var(--share-border)] bg-[var(--share-card)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--share-card)]/80">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center justify-between gap-4 mb-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-[var(--share-muted)] hover:text-[var(--share-accent)] share-focus rounded-lg"
            >
              <MapPin className="h-4 w-4" />
              <span>{t("app.name")}</span>
            </Link>
            <LanguageSwitcher compact />
          </div>
          {trip ? (
            <TripNav
              tripId={tripId}
              destination={trip.destination}
              daysCount={Math.max(trip.daysGenerated, trip.days.length)}
            />
          ) : (
            <div className="h-16 animate-pulse rounded-lg bg-[var(--share-bg)]" />
          )}
        </div>
      </nav>
      <div className="mx-auto max-w-4xl px-4 py-6">{children}</div>
    </div>
  );
}
