"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Trip } from "@travel-planner/core";
import Link from "next/link";
import { TripShareView } from "@/components/TripShareView";
import { PageSkeleton } from "@/components/LoadingSkeleton";
import { useI18n } from "@/lib/i18n/context";

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
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

  return <TripShareView trip={trip} mode="share" />;
}
