"use client";

import type { TripConstraints } from "@travel-planner/core";
import { useI18n } from "@/lib/i18n/context";
import { Input } from "./ui/input";

interface Props {
  value: TripConstraints;
  onChange: (v: TripConstraints) => void;
}

export function ConstraintsForm({ value, onChange }: Props) {
  const { t } = useI18n();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">{t("constraints.budget")}</span>
        <select
          className="h-10 rounded-lg border border-border bg-card px-3"
          value={value.budget}
          onChange={(e) => onChange({ ...value, budget: e.target.value as TripConstraints["budget"] })}
        >
          <option value="budget">{t("constraints.budgetFriendly")}</option>
          <option value="mid">{t("constraints.mid")}</option>
          <option value="splurge">{t("constraints.splurge")}</option>
        </select>
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">{t("constraints.mobility")}</span>
        <select
          className="h-10 rounded-lg border border-border bg-card px-3"
          value={value.mobility}
          onChange={(e) => onChange({ ...value, mobility: e.target.value as TripConstraints["mobility"] })}
        >
          <option value="minimal_walking">{t("constraints.minimalWalking")}</option>
          <option value="moderate">{t("constraints.moderate")}</option>
          <option value="lots_of_walking">{t("constraints.lotsOfWalking")}</option>
        </select>
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">{t("constraints.group")}</span>
        <select
          className="h-10 rounded-lg border border-border bg-card px-3"
          value={value.groupType ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              groupType: (e.target.value || undefined) as TripConstraints["groupType"],
            })
          }
        >
          <option value="">{t("constraints.notSpecified")}</option>
          <option value="solo">{t("constraints.solo")}</option>
          <option value="couple">{t("constraints.couple")}</option>
          <option value="family">{t("constraints.family")}</option>
          <option value="friends">{t("constraints.friends")}</option>
          <option value="elderly">{t("constraints.elderly")}</option>
        </select>
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">{t("constraints.vibe")}</span>
        <select
          className="h-10 rounded-lg border border-border bg-card px-3"
          value={value.vibe}
          onChange={(e) => onChange({ ...value, vibe: e.target.value as TripConstraints["vibe"] })}
        >
          <option value="must_see">{t("constraints.mustSee")}</option>
          <option value="balanced">{t("constraints.balancedMix")}</option>
          <option value="hidden_gems">{t("constraints.hiddenGems")}</option>
        </select>
      </label>

      <label className="grid gap-1.5 text-sm sm:col-span-2">
        <span className="font-medium">{t("constraints.dietary")}</span>
        <Input
          placeholder={t("constraints.dietaryPlaceholder")}
          value={value.dietary?.join(", ") ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              dietary: e.target.value
                ? e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                : undefined,
            })
          }
        />
      </label>
    </div>
  );
}
