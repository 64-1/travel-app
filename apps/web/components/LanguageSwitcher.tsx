"use client";

import { LOCALES } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { Languages } from "lucide-react";

interface Props {
  className?: string;
  compact?: boolean;
}

export function LanguageSwitcher({ className, compact }: Props) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!compact && (
        <span className="hidden sm:inline text-xs text-muted-foreground">{t("language.label")}</span>
      )}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
        <Languages className="h-3.5 w-3.5 text-muted-foreground ml-1.5 sm:hidden" />
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLocale(l.code)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              locale === l.code
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            aria-pressed={locale === l.code}
          >
            {l.nativeLabel}
          </button>
        ))}
      </div>
    </div>
  );
}
