"use client";

import type { Pace } from "@travel-planner/core";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { Coffee, Footprints, Zap } from "lucide-react";

interface Props {
  value: Pace;
  onChange: (pace: Pace) => void;
}

export function PacePicker({ value, onChange }: Props) {
  const { t } = useI18n();

  const OPTIONS: { value: Pace; labelKey: "pace.relaxed" | "pace.balanced" | "pace.packed"; descKey: "pace.relaxedDesc" | "pace.balancedDesc" | "pace.packedDesc"; icon: typeof Coffee }[] = [
    { value: "relaxed", labelKey: "pace.relaxed", descKey: "pace.relaxedDesc", icon: Coffee },
    { value: "balanced", labelKey: "pace.balanced", descKey: "pace.balancedDesc", icon: Footprints },
    { value: "packed", labelKey: "pace.packed", descKey: "pace.packedDesc", icon: Zap },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-col items-start rounded-xl border p-3 text-left transition-all",
              selected
                ? "border-primary bg-accent ring-2 ring-primary/20"
                : "border-border hover:border-primary/40 hover:bg-muted/50"
            )}
          >
            <Icon className={cn("h-5 w-5 mb-2", selected ? "text-primary" : "text-muted-foreground")} />
            <span className="font-medium text-sm">{t(opt.labelKey)}</span>
            <span className="text-xs text-muted-foreground mt-0.5">{t(opt.descKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
