"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Trip } from "@travel-planner/core";
import { TripShareShell } from "@/components/TripShareShell";
import { PageSkeleton } from "@/components/LoadingSkeleton";
import { useI18n } from "@/lib/i18n/context";
import { EditableTripProvider, useEditableTrip } from "@/lib/editable-trip-context";
import { setTripPlaceContext, clearTripPlaceContext } from "@/lib/trip-place-store";

interface Props {
  tripId: string;
  children: React.ReactNode;
}

function OwnerTripShellInner({ tripId, children }: Props) {
  const { trip } = useEditableTrip();
  return (
    <TripShareShell trip={trip} basePath={`/trip/${tripId}`} mode="owner">
      {children}
    </TripShareShell>
  );
}

export function OwnerTripLayout({ tripId, children }: Props) {
  const { t } = useI18n();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/trips/${tripId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data: Trip) => {
        setTrip(data);
        setTripPlaceContext(data.placeDetails, data.placeAbout);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    return () => clearTripPlaceContext();
  }, [tripId]);

  if (loading) return <PageSkeleton />;
  if (notFound || !trip) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-xl font-bold">{t("share.notFound")}</h1>
        <Link href="/" className="text-primary mt-4 inline-block">
          {t("common.backHome")}
        </Link>
      </main>
    );
  }

  if (trip.daysGenerated < 1) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-muted-foreground">{t("trip.generateFirst")}</p>
        <Link href={`/trip/${tripId}/generate`} className="text-primary mt-4 inline-block text-sm">
          {t("trip.generateCta")}
        </Link>
      </main>
    );
  }

  return (
    <EditableTripProvider tripId={tripId} initialTrip={trip} persist="server">
      <OwnerTripShellInner tripId={tripId}>{children}</OwnerTripShellInner>
    </EditableTripProvider>
  );
}
