"use client";

import Link from "next/link";
import type { Place } from "@travel-planner/core";
import { getPlaceDetails } from "@/lib/demo/place-details";
import { getPlaceGallery } from "@/lib/demo/place-galleries";
import { useI18n } from "@/lib/i18n/context";
import { SharePlaceImage } from "@/components/SharePlaceImage";
import { Camera, ChevronRight, Clock, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  place: Place;
  label: string;
  index: number;
  detailHref?: string;
  onRemove?: () => void;
}

function placeNames(place: Place) {
  if (place.nameI18n) return place.nameI18n;
  return { en: place.name, zh: place.name };
}

function placeIntro(place: Place, locale: "en" | "zh") {
  if (place.intro) return place.intro[locale];
  return place.whyRecommended;
}

export function SharePlaceCard({ place, label, index, detailHref, onRemove }: Props) {
  const { t, locale } = useI18n();
  const details = getPlaceDetails(place.id);
  const photoCount = getPlaceGallery(place.id, {
    url: place.imageUrl ?? "",
    credit: place.imageCredit,
  }).length;
  const names = placeNames(place);
  const primary = locale === "zh" ? names.zh : names.en;
  const secondary = locale === "zh" ? names.en : names.zh;

  const card = (
    <article className="group share-card overflow-hidden transition-all duration-300 hover:shadow-[var(--share-shadow-md)] hover:-translate-y-0.5">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f2f2f2] lg:aspect-[5/3]">
        {place.imageUrl ? (
          <SharePlaceImage
            src={place.imageUrl}
            alt={primary}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--share-accent)]/30 via-[#1a1a2e]/50 to-[#C9A227]/25" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="inline-block rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
            {label}
          </span>
          <h3 className="mt-1.5 font-[family-name:var(--font-share-serif)] text-xl font-bold leading-tight text-white">
            {primary}
          </h3>
          {secondary !== primary && (
            <p className="mt-0.5 text-sm text-white/85">{secondary}</p>
          )}
        </div>
        <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--share-green)] text-sm font-bold text-white shadow-lg ring-2 ring-white/40">
          {index}
        </span>
        {photoCount > 1 && (
          <span
            className={cn(
              "absolute flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm",
              onRemove ? "bottom-3 right-3" : "right-3 top-3"
            )}
          >
            <Camera className="h-3 w-3" />
            {photoCount}
          </span>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            className="share-focus absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-red-600"
            aria-label={t("share.removeStop")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-2.5 p-4 sm:p-5">
        {details?.hoursSummary && (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--share-green)]">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {details.hoursSummary[locale]}
          </p>
        )}
        {details?.address && (
          <p className="flex items-start gap-1.5 text-xs text-[var(--share-muted)] line-clamp-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {details.address[locale]}
          </p>
        )}
        {!details?.address && place.neighborhood && (
          <p className="flex items-center gap-1 text-xs text-[var(--share-muted)]">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {place.neighborhood}
          </p>
        )}
        <p className="text-sm leading-relaxed text-[#44403c] line-clamp-2">
          {placeIntro(place, locale)}
        </p>
        {detailHref && (
          <span
            className={cn(
              "mt-1 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
              "bg-[var(--share-green-soft)] text-[var(--share-green)] group-hover:bg-[var(--share-green)] group-hover:text-white"
            )}
          >
            {t("placeDetail.viewDetails")}
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </article>
  );

  if (detailHref) {
    return (
      <Link href={detailHref} className="block share-focus rounded-2xl">
        {card}
      </Link>
    );
  }

  return card;
}
