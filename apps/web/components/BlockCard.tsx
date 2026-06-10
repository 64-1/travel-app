"use client";

import type { PlanBlock, Trip } from "@travel-planner/core";
import { getSelectedPlace } from "@travel-planner/core";
import { AlternativePicker } from "./AlternativePicker";
import { useToast } from "./Toast";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import { Check, SkipForward, ExternalLink, RefreshCw } from "lucide-react";

interface Props {
  trip: Trip;
  dayIndex: number;
  block: PlanBlock;
  index: number;
  onUpdate: (trip: Trip) => void;
  onRegenerate: () => void;
}

function mapsUrl(place: { name: string; lat?: number; lng?: number; neighborhood?: string }) {
  if (place.lat && place.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
  }
  const q = encodeURIComponent([place.name, place.neighborhood].filter(Boolean).join(", "));
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function BlockCard({ trip, dayIndex, block, index, onUpdate, onRegenerate }: Props) {
  const { toast } = useToast();
  const { t } = useI18n();
  const selected = getSelectedPlace(block);

  const STATUS_STYLES = {
    suggested: "bg-slate-100 text-slate-600",
    confirmed: "bg-green-100 text-green-700",
    skipped: "bg-muted text-muted-foreground",
  };

  const STATUS_LABELS = {
    suggested: t("block.pickOne"),
    confirmed: t("block.confirmed"),
    skipped: t("block.skipped"),
  };

  async function patch(data: Record<string, unknown>) {
    const res = await fetch(
      `/api/trips/${trip.id}/days/${dayIndex}/blocks/${block.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    onUpdate(await res.json());
  }

  async function confirm() {
    await patch({ status: "confirmed", selectedPlaceId: selected?.id });
    toast(t("block.toastConfirmed"), "success");
  }

  async function skip() {
    await patch({ status: "skipped" });
    toast(t("block.toastSkipped"), "info");
  }

  return (
    <Card
      className={cn(
        "shadow-sm transition-all",
        block.status === "skipped" && "opacity-60",
        block.status === "confirmed" && "ring-2 ring-green-200"
      )}
    >
      <CardHeader className="flex flex-row items-start gap-3 pb-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-sm">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base">{block.label}</CardTitle>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", STATUS_STYLES[block.status])}>
              {STATUS_LABELS[block.status]}
            </span>
          </div>
          {block.neighborhood && (
            <p className="text-xs text-muted-foreground mt-0.5">{block.neighborhood}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {block.status !== "skipped" && (
          <>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {t("block.chooseFavorite", { count: block.suggestions.length })}
              </p>
              <AlternativePicker
                suggestions={block.suggestions}
                selectedPlaceId={block.selectedPlaceId}
                onSelect={(id) => patch({ selectedPlaceId: id })}
              />
            </div>

            {block.backupPlace && (
              <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50/50 p-3 text-sm">
                <p className="text-xs font-semibold text-amber-800">{t("block.planB")}</p>
                <p className="mt-0.5 font-medium">{block.backupPlace.name}</p>
              </div>
            )}
          </>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {block.status !== "confirmed" && block.status !== "skipped" && (
            <Button size="sm" onClick={confirm}>
              <Check className="h-4 w-4 mr-1" />
              {t("block.confirmStop")}
            </Button>
          )}
          {block.status !== "skipped" && (
            <Button variant="outline" size="sm" onClick={skip}>
              <SkipForward className="h-4 w-4 mr-1" />
              {t("common.skip")}
            </Button>
          )}
          {block.status === "skipped" && (
            <Button variant="outline" size="sm" onClick={() => patch({ status: "suggested" })}>
              {t("block.undoSkip")}
            </Button>
          )}
          {selected && block.status !== "skipped" && (
            <a href={mapsUrl(selected)} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                {t("common.maps")}
              </Button>
            </a>
          )}
          <Button variant="ghost" size="sm" onClick={onRegenerate}>
            <RefreshCw className="h-4 w-4 mr-1" />
            {t("block.differentOptions")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
