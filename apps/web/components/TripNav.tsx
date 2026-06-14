"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { dayLabel } from "@/lib/format";
import { LayoutGrid, Heart, Calendar } from "lucide-react";

interface Props {
  tripId: string;
  destination: string;
  daysCount: number;
}

export function TripNav({ tripId, destination, daysCount }: Props) {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const base = `/trip/${tripId}`;

  const links = [
    { href: base, label: t("nav.overview"), icon: LayoutGrid, match: (p: string) => p === base },
    { href: `${base}/wishlist`, label: t("nav.savedSpots"), icon: Heart, match: (p: string) => p.includes("/wishlist") },
    ...Array.from({ length: daysCount }, (_, i) => ({
      href: `${base}/day/${i}`,
      label: dayLabel(i, locale),
      icon: Calendar,
      match: (p: string) => p === `${base}/day/${i}`,
    })),
  ];

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("nav.yourTrip")}</p>
        <p className="font-semibold truncate">{destination}</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {links.map((link) => {
          const active = link.match(pathname);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--share-accent)] text-white shadow-sm"
                  : "bg-[var(--share-bg)] text-[var(--share-muted)] hover:bg-[var(--share-accent-soft)] hover:text-[var(--share-accent)]"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
