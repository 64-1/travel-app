"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Trip } from "@travel-planner/core";
import { DM_Sans, Noto_Serif_SC } from "next/font/google";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";
import { dayLabel, tripDurationLabel } from "@/lib/format";
import { SHANGHAI_HERO_VIDEO } from "@/lib/demo/place-images";
import { getTripHeroConfig } from "@/lib/trip-hero";
import { destinationDisplayName } from "@/lib/destinations/registry";
import { ShareHeroMedia } from "@/components/ShareHeroMedia";
import { shareShellWidth } from "@/lib/share-layout";
import { useEditableTripOptional } from "@/lib/editable-trip-context";
import { Map, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-share-sans" });
const notoSerifSc = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-share-serif",
});

interface Props {
  trip: Trip;
  basePath: string;
  mode?: "share" | "demo";
  children: React.ReactNode;
}

function dayStopCount(trip: Trip, dayIndex: number) {
  const day = trip.days.find((d) => d.dayIndex === dayIndex);
  return day?.blocks.filter((b) => b.status !== "skipped").length ?? 0;
}

export function TripShareShell({ trip, basePath, mode = "share", children }: Props) {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const editableCtx = useEditableTripOptional();
  const duration = tripDurationLabel(trip.startDate, trip.endDate, locale);
  const destinationLabel = destinationDisplayName(trip.destination, locale, trip.id);
  const tripTitle = t("share.tripTitle", { destination: destinationLabel });
  const heroConfig = getTripHeroConfig(trip);
  const isMapPage = pathname.endsWith("/map");
  const isPlacePage = pathname.includes("/place/");

  function isDayActive(dayIndex: number) {
    return pathname === `${basePath}/day/${dayIndex}`;
  }

  const shellWidth = shareShellWidth(isPlacePage);

  return (
    <div
      className={cn(
        dmSans.variable,
        notoSerifSc.variable,
        "share-page min-h-dvh font-[family-name:var(--font-share-sans)] text-[var(--share-text)]"
      )}
    >
      <header className="border-b border-[var(--share-border)] bg-[var(--share-card)]">
        <div className={cn("flex items-center justify-between gap-4 py-3", shellWidth)}>
          <Link href={`${basePath}/day/0`} className="min-w-0 share-focus rounded-lg">
            <p className="truncate font-[family-name:var(--font-share-serif)] text-lg font-bold">
              {tripTitle}
            </p>
            <p className="truncate text-xs text-[var(--share-muted)]">
              {t("share.heroSubtitle", { days: duration, destination: destinationLabel })}
            </p>
          </Link>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <LanguageSwitcher compact />
            {editableCtx?.isDirty && (
              <p className="text-[10px] text-[var(--share-muted)]">{t("share.editedLocally")}</p>
            )}
          </div>
        </div>
      </header>

      {mode === "share" && !isPlacePage && (
        <div className={cn("border-b border-[var(--share-border)] bg-[var(--share-accent-soft)]/60", shellWidth)}>
          <p className="py-2 text-center text-xs text-[var(--share-muted)] sm:text-left">
            {t("share.personalCopyHint")}
          </p>
        </div>
      )}

      {!isPlacePage && (
        <div className={cn("pt-4", shellWidth)}>
          <div className="share-card relative aspect-[21/9] max-h-44 w-full overflow-hidden sm:max-h-52 lg:max-h-64 lg:aspect-[2.6/1]">
            <ShareHeroMedia
              config={heroConfig}
              alt={tripTitle}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                <Sparkles className="h-3 w-3" />
                {destinationLabel}
              </p>
              <h1 className="mt-1 font-[family-name:var(--font-share-serif)] text-xl font-bold text-white sm:text-2xl">
                {tripTitle}
              </h1>
              <p className="mt-0.5 text-xs text-white/80 sm:text-sm">
                {t("share.heroSubtitle", { days: duration, destination: destinationLabel })}
              </p>
            </div>
            {mode === "share" && (
              <p className="absolute right-14 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white/90 backdrop-blur-sm">
                {t("share.personalCopy")}
              </p>
            )}
          </div>
          <p className="mt-3 text-center text-xs text-[var(--share-muted)]">{t("share.scrollHint")}</p>
        </div>
      )}

      {!isPlacePage && (
      <nav className="sticky top-0 z-30 border-b border-[var(--share-border)] bg-[var(--share-card)]/95 shadow-sm backdrop-blur-md">
        <div className={shellWidth}>
          <div
            className="flex gap-1.5 overflow-x-auto py-2.5 scrollbar-none sm:gap-2"
            role="tablist"
          >
            {trip.days.map((day) => {
              const active = isDayActive(day.dayIndex);
              const stops = dayStopCount(trip, day.dayIndex);
              return (
                <Link
                  key={day.dayIndex}
                  href={`${basePath}/day/${day.dayIndex}`}
                  role="tab"
                  aria-selected={active}
                  className={cn(
                    "share-focus flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition-all sm:px-4",
                    active
                      ? "bg-[var(--share-accent)] font-semibold text-white shadow-md"
                      : "bg-[var(--share-bg)] font-medium text-[var(--share-muted)] hover:bg-[var(--share-accent-soft)] hover:text-[var(--share-accent)]"
                  )}
                >
                  {dayLabel(day.dayIndex, locale)}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      active ? "bg-white/20 text-white" : "bg-white text-[var(--share-muted)]"
                    )}
                  >
                    {stops}
                  </span>
                </Link>
              );
            })}
            <Link
              href={`${basePath}/map`}
              role="tab"
              aria-selected={isMapPage}
              className={cn(
                "share-focus flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition-all sm:px-4",
                isMapPage
                  ? "bg-[var(--share-accent)] font-semibold text-white shadow-md"
                  : "bg-[var(--share-bg)] font-medium text-[var(--share-muted)] hover:bg-[var(--share-accent-soft)] hover:text-[var(--share-accent)]"
              )}
            >
              <Map className="h-3.5 w-3.5" />
              {t("share.tabMap")}
            </Link>
          </div>
        </div>
      </nav>
      )}

      <main className={cn("py-6 pb-20 lg:pb-10", shellWidth)}>{children}</main>

      <footer className="border-t border-[var(--share-border)] bg-[var(--share-card)] py-8 text-center">
        <p className="mb-3 text-xs text-[var(--share-muted)]">{t("share.madeWith")}</p>
        <Link
          href="/"
          className="share-btn-primary inline-flex rounded-full px-5 py-2 text-sm font-semibold share-focus"
        >
          {t("share.planOwn")}
        </Link>
      </footer>
    </div>
  );
}
