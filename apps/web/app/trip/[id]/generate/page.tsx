"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TripProgress } from "@/components/TripProgress";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { getGenerationStatuses } from "@/lib/i18n";
import { Sparkles } from "lucide-react";

export default function GeneratePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useI18n();
  const [statusIndex, setStatusIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const statuses = getGenerationStatuses(locale);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % statuses.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [statuses.length]);

  useEffect(() => {
    async function generate() {
      try {
        const res = await fetch(`/api/trips/${id}/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fromDay: 0, locale }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Generation failed");
        }
        router.push(`/trip/${id}/itinerary/day/0`);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("generate.errorGeneric"));
      }
    }
    generate();
  }, [id, router, locale, t]);

  return (
    <div className="mx-auto max-w-md py-8 space-y-8">
      <TripProgress current="day1" />

      <div className="flex flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="h-20 w-20 rounded-2xl bg-accent flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <div className="absolute -inset-2 rounded-3xl border-2 border-primary/20 animate-ping" />
        </div>

        <h1 className="text-xl font-bold">{t("generate.title")}</h1>
        <p className="mt-3 text-muted-foreground min-h-[1.5rem] transition-opacity">
          {statuses[statusIndex]}
        </p>
        <p className="mt-6 text-xs text-muted-foreground">{t("generate.usually")}</p>

        {error && (
          <div className="mt-8 w-full rounded-xl border border-red-200 bg-red-50 p-4 text-left">
            <p className="text-sm font-medium text-red-900">{t("generate.errorTitle")}</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => window.location.reload()}>
                {t("common.tryAgain")}
              </Button>
              <Link href={`/trip/${id}`}>
                <Button variant="outline" size="sm">{t("common.backToTrip")}</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
