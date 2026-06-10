import { getLocaleTag, type Locale } from "./i18n";

export function formatDate(dateStr: string, locale: Locale = "en"): string {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString(getLocaleTag(locale), {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatDateRange(start: string, end: string, locale: Locale = "en"): string {
  return `${formatDate(start, locale)} – ${formatDate(end, locale)}`;
}

export function tripDurationLabel(start: string, end: string, locale: Locale = "en"): string {
  const startD = new Date(start);
  const endD = new Date(end);
  const days = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  if (locale === "zh") {
    return `${days}天`;
  }
  return days === 1 ? "1 day" : `${days} days`;
}

export function dayLabel(dayIndex: number, locale: Locale): string {
  if (locale === "zh") {
    return `第${dayIndex + 1}天`;
  }
  return `Day ${dayIndex + 1}`;
}
