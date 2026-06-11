"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Trip } from "@travel-planner/core";
import { getSelectedPlace } from "@travel-planner/core";
import { DM_Sans, Noto_Serif_SC } from "next/font/google";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SharePlaceCard } from "@/components/SharePlaceCard";
import { ShareTripMap } from "@/components/ShareTripMap";
import { useI18n } from "@/lib/i18n/context";
import { dayLabel, tripDurationLabel } from "@/lib/format";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-share-sans" });
const notoSerifSc = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-share-serif",
});

const HERO_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Pudong_Shanghai_November_2017_panorama.jpg/1280px-Pudong_Shanghai_November_2017_panorama.jpg";

interface Props {
  trip: Trip;
  mode?: "share" | "demo";
}

export function TripShareView({ trip, mode = "share" }: Props) {
  const { t, locale } = useI18n();
  const [activeDay, setActiveDay] = useState(0);
  const dayRefs = useRef<(HTMLElement | null)[]>([]);

  const duration = tripDurationLabel(trip.startDate, trip.endDate, locale);
  const destinationLabel = locale === "zh" ? "上海" : trip.destination;

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    dayRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveDay(i);
        },
        { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [trip.days.length]);

  function scrollToDay(index: number) {
    dayRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const tripTitle = locale === "zh" ? "上海之旅" : "Shanghai Trip";

  return (
    <div
      className={cn(
        dmSans.variable,
        notoSerifSc.variable,
        "min-h-dvh bg-[#f8f7f4] font-[family-name:var(--font-share-sans)] text-[#1c1917]"
      )}
    >
      {/* Hero */}
      <header className="relative min-h-[52vh] overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt={tripTitle}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-[#f8f7f4]" />
        <div className="absolute inset-x-0 top-0 flex justify-end p-4">
          <LanguageSwitcher compact />
        </div>
        <div className="absolute inset-x-0 bottom-0 px-4 pb-10 pt-24">
          <div className="mx-auto max-w-2xl">
            {mode === "share" && (
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-white/70">
                {t("share.readOnly")}
              </p>
            )}
            <h1 className="font-[family-name:var(--font-share-serif)] text-4xl font-bold leading-tight text-white sm:text-5xl">
              {tripTitle}
            </h1>
            <p className="mt-2 text-base text-white/90">
              {t("share.heroSubtitle", { days: duration, destination: destinationLabel })}
            </p>
            <p className="mt-4 flex items-center gap-1 text-xs text-white/60">
              <ChevronDown className="h-4 w-4 animate-bounce" />
              {t("share.scrollHint")}
            </p>
          </div>
        </div>
      </header>

      {/* Day nav */}
      <nav className="sticky top-0 z-20 border-b border-[#e7e5e4] bg-[#f8f7f4]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <p className="mb-2 text-xs font-medium text-[#78716c]">{t("share.dayNav")}</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {trip.days.map((day, i) => (
              <button
                key={day.dayIndex}
                type="button"
                onClick={() => scrollToDay(i)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  activeDay === i
                    ? "bg-[#9B2D30] text-white"
                    : "bg-white text-[#78716c] hover:text-[#1c1917]"
                )}
              >
                {dayLabel(day.dayIndex, locale)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Days */}
      <main className="mx-auto max-w-2xl space-y-12 px-4 py-10">
        {trip.days.map((day, dayIdx) => {
          const blocks = day.blocks.filter((b) => b.status !== "skipped");
          let stopIndex = 0;

          return (
            <section
              key={day.dayIndex}
              ref={(el) => {
                dayRefs.current[dayIdx] = el;
              }}
              className="scroll-mt-28 space-y-5"
              id={`day-${day.dayIndex}`}
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A227]">
                  {dayLabel(day.dayIndex, locale)}
                </p>
                {day.theme && (
                  <h2 className="font-[family-name:var(--font-share-serif)] text-2xl font-bold text-[#9B2D30]">
                    {day.theme}
                  </h2>
                )}
                {day.neighborhoods.length > 0 && (
                  <p className="text-sm text-[#78716c]">{day.neighborhoods.join(" → ")}</p>
                )}
              </div>

              <div className="space-y-5">
                {blocks.map((block) => {
                  const place = getSelectedPlace(block);
                  if (!place) return null;
                  stopIndex += 1;
                  const globalIndex =
                    trip.days
                      .slice(0, dayIdx)
                      .reduce((n, d) => n + d.blocks.filter((b) => b.status !== "skipped").length, 0) +
                    stopIndex;

                  return (
                    <SharePlaceCard
                      key={block.id}
                      place={place}
                      label={block.label}
                      index={globalIndex}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}

        <ShareTripMap trip={trip} />

        <footer className="space-y-4 border-t border-[#e7e5e4] pt-8 pb-12 text-center">
          <p className="text-xs text-[#a8a29e]">{t("share.madeWith")}</p>
          <Link
            href="/"
            className="inline-block text-sm font-medium text-[#9B2D30] hover:underline"
          >
            {t("share.planOwn")}
          </Link>
        </footer>
      </main>
    </div>
  );
}
