"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { Check } from "lucide-react";

export type TripStep = "setup" | "wishlist" | "day1" | "complete";

interface Props {
  current: TripStep;
  className?: string;
}

export function TripProgress({ current, className }: Props) {
  const { t } = useI18n();

  const STEPS: { id: TripStep; short: string }[] = [
    { id: "setup", short: t("steps.setup") },
    { id: "wishlist", short: t("steps.wishlist") },
    { id: "day1", short: t("steps.day1") },
    { id: "complete", short: t("steps.complete") },
  ];

  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <nav aria-label="Trip progress" className={cn("w-full", className)}>
      <ol className="flex items-center justify-between gap-1">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={step.id} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-center">
                {i > 0 && (
                  <div className={cn("h-0.5 flex-1", done || active ? "bg-primary" : "bg-border")} />
                )}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    done && "bg-primary text-white",
                    active && "bg-primary text-white ring-4 ring-primary/20",
                    !done && !active && "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("h-0.5 flex-1", done ? "bg-primary" : "bg-border")} />
                )}
              </div>
              <span
                className={cn(
                  "hidden text-center text-[10px] font-medium sm:block sm:text-xs",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.short}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
