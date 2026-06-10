"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n";
import { RefreshCw } from "lucide-react";

const PRESET_KEYS = [
  "too_touristy",
  "more_local",
  "rainy_day",
  "tired",
  "more_food",
  "kid_friendly",
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string, customFeedback?: string) => void;
}

export function RegenerateDialog({ open, onClose, onSubmit }: Props) {
  const { t } = useI18n();
  const [custom, setCustom] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <RefreshCw className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">{t("regenerate.title")}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t("regenerate.subtitle")}</p>
        <div className="grid gap-2 mb-4">
          {PRESET_KEYS.map((key) => (
            <Button
              key={key}
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => {
                onSubmit(key);
                onClose();
              }}
            >
              {t(`regenerate.${key}` as TranslationKey)}
            </Button>
          ))}
        </div>
        <Input
          placeholder={t("regenerate.placeholder")}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1"
            onClick={() => {
              onSubmit("custom", custom);
              onClose();
            }}
            disabled={!custom.trim()}
          >
            {t("common.apply")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
