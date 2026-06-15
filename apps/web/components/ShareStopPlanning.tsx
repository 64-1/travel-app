"use client";

import { useState } from "react";
import type { PlanBlock } from "@travel-planner/core";
import { getSelectedPlace } from "@travel-planner/core";
import { SharePlaceCard } from "@/components/SharePlaceCard";
import { AlternativePicker } from "@/components/AlternativePicker";
import { RegenerateDialog } from "@/components/RegenerateDialog";
import { useEditableTrip } from "@/lib/editable-trip-context";
import { useI18n } from "@/lib/i18n/context";
import { Check, RefreshCw, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  block: PlanBlock;
  dayIndex: number;
  blockIdx: number;
  basePath: string;
  onRemove?: () => void;
}

export function ShareStopPlanning({
  block,
  dayIndex,
  blockIdx,
  basePath,
  onRemove,
}: Props) {
  const { t } = useI18n();
  const { persistMode, patchBlock, regenerateBlock, isRegenerating } = useEditableTrip();
  const [regenOpen, setRegenOpen] = useState(false);
  const place = getSelectedPlace(block);
  const showPlanning = persistMode === "server";

  if (!place) return null;

  const statusStyles = {
    suggested: "bg-slate-100 text-slate-600",
    confirmed: "bg-[var(--share-green-soft)] text-[var(--share-green)]",
    skipped: "bg-[var(--share-bg)] text-[var(--share-muted)]",
  };

  return (
    <div className="space-y-3">
      <SharePlaceCard
        place={place}
        label={block.label}
        index={blockIdx + 1}
        detailHref={`${basePath}/place/${place.id}`}
        onRemove={onRemove}
      />

      {showPlanning && block.status !== "skipped" && (
        <div className="share-card space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                statusStyles[block.status]
              )}
            >
              {block.status === "confirmed"
                ? t("block.confirmed")
                : block.status === "suggested"
                  ? t("block.pickOne")
                  : t("block.skipped")}
            </span>
          </div>

          {block.status === "suggested" && block.suggestions.length >= 5 && (
            <div>
              <p className="mb-2 text-xs font-medium text-[var(--share-muted)]">
                {t("block.chooseFavorite", { count: block.suggestions.length })}
              </p>
              <AlternativePicker
                suggestions={block.suggestions}
                selectedPlaceId={block.selectedPlaceId}
                onSelect={(id) => patchBlock(dayIndex, block.id, { selectedPlaceId: id })}
              />
            </div>
          )}

          {block.backupPlace && (
            <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50/50 p-3 text-sm">
              <p className="text-xs font-semibold text-amber-800">{t("block.planB")}</p>
              <p className="mt-0.5 font-medium">{block.backupPlace.name}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {block.status === "suggested" && (
              <button
                type="button"
                onClick={() =>
                  patchBlock(dayIndex, block.id, {
                    status: "confirmed",
                    selectedPlaceId: place.id,
                  })
                }
                className="share-btn-primary share-focus flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
              >
                <Check className="h-3.5 w-3.5" />
                {t("block.confirmStop")}
              </button>
            )}
            <button
              type="button"
              onClick={() => patchBlock(dayIndex, block.id, { status: "skipped" })}
              className="share-focus flex items-center gap-1 rounded-full border border-[var(--share-border)] px-3 py-1.5 text-xs font-medium text-[var(--share-muted)] hover:text-[var(--share-accent)]"
            >
              <SkipForward className="h-3.5 w-3.5" />
              {t("common.skip")}
            </button>
            <button
              type="button"
              disabled={isRegenerating}
              onClick={() => setRegenOpen(true)}
              className="share-focus flex items-center gap-1 rounded-full border border-[var(--share-border)] px-3 py-1.5 text-xs font-medium text-[var(--share-muted)] hover:text-[var(--share-accent)] disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRegenerating && "animate-spin")} />
              {t("block.differentOptions")}
            </button>
          </div>
        </div>
      )}

      <RegenerateDialog
        open={regenOpen}
        onClose={() => setRegenOpen(false)}
        onSubmit={(reason, customFeedback) => {
          void regenerateBlock(dayIndex, block.id, reason, customFeedback);
        }}
      />
    </div>
  );
}
