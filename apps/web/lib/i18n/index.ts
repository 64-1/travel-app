import { en, type TranslationDict } from "./en";
import { zh } from "./zh";
import type { Locale } from "./types";

const dictionaries: Record<Locale, TranslationDict> = { en, zh };

type NestedKeyOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<TranslationDict>;

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  const dict = dictionaries[locale] ?? dictionaries.en;
  let text = getNestedValue(dict as unknown as Record<string, unknown>, key) ?? key;

  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}

export function getLocaleTag(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : "en";
}

export function getPaceLabel(locale: Locale, pace: string): string {
  const map: Record<string, TranslationKey> = {
    relaxed: "pace.relaxed",
    balanced: "pace.balanced",
    packed: "pace.packed",
  };
  return translate(locale, map[pace] ?? "pace.balanced");
}

export function getGenerationStatuses(locale: Locale): string[] {
  const dict = dictionaries[locale];
  return [
    dict.generate.status.researching,
    dict.generate.status.reading,
    dict.generate.status.clustering,
    dict.generate.status.building,
    dict.generate.status.backup,
    dict.generate.status.validating,
  ];
}

export { en, zh };
export type { Locale, TranslationDict };
export * from "./types";
