"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Trip } from "@travel-planner/core";
import { useI18n } from "@/lib/i18n/context";
import { getTripMapStops } from "@/lib/map-places";
import { cn } from "@/lib/utils";

interface Props {
  trip: Trip;
  dayIndex?: number;
  height?: number;
  className?: string;
  basePath?: string;
  /** Hide section title when map is inside a card */
  embedded?: boolean;
}

export function ShareTripMap({
  trip,
  dayIndex,
  height,
  className,
  basePath,
  embedded,
}: Props) {
  const { t, locale } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  const stops = getTripMapStops(trip, dayIndex);
  const stopsKey = stops.map((s) => `${s.place.id}:${s.place.lat}:${s.place.lng}`).join("|");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;

      if (cancelled) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      if (!stops.length) return;

      const map = L.map(container, {
        scrollWheelZoom: false,
        zoomControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const bounds = L.latLngBounds([]);

      stops.forEach(({ place, index }) => {
        if (!place.lat || !place.lng) return;

        const latlng = L.latLng(place.lat, place.lng);
        bounds.extend(latlng);

        const label = String(index);
        const icon = L.divIcon({
          className: "share-map-marker",
          html: `<div class="share-map-marker-pin">${label}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const name =
          locale === "zh"
            ? place.nameI18n?.zh ?? place.name
            : place.nameI18n?.en ?? place.name;

        const detailLink = basePath
          ? `<br/><a href="${basePath}/place/${place.id}" style="color:#00875a;font-size:12px;margin-top:4px;display:inline-block;font-weight:600">${t("placeDetail.viewDetails")} →</a>`
          : "";
        L.marker(latlng, { icon })
          .addTo(map)
          .bindPopup(
            `<strong>${index}. ${name}</strong>${place.neighborhood ? `<br/><span style="color:#78716c;font-size:12px">${place.neighborhood}</span>` : ""}${detailLink}`
          );
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
      } else {
        map.setView([31.23, 121.47], 11);
      }

      requestAnimationFrame(() => map.invalidateSize());
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [stopsKey, locale, trip.id, dayIndex, basePath, t]);

  if (!stops.length) {
    return (
      <div className="rounded-xl bg-[var(--share-bg)] p-8 text-center text-sm text-[var(--share-muted)]">
        {t("trip.noPlacesMap")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!embedded && (
        <h2 className="font-[family-name:var(--font-share-serif)] text-lg font-bold">
          {dayIndex !== undefined ? t("share.dayMap") : t("share.tripMap")}
        </h2>
      )}
      {embedded && (
        <p className="text-sm font-semibold text-[var(--share-muted)]">
          {dayIndex !== undefined ? t("share.dayMap") : t("share.tripMap")}
        </p>
      )}
      <div
        ref={containerRef}
        className={cn(
          "z-0 w-full overflow-hidden rounded-xl bg-[#e8e4dc] ring-1 ring-[var(--share-border)]",
          !className && "h-[300px]",
          className
        )}
        style={height !== undefined ? { height } : undefined}
      />
      <ul className="flex flex-wrap gap-2">
        {stops.map(({ place, index }) => {
          const name =
            locale === "zh" ? place.nameI18n?.zh ?? place.name : place.nameI18n?.en ?? place.name;
          const chip = (
            <>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--share-green)] text-[10px] font-bold text-white">
                {index}
              </span>
              <span className="truncate">{name}</span>
            </>
          );
          return (
            <li key={place.id}>
              {basePath ? (
                <Link
                  href={`${basePath}/place/${place.id}`}
                  className="share-focus flex max-w-[200px] items-center gap-1.5 rounded-full border border-[var(--share-border)] bg-[var(--share-bg)] px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-[var(--share-green)] hover:bg-[var(--share-green-soft)] hover:text-[var(--share-green)] sm:max-w-none"
                >
                  {chip}
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full border border-[var(--share-border)] bg-[var(--share-bg)] px-2.5 py-1.5 text-xs font-medium">
                  {chip}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
