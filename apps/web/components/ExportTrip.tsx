"use client";

import type { Trip } from "@travel-planner/core";
import { getSelectedPlace } from "@travel-planner/core";
import { Button } from "./ui/button";
import { useToast } from "./Toast";
import { useI18n } from "@/lib/i18n/context";
import { dayLabel } from "@/lib/format";
import { useState } from "react";
import { Share2, Download } from "lucide-react";

interface Props {
  trip: Trip;
  variant?: "default" | "share";
}

export function ExportTrip({ trip, variant = "default" }: Props) {
  const { toast } = useToast();
  const { t, locale } = useI18n();
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  function toMarkdown(): string {
    let md = `# ${trip.destination}\n\n`;
    md += `${trip.startDate} → ${trip.endDate}\n\n`;

    for (const day of trip.days) {
      md += `## ${dayLabel(day.dayIndex, locale)}${day.theme ? `: ${day.theme}` : ""}\n\n`;
      if (day.neighborhoods.length) {
        md += `${day.neighborhoods.join(" → ")}\n\n`;
      }
      for (const block of day.blocks) {
        if (block.status === "skipped") continue;
        const place = getSelectedPlace(block);
        md += `### ${block.label}\n`;
        if (place) {
          md += `- **${place.name}**`;
          if (place.neighborhood) md += ` (${place.neighborhood})`;
          md += `\n- ${place.whyRecommended}\n`;
        }
        md += "\n";
      }
    }
    return md;
  }

  function downloadMarkdown() {
    const blob = new Blob([toMarkdown()], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${trip.destination.replace(/\s+/g, "-")}-trip.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast(t("trip.toastDownloaded"), "success");
  }

  async function share() {
    try {
      const res = await fetch(`/api/trips/${trip.id}/share`);
      const data = await res.json();
      setShareUrl(data.shareUrl);
      if (navigator.share) {
        await navigator.share({ title: trip.destination, url: data.shareUrl });
      } else {
        await navigator.clipboard.writeText(data.shareUrl);
        toast(t("trip.toastLinkCopied"), "success");
      }
    } catch {
      toast(t("trip.toastShareFailed"), "error");
    }
  }

  const btnClass =
    variant === "share"
      ? "share-focus flex items-center gap-1.5 rounded-full border border-[var(--share-border)] px-4 py-2 text-sm font-medium text-[var(--share-text)] hover:border-[var(--share-accent)] hover:text-[var(--share-accent)]"
      : undefined;

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {variant === "share" ? (
        <>
          <button type="button" onClick={downloadMarkdown} className={btnClass}>
            <Download className="h-4 w-4" />
            {t("common.download")}
          </button>
          <button type="button" onClick={share} className={btnClass}>
            <Share2 className="h-4 w-4" />
            {t("common.share")}
          </button>
        </>
      ) : (
        <>
          <Button variant="outline" size="sm" onClick={downloadMarkdown}>
            <Download className="h-4 w-4 mr-1" />
            {t("common.download")}
          </Button>
          <Button variant="outline" size="sm" onClick={share}>
            <Share2 className="h-4 w-4 mr-1" />
            {t("common.share")}
          </Button>
        </>
      )}
      {shareUrl && (
        <p className="text-xs text-[var(--share-muted)] w-full break-all text-center">{shareUrl}</p>
      )}
    </div>
  );
}
