"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useI18n } from "@/lib/i18n/context";

interface Props {
  open: boolean;
  destination: string;
  onClose: () => void;
  onAdd: (data: { label: string; rawInput: string }) => void;
}

export function AddPlaceDialog({ open, destination, onClose, onAdd }: Props) {
  const { t } = useI18n();
  const [label, setLabel] = useState("");
  const [rawInput, setRawInput] = useState("");

  if (!open) return null;

  async function handleAdd() {
    onAdd({ label: label || rawInput, rawInput: rawInput || label });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-4 shadow-lg space-y-3">
        <h3 className="font-semibold text-lg">{t("dayActions.addTitle")}</h3>
        <Input placeholder={t("dayActions.blockLabel")} value={label} onChange={(e) => setLabel(e.target.value)} />
        <Input
          placeholder={t("dayActions.placeName")}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
        />
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleAdd} disabled={!label && !rawInput}>
            {t("wishlist.add")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
