"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n/context";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "default",
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useI18n();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        className="share-card w-full max-w-sm animate-in overflow-hidden rounded-2xl shadow-[var(--share-shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5 pb-4">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              variant === "danger"
                ? "bg-red-50 text-red-600"
                : "bg-[var(--share-accent-soft)] text-[var(--share-accent)]"
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2
              id="confirm-dialog-title"
              className="font-[family-name:var(--font-share-serif)] text-lg font-bold text-[var(--share-text)]"
            >
              {title ?? t("share.confirmTitle")}
            </h2>
            <p id="confirm-dialog-desc" className="mt-2 text-sm leading-relaxed text-[var(--share-muted)]">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="share-focus -mr-1 -mt-1 rounded-full p-1.5 text-[var(--share-muted)] hover:bg-[var(--share-bg)]"
            aria-label={cancelLabel ?? t("common.cancel")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2 border-t border-[var(--share-border)] bg-[var(--share-bg)] p-4">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="share-btn-ghost share-focus flex-1 rounded-xl border border-[var(--share-border)] bg-[var(--share-card)] py-2.5 text-sm font-semibold"
          >
            {cancelLabel ?? t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "share-focus flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors",
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "share-btn-primary"
            )}
          >
            {confirmLabel ?? t("share.confirmAction")}
          </button>
        </div>
      </div>
    </div>
  );
}
