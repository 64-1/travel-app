"use client";

import { useState } from "react";
import type { Place } from "@travel-planner/core";
import type { PlaceDetailRecord } from "@/lib/demo/place-details";
import { SharePlaceImage } from "@/components/SharePlaceImage";
import { useI18n } from "@/lib/i18n/context";
import { destinationDisplayName } from "@/lib/destinations/registry";
import type { TranslationKey } from "@/lib/i18n";
import { Loader2, MapPin, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResolvedResponse {
  place: Place;
  details?: PlaceDetailRecord;
  matchedFrom?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  destination: string;
  onAddPlace: (place: Place, label: string, details?: PlaceDetailRecord) => void;
  catalog: Place[];
  existingPlaceIds: Set<string>;
}

export function ShareAddStopDialog({
  open,
  onClose,
  destination,
  onAddPlace,
  catalog,
  existingPlaceIds,
}: Props) {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<"search" | "catalog">("search");
  const [label, setLabel] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ResolvedResponse | null>(null);

  if (!open) return null;

  const available = catalog.filter((p) => !existingPlaceIds.has(p.id));

  function resetForm() {
    setLabel("");
    setQuery("");
    setError(null);
    setPreview(null);
    setLoading(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const res = await fetch("/api/places/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: query.trim(), destination }),
      });
      if (!res.ok) throw new Error("search failed");
      const data = (await res.json()) as ResolvedResponse;
      if (!data.place?.name) throw new Error("no place");
      setPreview(data);
    } catch {
      setError(t("share.searchFailed"));
    } finally {
      setLoading(false);
    }
  }

  function handleConfirmPreview() {
    if (!preview) return;
    const blockLabel =
      label.trim() || (preview.place.kind === "meal" ? "Meal" : "Stop");
    onAddPlace(preview.place, blockLabel, preview.details);
    resetForm();
    onClose();
  }

  function handleAddCatalog(place: Place) {
    const blockLabel =
      label.trim() || (place.kind === "meal" ? "Meal" : "Stop");
    onAddPlace(place, blockLabel);
    resetForm();
    onClose();
  }

  const previewName = preview
    ? locale === "zh"
      ? preview.place.nameI18n?.zh ?? preview.place.name
      : preview.place.nameI18n?.en ?? preview.place.name
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="share-card flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-[var(--share-border)] px-5 py-4">
          <h3 className="font-[family-name:var(--font-share-serif)] text-lg font-bold">
            {t("share.addStop")}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="share-focus rounded-full p-1.5 hover:bg-[var(--share-bg)]"
            aria-label={t("common.cancel")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-[var(--share-border)] px-5">
          {(["search", "catalog"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setPreview(null);
                setError(null);
              }}
              className={cn(
                "share-focus border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                tab === id
                  ? "border-[var(--share-accent)] text-[var(--share-accent)]"
                  : "border-transparent text-[var(--share-muted)]"
              )}
            >
              {id === "catalog"
                ? t("share.addFromList", {
                    destination: destinationDisplayName(destination, locale),
                  })
                : t("share.searchPlace")}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--share-muted)]">
              {t("dayActions.blockLabel")}
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("share.blockLabelHint")}
              className="mt-1 w-full rounded-xl border border-[var(--share-border)] bg-[var(--share-bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--share-accent)]"
            />
          </div>

          {tab === "search" ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--share-muted)]">
                  {t("share.searchPlaceHint")}
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={t("share.searchPlaceholder")}
                    className="min-w-0 flex-1 rounded-xl border border-[var(--share-border)] bg-[var(--share-bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--share-accent)]"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={!query.trim() || loading}
                    className="share-btn-primary share-focus flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    {t("share.search")}
                  </button>
                </div>
                <p className="mt-2 text-xs text-[var(--share-muted)]">
                  {t("share.searchHelp")}
                </p>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}

              {preview && (
                <div className="share-card space-y-3 overflow-hidden p-0">
                  {preview.place.imageUrl && (
                    <div className="relative aspect-[16/10] bg-[#f2f2f2]">
                      <SharePlaceImage
                        src={preview.place.imageUrl}
                        alt={previewName}
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-3 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--share-green)]">
                    {t(
                      `share.matchedFrom.${preview.matchedFrom ?? "ai"}` as TranslationKey
                    )}
                  </p>
                  <h4 className="font-[family-name:var(--font-share-serif)] text-lg font-bold">
                    {previewName}
                  </h4>
                  {preview.details?.address && (
                    <p className="flex items-start gap-1.5 text-sm text-[var(--share-muted)]">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      {preview.details.address[locale]}
                    </p>
                  )}
                  {preview.place.neighborhood && !preview.details?.address && (
                    <p className="text-sm text-[var(--share-muted)]">{preview.place.neighborhood}</p>
                  )}
                  <p className="text-sm leading-relaxed text-[#44403c]">
                    {preview.place.intro?.[locale] ?? preview.place.whyRecommended}
                  </p>
                  {preview.place.imageCredit && (
                    <p className="text-[10px] text-[var(--share-muted)]">
                      {t("share.photoCredit", { credit: preview.place.imageCredit })}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleConfirmPreview}
                    className="share-btn-primary share-focus flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold"
                  >
                    <Plus className="h-4 w-4" />
                    {t("share.addToDay")}
                  </button>
                  </div>
                </div>
              )}
            </div>
          ) : available.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--share-muted)]">
              {t("share.allPlacesAdded")}
            </p>
          ) : (
            <ul className="space-y-2">
              {available.map((place) => {
                const title =
                  locale === "zh"
                    ? place.nameI18n?.zh ?? place.name
                    : place.nameI18n?.en ?? place.name;
                return (
                  <li key={place.id}>
                    <button
                      type="button"
                      onClick={() => handleAddCatalog(place)}
                      className="share-focus flex w-full items-center gap-3 rounded-xl border border-[var(--share-border)] bg-[var(--share-bg)] px-4 py-3 text-left transition-colors hover:border-[var(--share-green)] hover:bg-[var(--share-green-soft)]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--share-accent-soft)] text-[var(--share-accent)]">
                        <Plus className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{title}</span>
                        {place.neighborhood && (
                          <span className="text-xs text-[var(--share-muted)]">
                            {place.neighborhood}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
