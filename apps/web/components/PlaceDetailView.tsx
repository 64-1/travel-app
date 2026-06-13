"use client";

import { useState } from "react";
import Link from "next/link";
import type { Place } from "@travel-planner/core";
import { PlacePhotoGallery } from "@/components/PlacePhotoGallery";
import { SinglePlaceMap } from "@/components/SinglePlaceMap";
import { getPlaceAbout } from "@/lib/demo/place-about";
import { getPlaceGallery } from "@/lib/demo/place-galleries";
import { getPlaceDetails } from "@/lib/demo/place-details";
import { getMapLinks } from "@/lib/map-links";
import { useI18n } from "@/lib/i18n/context";
import { dayLabel } from "@/lib/format";
import { ArrowLeft, Clock, Heart, MapPin, Phone, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "photos" | "overview" | "hours" | "location";

interface Props {
  place: Place;
  basePath: string;
  dayIndex: number;
  blockLabel: string;
}

function placeNames(place: Place) {
  if (place.nameI18n) return place.nameI18n;
  return { en: place.name, zh: place.name };
}

function HoursSidebar({
  locale,
  details,
}: {
  locale: "en" | "zh";
  details: ReturnType<typeof getPlaceDetails>;
}) {
  const { t } = useI18n();
  return (
    <div className="rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-[#1c1917]">{t("placeDetail.hoursTitle")}</h2>
      {details?.hoursSummary && (
        <p className="mt-2 text-sm font-medium text-[#00aa6c]">{details.hoursSummary[locale]}</p>
      )}
      {details?.weeklyHours ? (
        <ul className="mt-3 space-y-2">
          {details.weeklyHours.map((row) => (
            <li key={row.label.en} className="flex justify-between gap-3 text-sm">
              <span className="text-[#1c1917]">{row.label[locale]}</span>
              <span className="text-right text-[#595959]">{row.time[locale]}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-[#595959]">{t("placeDetail.hoursUnknown")}</p>
      )}
      <p className="mt-3 text-xs text-[#a8a29e]">{t("placeDetail.hoursDisclaimer")}</p>
    </div>
  );
}

export function PlaceDetailView({ place, basePath, dayIndex, blockLabel }: Props) {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<Tab>("overview");
  const [saved, setSaved] = useState(false);
  const details = getPlaceDetails(place.id);
  const about = getPlaceAbout(place.id);
  const photos = getPlaceGallery(place.id, {
    url: place.imageUrl ?? "",
    credit: place.imageCredit,
  });
  const names = placeNames(place);
  const title = locale === "zh" ? names.zh : names.en;
  const subtitle = locale === "zh" ? names.en : names.zh;
  const typeLabel =
    place.kind === "meal"
      ? t("placeDetail.typeMeal")
      : place.kind === "activity"
        ? t("placeDetail.typeActivity")
        : t("placeDetail.typeRestaurant");

  const tabs: { id: Tab; label: string }[] = [
    { id: "photos", label: t("placeDetail.tabPhotos") },
    { id: "overview", label: t("placeDetail.tabOverview") },
    { id: "hours", label: t("placeDetail.tabHours") },
    { id: "location", label: t("placeDetail.tabLocation") },
  ];

  const mapsLinks =
    place.lat && place.lng
      ? getMapLinks(place.lat, place.lng, locale === "zh" ? names.zh : names.en)
      : undefined;

  return (
    <div className="animate-in -mx-1">
      <Link
        href={`${basePath}/day/${dayIndex}`}
        className="share-btn-ghost share-focus mb-5 inline-flex items-center gap-1.5 rounded-full border border-[var(--share-border)] bg-[var(--share-card)] px-4 py-2 text-sm font-medium shadow-[var(--share-shadow-sm)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("placeDetail.backToDay", { day: dayLabel(dayIndex, locale) })}
      </Link>

      {/* Title row — TripAdvisor style */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-[#595959]">
            {typeLabel} · {blockLabel}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-share-serif)] text-2xl font-bold leading-tight text-[#1c1917] sm:text-[1.75rem]">
            {title}
          </h1>
          {subtitle !== title && (
            <p className="mt-0.5 text-sm text-[#595959]">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSaved((s) => !s)}
          className="shrink-0 rounded-full p-2 text-[#595959] transition-colors hover:bg-[#f2f2f2]"
          aria-label={saved ? t("placeDetail.savedPlace") : t("placeDetail.savePlace")}
        >
          <Heart className={cn("h-6 w-6", saved && "fill-[#00aa6c] text-[#00aa6c]")} />
        </button>
      </div>

      {/* Quick facts under title */}
      <div className="mt-4 space-y-2 border-b border-[#e0e0e0] pb-4">
        {details?.hoursSummary && (
          <p className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#00aa6c]" aria-hidden />
            <span className="font-medium text-[#00aa6c]">{details.hoursSummary[locale]}</span>
          </p>
        )}
        {details?.address && (
          <p className="flex items-start gap-2 text-sm text-[#1c1917]">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#595959]" />
            {details.address[locale]}
          </p>
        )}
        {details?.phone && (
          <p className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 shrink-0 text-[#595959]" />
            <a
              href={`tel:${details.phone.replace(/\s/g, "")}`}
              className="text-[#2563eb] hover:underline"
            >
              {details.phone}
            </a>
          </p>
        )}
      </div>

      {/* Underline tabs */}
      <nav className="sticky top-0 z-20 -mx-4 border-b border-[#e0e0e0] bg-white px-4">
        <div className="flex gap-0 overflow-x-auto scrollbar-none" role="tablist">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "shrink-0 border-b-[3px] px-4 py-3.5 text-sm transition-colors",
                tab === id
                  ? "border-[#1c1917] font-semibold text-[#1c1917]"
                  : "border-transparent font-medium text-[#595959] hover:text-[#1c1917]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Photo hero — visible on all tabs on desktop */}
      {photos.length > 0 && tab !== "photos" && (
        <div className="mt-4 hidden lg:block">
          <PlacePhotoGallery photos={photos} title={title} variant="hero" />
        </div>
      )}

      {/* Two-column body */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] lg:gap-10">
        <div className="min-w-0">
          {tab === "photos" && (
            <PlacePhotoGallery photos={photos} title={title} variant="grid" />
          )}

          {tab === "overview" && (
            <div className="space-y-8">
              {photos.length > 0 && (
                <div className="lg:hidden">
                  <PlacePhotoGallery photos={photos} title={title} variant="grid" />
                </div>
              )}

              {about && (
                <section>
                  <h2 className="text-lg font-bold text-[#1c1917]">{t("placeDetail.about")}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#333]">{about[locale]}</p>
                </section>
              )}

              {details?.relatedInfo && (
                <section>
                  <h2 className="text-lg font-bold text-[#1c1917]">{t("placeDetail.relatedInfo")}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#333]">
                    {details.relatedInfo[locale]}
                  </p>
                </section>
              )}

              <section>
                <h2 className="text-lg font-bold text-[#1c1917]">{t("placeDetail.features")}</h2>
                {details?.features ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {details.features[locale].map((f) => (
                      <li
                        key={f}
                        className="rounded border border-[#e0e0e0] bg-[#fafafa] px-3 py-1.5 text-sm text-[#333]"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-[#595959]">
                    {place.intro?.[locale] ?? place.whyRecommended}
                  </p>
                )}
              </section>

              <section>
                <p className="text-sm leading-relaxed text-[#333]">
                  {place.intro?.[locale] ?? place.whyRecommended}
                </p>
                {place.localTips && place.localTips.length > 0 && (
                  <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[#333]">
                    {place.localTips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#1c1917]">{t("placeDetail.locationSection")}</h2>
                {details?.address && (
                  <p className="mt-2 text-sm text-[#333]">{details.address[locale]}</p>
                )}
                {place.neighborhood && (
                  <p className="mt-1 text-sm text-[#595959]">{place.neighborhood}</p>
                )}
                <div className="mt-4">
                  <SinglePlaceMap place={place} height={240} />
                </div>
              </section>
            </div>
          )}

          {tab === "hours" && (
            <div className="space-y-4">
              {details?.hoursSummary && (
                <p className="flex items-center gap-2 text-sm font-medium text-[#00aa6c]">
                  <span className="h-2 w-2 rounded-full bg-[#00aa6c]" aria-hidden />
                  {details.hoursSummary[locale]}
                </p>
              )}
              {details?.weeklyHours ? (
                <ul className="divide-y divide-[#e0e0e0] rounded-lg border border-[#e0e0e0]">
                  {details.weeklyHours.map((row) => (
                    <li
                      key={row.label.en}
                      className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-[#1c1917]">{row.label[locale]}</span>
                      <span className="text-[#595959]">{row.time[locale]}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#595959]">{t("placeDetail.hoursUnknown")}</p>
              )}
              <p className="text-xs text-[#a8a29e]">{t("placeDetail.hoursDisclaimer")}</p>
            </div>
          )}

          {tab === "location" && (
            <div className="space-y-6">
              {details?.address && (
                <section>
                  <h2 className="text-lg font-bold text-[#1c1917]">{t("placeDetail.address")}</h2>
                  <p className="mt-2 text-sm text-[#333]">{details.address[locale]}</p>
                  {place.neighborhood && (
                    <p className="mt-1 text-sm text-[#595959]">{place.neighborhood}</p>
                  )}
                </section>
              )}
              <SinglePlaceMap place={place} height={320} />
              {details?.gettingThere && (
                <section>
                  <h2 className="text-lg font-bold text-[#1c1917]">{t("placeDetail.gettingThere")}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#333]">
                    {details.gettingThere[locale]}
                  </p>
                </section>
              )}
              <div className="flex flex-wrap gap-3">
                {mapsLinks && (
                  <>
                    <a
                      href={mapsLinks.gaode}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border-2 border-[#00aa6c] px-5 py-2 text-sm font-semibold text-[#00aa6c] hover:bg-[#00aa6c]/5"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t("placeDetail.openInGaode")}
                    </a>
                    <a
                      href={mapsLinks.google}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[#e0e0e0] px-5 py-2 text-sm font-semibold text-[#1c1917] hover:bg-[#fafafa]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t("placeDetail.openInMaps")}
                    </a>
                    <a
                      href={mapsLinks.apple}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[#e0e0e0] px-5 py-2 text-sm font-semibold text-[#1c1917] hover:bg-[#fafafa]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t("placeDetail.openInAppleMaps")}
                    </a>
                  </>
                )}
                {details?.website && (
                  <a
                    href={details.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#2563eb] hover:underline"
                  >
                    {t("placeDetail.website")}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar — TripAdvisor save + hours */}
        <aside className="hidden space-y-4 lg:block">
          <div className="rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-[#1c1917]">{t("placeDetail.savePlace")}</p>
            <button
              type="button"
              onClick={() => setSaved((s) => !s)}
              className={cn(
                "mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 py-2.5 text-sm font-semibold transition-colors",
                saved
                  ? "border-[#00aa6c] bg-[#00aa6c] text-white"
                  : "border-[#00aa6c] text-[#00aa6c] hover:bg-[#00aa6c]/5"
              )}
            >
              <Heart className={cn("h-4 w-4", saved && "fill-white")} />
              {saved ? t("placeDetail.savedPlace") : t("placeDetail.save")}
            </button>
          </div>
          <HoursSidebar locale={locale} details={details} />
        </aside>
      </div>

      {/* Mobile save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e0e0e0] bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:hidden">
        <button
          type="button"
          onClick={() => setSaved((s) => !s)}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-full border-2 py-3 text-sm font-semibold",
            saved
              ? "border-[#00aa6c] bg-[#00aa6c] text-white"
              : "border-[#00aa6c] text-[#00aa6c]"
          )}
        >
          <Heart className={cn("h-4 w-4", saved && "fill-white")} />
          {saved ? t("placeDetail.savedPlace") : t("placeDetail.save")}
        </button>
      </div>
      <div className="h-16 lg:hidden" aria-hidden />
    </div>
  );
}
