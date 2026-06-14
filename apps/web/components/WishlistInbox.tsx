"use client";

import type { Trip, WishlistItem } from "@travel-planner/core";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { EmptyState } from "./EmptyState";
import { useToast } from "./Toast";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n";
import { Bookmark, Link2, X } from "lucide-react";

interface Props {
  trip: Trip;
  onUpdate: (trip: Trip) => void;
}

const EXAMPLES = [
  "Ichiran Ramen Shibuya",
  "https://maps.google.com/...",
  "Senso-ji Temple",
];

export function WishlistInbox({ trip, onUpdate }: Props) {
  const { toast } = useToast();
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [mustInclude, setMustInclude] = useState(false);
  const [loading, setLoading] = useState(false);

  function confidenceLabel(confidence: string) {
    const key = `confidence.${confidence}` as TranslationKey;
    return t(key);
  }

  async function addItem() {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: input.trim(), mustInclude }),
      });
      const updated = await res.json();
      onUpdate(updated);
      setInput("");
      setMustInclude(false);
      toast(t("wishlist.toastAdded"), "success");

      const enrichRes = await fetch(`/api/trips/${trip.id}/wishlist/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: updated.wishlist[updated.wishlist.length - 1].id }),
      });
      onUpdate(await enrichRes.json());
    } catch {
      toast(t("wishlist.toastAddFailed"), "error");
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(itemId: string) {
    try {
      const res = await fetch(`/api/trips/${trip.id}/wishlist?itemId=${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onUpdate(await res.json());
      toast(t("wishlist.toastRemoved"), "success");
    } catch {
      toast(t("wishlist.toastRemoveFailed"), "error");
    }
  }

  async function toggleMustInclude(itemId: string, mustInclude: boolean) {
    try {
      const res = await fetch(`/api/trips/${trip.id}/wishlist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, mustInclude }),
      });
      if (!res.ok) throw new Error();
      onUpdate(await res.json());
    } catch {
      toast(t("wishlist.toastAddFailed"), "error");
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-primary" />
          {t("wishlist.title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t("wishlist.description")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder={t("wishlist.placeholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            disabled={loading}
          />
          <Button onClick={addItem} disabled={loading || !input.trim()} className="shrink-0">
            {loading ? t("wishlist.adding") : t("wishlist.add")}
          </Button>
        </div>

        <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-primary"
            checked={mustInclude}
            onChange={(e) => setMustInclude(e.target.checked)}
          />
          <span>
            <span className="font-medium">{t("wishlist.mustVisit")}</span>
            <span className="text-muted-foreground"> — {t("wishlist.mustVisitHint")}</span>
          </span>
        </label>

        {trip.wishlist.length === 0 ? (
          <EmptyState
            icon={Link2}
            title={t("wishlist.emptyTitle")}
            description={t("wishlist.emptyDescription")}
          />
        ) : (
          <ul className="space-y-3">
            {trip.wishlist.map((item: WishlistItem) => (
              <li
                key={item.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <Bookmark className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {item.place ? (
                      <>
                        <p className="font-semibold">{item.place.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                          {item.place.whyRecommended}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-primary">
                            {confidenceLabel(item.place.confidence)}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleMustInclude(item.id, !item.mustInclude)}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                              item.mustInclude
                                ? "bg-amber-100 text-amber-800"
                                : "bg-muted text-muted-foreground hover:bg-amber-50"
                            }`}
                          >
                            {t("wishlist.mustVisit")}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-muted-foreground">{t("wishlist.gettingDetails")}</p>
                        <p className="text-sm break-all mt-1">{item.rawInput}</p>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-red-600"
                    aria-label={t("wishlist.remove")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {trip.wishlist.length === 0 && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">{t("wishlist.tryAdding")}</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setInput(ex)}
                  className="rounded-full bg-card border border-border px-3 py-1 text-xs hover:bg-muted transition-colors"
                >
                  {ex.length > 30 ? ex.slice(0, 30) + "…" : ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
