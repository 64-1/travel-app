"use client";

import { useEffect, useRef } from "react";
import type { Place } from "@travel-planner/core";

interface Props {
  place: Place;
  height?: number;
}

export function SinglePlaceMap({ place, height = 280 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!place.lat || !place.lng || !containerRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current!, {
        scrollWheelZoom: false,
        zoomControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const latlng = L.latLng(place.lat!, place.lng!);
      const icon = L.divIcon({
        className: "share-map-marker",
        html: `<div class="share-map-marker-pin" style="width:32px;height:32px;font-size:14px">★</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker(latlng, { icon }).addTo(map);
      map.setView(latlng, 15);
      requestAnimationFrame(() => map.invalidateSize());
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [place.id, place.lat, place.lng]);

  if (!place.lat || !place.lng) return null;

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-xl border border-[#e7e5e4] bg-[#e8e4dc]"
      style={{ height }}
    />
  );
}
