"use client";

import { useMemo, useState } from "react";
import type { DayPlan, Trip } from "@travel-planner/core";
import { getSelectedPlace } from "@travel-planner/core";
import { ShareSortableStops } from "@/components/ShareSortableStops";
import { ShareTripMap } from "@/components/ShareTripMap";
import { ShareDayNav } from "@/components/ShareDayNav";
import { ShareAddStopDialog } from "@/components/ShareAddStopDialog";
import { useEditableTrip } from "@/lib/editable-trip-context";
import { SHANGHAI_PLACE_CATALOG } from "@/lib/demo/shanghai-trip";
import { useConfirmDialog } from "@/lib/use-confirm-dialog";
import { useI18n } from "@/lib/i18n/context";
import { dayLabel } from "@/lib/format";
import { MapPin, Plus, RotateCcw, Route } from "lucide-react";

interface DayPanelProps {
  day: DayPlan;
  trip: Trip;
  basePath: string;
}

export function ShareDayPanel({ day, trip, basePath }: DayPanelProps) {
  const { t, locale } = useI18n();
  const { editable, removeBlock, reorderBlocks, addPlaceBlock, resetTrip, isDirty } = useEditableTrip();
  const [addOpen, setAddOpen] = useState(false);
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const blocks = day.blocks.filter((b) => b.status !== "skipped");
  const catalog = trip.id === "demo-shanghai" ? SHANGHAI_PLACE_CATALOG : [];

  const existingPlaceIds = useMemo(() => {
    const ids = new Set<string>();
    for (const d of trip.days) {
      for (const b of d.blocks) {
        if (b.status === "skipped") continue;
        const p = getSelectedPlace(b);
        if (p) ids.add(p.id);
      }
    }
    return ids;
  }, [trip]);

  async function handleRemove(blockId: string, placeName: string) {
    const ok = await confirm({
      title: t("share.confirmRemoveTitle"),
      message: t("share.confirmRemove", { name: placeName }),
      confirmLabel: t("share.removeConfirm"),
      variant: "danger",
    });
    if (ok) removeBlock(day.dayIndex, blockId);
  }

  async function handleReset() {
    const ok = await confirm({
      title: t("share.confirmResetTitle"),
      message: t("share.confirmReset"),
      confirmLabel: t("share.resetConfirm"),
      variant: "default",
    });
    if (ok) resetTrip();
  }

  return (
    <div className="animate-in space-y-8">
      <header className="share-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[var(--share-accent)] via-[#C9A227] to-[var(--share-accent)]" />
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--share-accent)]">
                {dayLabel(day.dayIndex, locale)}
              </p>
              {day.theme && (
                <h1 className="mt-1 font-[family-name:var(--font-share-serif)] text-2xl font-bold sm:text-3xl">
                  {day.theme}
                </h1>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--share-green-soft)] px-3 py-1 text-xs font-semibold text-[var(--share-green)]">
                {t("share.stopCount", { count: String(blocks.length) })}
              </span>
              {isDirty && editable && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="share-focus flex items-center gap-1 rounded-full border border-[var(--share-border)] px-2.5 py-1 text-xs font-medium text-[var(--share-muted)] hover:text-[var(--share-accent)]"
                >
                  <RotateCcw className="h-3 w-3" />
                  {t("share.resetItinerary")}
                </button>
              )}
            </div>
          </div>
          {day.neighborhoods.length > 0 && (
            <p className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-[var(--share-muted)]">
              <Route className="h-4 w-4 shrink-0 text-[#C9A227]" />
              {day.neighborhoods.map((n, i) => (
                <span key={n} className="inline-flex items-center gap-1.5">
                  {i > 0 && <span className="text-[#C9A227]">→</span>}
                  <span>{n}</span>
                </span>
              ))}
            </p>
          )}
        </div>
      </header>

      {/* Stops first */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--share-accent)]" />
            <h2 className="font-[family-name:var(--font-share-serif)] text-lg font-bold">
              {t("share.todaysStops")}
            </h2>
          </div>
          {editable && (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="share-btn-primary share-focus flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              {t("share.addStop")}
            </button>
          )}
        </div>

        {blocks.length === 0 ? (
          <div className="share-card flex flex-col items-center gap-3 p-10 text-center">
            <p className="text-sm text-[var(--share-muted)]">{t("share.emptyDay")}</p>
            {editable && (
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="share-btn-primary share-focus flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                {t("share.addStop")}
              </button>
            )}
          </div>
        ) : (
          <ShareSortableStops
            blocks={blocks}
            basePath={basePath}
            editable={editable}
            onReorder={(blockIds) => reorderBlocks(day.dayIndex, blockIds)}
            onRemove={(blockId, placeName) => handleRemove(blockId, placeName)}
          />
        )}
      </section>

      {/* Map at the end */}
      {blocks.length > 0 && (
        <section className="share-card p-4 sm:p-5">
          <ShareTripMap
            trip={trip}
            dayIndex={day.dayIndex}
            basePath={basePath}
            className="h-[260px] sm:h-[300px] lg:h-[380px]"
            embedded
          />
        </section>
      )}

      <ShareDayNav trip={trip} dayIndex={day.dayIndex} basePath={basePath} />

      <ShareAddStopDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        destination={trip.destination}
        catalog={catalog}
        existingPlaceIds={existingPlaceIds}
        onAddPlace={(place, blockLabel, details) =>
          addPlaceBlock(day.dayIndex, place, blockLabel, details)
        }
      />

      {confirmDialog}
    </div>
  );
}

interface MapPanelProps {
  trip: Trip;
  basePath?: string;
}

export function ShareMapPanel({ trip, basePath }: MapPanelProps) {
  const { t } = useI18n();

  return (
    <div className="animate-in space-y-6">
      <header className="share-card p-5 sm:p-6">
        <h1 className="font-[family-name:var(--font-share-serif)] text-2xl font-bold sm:text-3xl">
          {t("share.tripMap")}
        </h1>
        <p className="mt-2 text-sm text-[var(--share-muted)]">{t("share.mapAllStops")}</p>
      </header>
      <section className="share-card p-4 sm:p-5">
        <ShareTripMap
          trip={trip}
          basePath={basePath}
          className="h-[360px] sm:h-[420px] lg:h-[520px] xl:h-[560px]"
          embedded
        />
      </section>
    </div>
  );
}
