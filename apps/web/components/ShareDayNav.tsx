"use client";

import Link from "next/link";
import type { Trip } from "@travel-planner/core";
import { useI18n } from "@/lib/i18n/context";
import { dayLabel } from "@/lib/format";
import { ChevronLeft, ChevronRight, Map } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  trip: Trip;
  dayIndex: number;
  basePath: string;
  className?: string;
}

export function ShareDayNav({ trip, dayIndex, basePath, className }: Props) {
  const { t, locale } = useI18n();
  const total = trip.days.length;
  const hasPrev = dayIndex > 0;
  const hasNext = dayIndex < total - 1;

  return (
    <nav
      className={cn(
        "flex items-stretch gap-2 rounded-2xl border border-[var(--share-border)] bg-[var(--share-card)] p-2 shadow-[var(--share-shadow-sm)]",
        className
      )}
      aria-label={t("share.dayNav")}
    >
      {hasPrev ? (
        <Link
          href={`${basePath}/day/${dayIndex - 1}`}
          className="share-btn-ghost flex min-w-0 flex-1 items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">{dayLabel(dayIndex - 1, locale)}</span>
        </Link>
      ) : (
        <span className="flex-1" />
      )}

      <div className="flex flex-col items-center justify-center px-3 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--share-muted)]">
          {dayLabel(dayIndex, locale)}
        </span>
        <span className="text-xs text-[var(--share-muted)]">
          {dayIndex + 1} {t("share.of")} {total}
        </span>
      </div>

      {hasNext ? (
        <Link
          href={`${basePath}/day/${dayIndex + 1}`}
          className="share-btn-ghost flex min-w-0 flex-1 items-center justify-end gap-1 rounded-xl px-3 py-2.5 text-sm font-medium"
        >
          <span className="truncate">{dayLabel(dayIndex + 1, locale)}</span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </Link>
      ) : (
        <Link
          href={`${basePath}/map`}
          className="share-btn-primary flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold"
        >
          <Map className="h-4 w-4" />
          {t("share.tabMap")}
        </Link>
      )}
    </nav>
  );
}
