"use client";

import { TripShareShell } from "@/components/TripShareShell";
import { EditableTripProvider, useEditableTrip } from "@/lib/editable-trip-context";
import { getDemoTrip } from "@/lib/destinations/registry";
import { setTripPlaceContext } from "@/lib/trip-place-store";
import { useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

function DemoTripShell({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const { trip } = useEditableTrip();
  return (
    <TripShareShell trip={trip} basePath={`/demo/${slug}`} mode="demo">
      {children}
    </TripShareShell>
  );
}

export function DemoTripLayout({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const demoTrip = getDemoTrip(slug);

  useEffect(() => {
    if (demoTrip) {
      setTripPlaceContext(demoTrip.placeDetails, demoTrip.placeAbout);
    }
  }, [demoTrip]);

  if (!demoTrip) {
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
    <EditableTripProvider tripId={`demo-${slug}`} initialTrip={demoTrip}>
      <DemoTripShell slug={slug}>{children}</DemoTripShell>
    </EditableTripProvider>
  );
}
