"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Interest, Pace, TripConstraints } from "@travel-planner/core";
import { ConstraintsForm } from "@/components/ConstraintsForm";
import { PacePicker } from "@/components/PacePicker";
import { TripProgress } from "@/components/TripProgress";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { useToast } from "@/components/Toast";
import { useI18n } from "@/lib/i18n/context";
import { tripDurationLabel } from "@/lib/format";
import { MapPin, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

const POPULAR_DESTINATIONS = ["Tokyo", "Osaka", "Kyoto", "Paris", "Bangkok", "Taipei"];

const INTEREST_KEYS = [
  "food", "culture", "nature", "shopping", "nightlife", "family", "photography",
] as const;

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, locale } = useI18n();
  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interests, setInterests] = useState<Interest[]>(["food", "culture"]);
  const [pace, setPace] = useState<Pace>("balanced");
  const [constraints, setConstraints] = useState<TripConstraints>({
    budget: "mid",
    mobility: "moderate",
    vibe: "balanced",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleInterest(i: Interest) {
    setInterests((prev) =>
      prev.includes(i) ? (prev.length > 1 ? prev.filter((x) => x !== i) : prev) : [...prev, i]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!destination.trim()) {
      setError(t("home.errorDestination"));
      return;
    }
    if (!startDate || !endDate) {
      setError(t("home.errorDates"));
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError(t("home.errorEndBeforeStart"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: destination.trim(),
          country: country || undefined,
          startDate,
          endDate,
          interests,
          pace,
          constraints,
        }),
      });

      if (!res.ok) throw new Error("Could not create trip");
      const trip = await res.json();
      toast(t("home.toastCreated"), "success");
      router.push(`/trip/${trip.id}/wishlist`);
    } catch {
      setError(t("home.errorGeneric"));
      toast(t("home.toastCreateFailed"), "error");
    } finally {
      setLoading(false);
    }
  }

  const duration =
    startDate && endDate && new Date(endDate) >= new Date(startDate)
      ? tripDurationLabel(startDate, endDate, locale)
      : null;

  return (
    <main className="share-page min-h-dvh">
      <ServiceWorkerRegister />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
            <MapPin className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t("app.name")}</h1>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">{t("app.tagline")}</p>
        </header>

        <TripProgress current="setup" className="mb-8 px-2" />

        <Card className="share-card shadow-sm border-[var(--share-border)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t("home.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium">{t("home.destination")}</span>
                  <Input
                    placeholder={t("home.destinationPlaceholder")}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    autoFocus
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_DESTINATIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDestination(d)}
                      className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                        destination === d
                          ? "bg-primary text-white border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium">{t("home.startDate")}</span>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium">{t("home.endDate")}</span>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </label>
              </div>

              {duration && (
                <p className="text-sm text-primary font-medium -mt-2">
                  {t("home.tripDuration", { count: duration })}
                </p>
              )}

              <div>
                <p className="text-sm font-medium mb-2">{t("home.interests")}</p>
                <p className="text-xs text-muted-foreground mb-3">{t("home.interestsHint")}</p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleInterest(key)}
                      className={`rounded-full px-4 py-2 text-sm font-medium border transition-all ${
                        interests.includes(key)
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {t(`interests.${key}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">{t("home.pace")}</p>
                <PacePicker value={pace} onChange={setPace} />
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <span>{t("home.advanced")}</span>
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showAdvanced && (
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <label className="grid gap-1.5 text-sm mb-4">
                    <span className="font-medium">{t("home.country")}</span>
                    <Input
                      placeholder={t("home.countryPlaceholder")}
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </label>
                  <ConstraintsForm value={constraints} onChange={setConstraints} />
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full shadow-sm" disabled={loading}>
                {loading ? t("home.submitting") : t("home.submit")}
              </Button>
              <p className="text-center text-xs text-muted-foreground">{t("home.nextHint")}</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
