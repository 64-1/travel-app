"use client";

import Image from "next/image";
import type { Place } from "@travel-planner/core";
import { useI18n } from "@/lib/i18n/context";
import { MapPin } from "lucide-react";

interface Props {
  place: Place;
  label: string;
  index: number;
}

function placeNames(place: Place) {
  if (place.nameI18n) return place.nameI18n;
  return { en: place.name, zh: place.name };
}

function placeIntro(place: Place, locale: "en" | "zh") {
  if (place.intro) return place.intro[locale];
  return place.whyRecommended;
}

export function SharePlaceCard({ place, label, index }: Props) {
  const { t, locale } = useI18n();
  const names = placeNames(place);
  const primary = locale === "zh" ? names.zh : names.en;
  const secondary = locale === "zh" ? names.en : names.zh;

  return (
    <article className="group animate-in overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f0eeea]">
        {place.imageUrl ? (
          <Image
            src={place.imageUrl}
            alt={primary}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#9B2D30]/20 via-[#C9A227]/10 to-[#2563eb]/15" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="text-xs font-medium uppercase tracking-wider text-white/80">{label}</p>
          <h3 className="mt-1 font-serif text-xl font-bold leading-tight">{primary}</h3>
          {secondary !== primary && (
            <p className="mt-0.5 text-sm text-white/85">{secondary}</p>
          )}
        </div>
        <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-[#9B2D30] shadow">
          {index}
        </span>
      </div>
      <div className="space-y-2 p-4">
        {place.neighborhood && (
          <p className="flex items-center gap-1 text-xs text-[#78716c]">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {place.neighborhood}
          </p>
        )}
        <p className="text-sm leading-relaxed text-[#44403c]">{placeIntro(place, locale)}</p>
        {place.imageCredit && (
          <p className="text-[10px] text-[#a8a29e]">
            {t("share.photoCredit", { credit: place.imageCredit })}
          </p>
        )}
      </div>
    </article>
  );
}
