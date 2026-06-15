"use client";

import type { Place } from "@travel-planner/core";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props {
  suggestions: Place[];
  selectedPlaceId?: string;
  onSelect: (placeId: string) => void;
}

export function AlternativePicker({ suggestions, selectedPlaceId, onSelect }: Props) {
  const { t } = useI18n();

  function confidenceLabel(confidence: string) {
    const key = `confidence.${confidence}` as TranslationKey;
    return t(key);
  }

  return (
    <div className="max-h-[min(420px,55vh)] space-y-2 overflow-y-auto pr-1">
      {suggestions.map((place, index) => {
        const selected = (selectedPlaceId ?? suggestions[0]?.id) === place.id;
        return (
          <button
            key={place.id}
            type="button"
            onClick={() => onSelect(place.id)}
            className={cn(
              "w-full rounded-lg border p-3 text-left transition-colors",
              selected ? "border-primary bg-accent" : "border-border hover:bg-muted"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2">
                {index > 0 && (
                  <span className="mt-0.5 shrink-0 text-[10px] font-semibold text-muted-foreground">
                    #{index + 1}
                  </span>
                )}
                <p className="font-medium">{place.name}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {index === 0 && (
                  <span className="rounded-full bg-[var(--share-accent)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--share-accent)]">
                    {t("block.topPickForYou")}
                  </span>
                )}
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                  {confidenceLabel(place.confidence)}
                </span>
              </div>
            </div>
            {place.neighborhood && (
              <p className="text-xs text-muted-foreground mt-0.5">{place.neighborhood}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{place.whyRecommended}</p>
            {place.localTips && place.localTips.length > 0 && (
              <p className="text-xs text-blue-700 mt-1">{t("block.tip")} {place.localTips[0]}</p>
            )}
            {place.sourceLinks.length > 0 && (
              <a
                href={place.sourceLinks[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary mt-1 inline-block"
                onClick={(e) => e.stopPropagation()}
              >
                {t("block.viewSource")}
              </a>
            )}
          </button>
        );
      })}
    </div>
  );
}
