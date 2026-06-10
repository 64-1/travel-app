"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Trip } from "@travel-planner/core";
import { WishlistInbox } from "@/components/WishlistInbox";
import { TripProgress } from "@/components/TripProgress";
import { PageSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Sparkles, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/trips/${id}`)
      .then((r) => r.json())
      .then(setTrip)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSkeleton />;
  if (!trip) return <p className="text-center text-muted-foreground py-12">{t("common.notFound")}</p>;

  return (
    <div className="space-y-6">
      <TripProgress current="wishlist" />

      <header>
        <h1 className="text-2xl font-bold">{t("wishlist.pageTitle", { destination: trip.destination })}</h1>
        <p className="text-muted-foreground mt-1">{t("wishlist.pageSubtitle")}</p>
      </header>

      <WishlistInbox trip={trip} onUpdate={setTrip} />

      <div className="sticky bottom-4 flex flex-col gap-2 sm:flex-row sm:items-center rounded-xl border border-border bg-card/95 backdrop-blur p-4 shadow-lg">
        <div className="flex-1">
          <p className="font-medium text-sm">{t("wishlist.readyTitle")}</p>
          <p className="text-xs text-muted-foreground">
            {trip.wishlist.length > 0
              ? t("wishlist.spotsSavedPlural", { count: trip.wishlist.length })
              : t("wishlist.noSpotsYet")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/trip/${id}/generate`)}>
            {t("wishlist.skipForNow")}
          </Button>
          <Button onClick={() => router.push(`/trip/${id}/generate`)}>
            <Sparkles className="h-4 w-4 mr-1" />
            {t("wishlist.buildDay1")}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        <Link href={`/trip/${id}`} className="hover:text-foreground underline-offset-2 hover:underline">
          {t("common.backToTrip")}
        </Link>
      </p>
    </div>
  );
}
