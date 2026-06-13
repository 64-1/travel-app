"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Trip } from "@travel-planner/core";
import { TripShareShell } from "@/components/TripShareShell";
import { PageSkeleton } from "@/components/LoadingSkeleton";
import { useI18n } from "@/lib/i18n/context";
import { EditableTripProvider, useEditableTrip } from "@/lib/editable-trip-context";

interface Props {
  token: string;
  children: React.ReactNode;
}

function ShareTripShellInner({ token, children }: { token: string; children: React.ReactNode }) {
  const { trip } = useEditableTrip();
  return (
    <TripShareShell trip={trip} basePath={`/share/${token}`} mode="share">
      {children}
    </TripShareShell>
  );
}

export function ShareTripLayout({ token, children }: Props) {
  const { t } = useI18n();
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
        <Link href="/" className="text-primary mt-4 inline-block">
          {t("common.backHome")}
        </Link>
      </main>
    );
  }

  return (
    <EditableTripProvider tripId={`share-${token}`} initialTrip={trip}>
      <ShareTripShellInner token={token}>{children}</ShareTripShellInner>
    </EditableTripProvider>
  );
}
