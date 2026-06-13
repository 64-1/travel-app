"use client";

import { useState } from "react";
import type { GalleryPhoto } from "@/lib/demo/place-galleries";
import { SharePlaceImage } from "@/components/SharePlaceImage";
import { useI18n } from "@/lib/i18n/context";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  photos: GalleryPhoto[];
  title: string;
  variant?: "hero" | "grid";
}

export function PlacePhotoGallery({ photos, title, variant = "grid" }: Props) {
  const { t, locale } = useI18n();
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!photos.length) return null;

  const current = photos[active];
  const caption = current.caption?.[locale];

  if (variant === "hero") {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="relative aspect-[21/9] w-full overflow-hidden rounded-lg bg-[#f2f2f2] lg:aspect-[2.4/1]"
        >
          <SharePlaceImage src={current.url} alt={title} className="object-cover" />
          {photos.length > 1 && (
            <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
              {t("placeDetail.photoCount", { count: String(photos.length) })}
            </span>
          )}
        </button>
        {caption && <p className="text-sm text-[#595959]">{caption}</p>}
        {current.credit && (
          <p className="text-xs text-[#a8a29e]">
            {t("share.photoCredit", { credit: current.credit })}
          </p>
        )}
        <Lightbox
          open={lightbox}
          photos={photos}
          index={active}
          title={title}
          onClose={() => setLightbox(false)}
          onChange={setActive}
        />
      </div>
    );
  }

  const side = photos.slice(1, 5);

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 lg:gap-2 lg:h-[min(420px,50vw)]">
        <button
          type="button"
          onClick={() => {
            setActive(0);
            setLightbox(true);
          }}
          className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#f2f2f2] sm:col-span-2 lg:col-span-2 lg:row-span-2 lg:aspect-auto lg:h-full"
        >
          <SharePlaceImage src={photos[0].url} alt={title} className="object-cover" />
        </button>
        {side.map((photo, i) => {
          const idx = i + 1;
          const isLast = i === side.length - 1 && photos.length > 5;
          return (
            <button
              key={photo.url}
              type="button"
              onClick={() => {
                setActive(idx);
                setLightbox(true);
              }}
              className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#f2f2f2] lg:aspect-auto lg:h-full"
            >
              <SharePlaceImage src={photo.url} alt={title} className="object-cover" />
              {isLast && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                  +{photos.length - 5}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-[#a8a29e]">{t("placeDetail.photosNote")}</p>

      <Lightbox
        open={lightbox}
        photos={photos}
        index={active}
        title={title}
        onClose={() => setLightbox(false)}
        onChange={setActive}
      />
    </div>
  );
}

function Lightbox({
  open,
  photos,
  index,
  title,
  onClose,
  onChange,
}: {
  open: boolean;
  photos: GalleryPhoto[];
  index: number;
  title: string;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  const { t, locale } = useI18n();
  if (!open) return null;

  const photo = photos[index];
  const caption = photo.caption?.[locale];

  function prev() {
    onChange((index - 1 + photos.length) % photos.length);
  }
  function next() {
    onChange((index + 1) % photos.length);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      role="dialog"
      aria-label={title}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <p className="text-sm font-medium">
          {index + 1} / {photos.length}
        </p>
        <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-white/10">
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-4 pb-4">
        {photos.length > 1 && (
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 lg:left-6"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <div className="relative h-full w-full max-h-[70vh] max-w-5xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt={caption ?? title}
            className="mx-auto max-h-[70vh] w-auto max-w-full object-contain"
          />
        </div>
        {photos.length > 1 && (
          <button
            type="button"
            onClick={next}
            className="absolute right-2 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 lg:right-6"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
      <div className="space-y-1 px-4 pb-6 text-center text-white">
        {caption && <p className="text-sm">{caption}</p>}
        {photo.credit && (
          <p className="text-xs text-white/60">
            {t("share.photoCredit", { credit: photo.credit })}
          </p>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-none">
          {photos.map((p, i) => (
            <button
              key={p.url}
              type="button"
              onClick={() => onChange(i)}
              className={cn(
                "relative h-14 w-20 shrink-0 overflow-hidden rounded border-2",
                i === index ? "border-white" : "border-transparent opacity-70"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
