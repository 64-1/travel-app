"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Place, PlanBlock, Trip } from "@travel-planner/core";
import type { PlaceDetailRecord } from "@/lib/demo/place-details";
import {
  registerPlaceDetail,
  setRuntimePlaceDetails,
} from "@/lib/demo/runtime-place-details";
import { useToast } from "@/components/Toast";
import { useI18n } from "@/lib/i18n/context";

const STORAGE_PREFIX = "travel-planner:trip:";
const REORDER_DEBOUNCE_MS = 300;

type PersistMode = "local" | "server";

interface StoredTripData {
  trip: Trip;
  extraDetails?: Record<string, PlaceDetailRecord>;
}

function storageKey(tripId: string) {
  return `${STORAGE_PREFIX}${tripId}`;
}

function loadStored(tripId: string): StoredTripData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(tripId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.days) return { trip: parsed as Trip };
    return parsed as StoredTripData;
  } catch {
    return null;
  }
}

function saveStored(tripId: string, data: StoredTripData) {
  localStorage.setItem(storageKey(tripId), JSON.stringify(data));
}

function clearStored(tripId: string) {
  localStorage.removeItem(storageKey(tripId));
}

function makeBlock(label: string, place: Place): PlanBlock {
  return {
    id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind: place.kind,
    label,
    neighborhood: place.neighborhood,
    suggestions: [place],
    selectedPlaceId: place.id,
    status: "confirmed",
  };
}

function applyReorder(trip: Trip, dayIndex: number, blockIds: string[]): Trip {
  return {
    ...trip,
    days: trip.days.map((d) => {
      if (d.dayIndex !== dayIndex) return d;
      const active = d.blocks.filter((b) => b.status !== "skipped");
      const skipped = d.blocks.filter((b) => b.status === "skipped");
      const byId = new Map(active.map((b) => [b.id, b]));
      const reordered = blockIds.map((id) => byId.get(id)).filter(Boolean) as PlanBlock[];
      return { ...d, blocks: [...reordered, ...skipped] };
    }),
  };
}

interface EditableTripContextValue {
  trip: Trip;
  editable: boolean;
  persistMode: PersistMode;
  isDirty: boolean;
  isRegenerating: boolean;
  removeBlock: (dayIndex: number, blockId: string) => void;
  reorderBlocks: (dayIndex: number, blockIds: string[]) => void;
  addPlaceBlock: (
    dayIndex: number,
    place: Place,
    label?: string,
    details?: PlaceDetailRecord
  ) => void;
  patchBlock: (
    dayIndex: number,
    blockId: string,
    data: { status?: PlanBlock["status"]; selectedPlaceId?: string }
  ) => void;
  regenerateBlock: (
    dayIndex: number,
    blockId: string,
    reason: string,
    customFeedback?: string
  ) => Promise<void>;
  regenerateDay: (dayIndex: number, reason: string, customFeedback?: string) => Promise<void>;
  resetTrip: () => void;
}

const EditableTripContext = createContext<EditableTripContextValue | null>(null);

interface ProviderProps {
  tripId: string;
  initialTrip: Trip;
  editable?: boolean;
  persist?: PersistMode;
  children: React.ReactNode;
}

export function EditableTripProvider({
  tripId,
  initialTrip,
  editable = true,
  persist = "local",
  children,
}: ProviderProps) {
  const { toast } = useToast();
  const { t, locale } = useI18n();
  const initialRef = useRef(initialTrip);
  initialRef.current = initialTrip;

  const [trip, setTrip] = useState(initialTrip);
  const [extraDetails, setExtraDetails] = useState<Record<string, PlaceDetailRecord>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const reorderDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reorderSnapshotRef = useRef<Trip | null>(null);
  const pendingReorderRef = useRef<{ dayIndex: number; blockIds: string[] } | null>(null);

  useEffect(() => {
    if (persist === "local") {
      const stored = loadStored(tripId);
      if (stored) {
        setTrip(stored.trip);
        if (stored.extraDetails) {
          setExtraDetails(stored.extraDetails);
          setRuntimePlaceDetails(stored.extraDetails);
        }
        setIsDirty(true);
      }
    }
    setHydrated(true);
  }, [tripId, persist]);

  useEffect(() => {
    if (persist === "local" && hydrated && isDirty) {
      saveStored(tripId, { trip, extraDetails });
    }
  }, [trip, extraDetails, tripId, hydrated, isDirty, persist]);

  useEffect(() => {
    return () => {
      if (reorderDebounceRef.current) clearTimeout(reorderDebounceRef.current);
    };
  }, []);

  const removeBlock = useCallback(
    (dayIndex: number, blockId: string) => {
      let previous: Trip | null = null;
      setTrip((prev) => {
        previous = prev;
        return {
          ...prev,
          days: prev.days.map((d) =>
            d.dayIndex === dayIndex
              ? { ...d, blocks: d.blocks.filter((b) => b.id !== blockId) }
              : d
          ),
        };
      });

      if (persist === "local") {
        setIsDirty(true);
        return;
      }

      void (async () => {
        try {
          const res = await fetch(
            `/api/trips/${tripId}/days/${dayIndex}/blocks/${blockId}`,
            { method: "DELETE" }
          );
          if (!res.ok) throw new Error("delete failed");
          setTrip(await res.json());
        } catch {
          if (previous) setTrip(previous);
          toast(t("trip.toastSaveFailed"), "error");
        }
      })();
    },
    [persist, tripId, toast, t]
  );

  const flushReorder = useCallback(
    async (dayIndex: number, blockIds: string[]) => {
      try {
        const res = await fetch(`/api/trips/${tripId}/days/${dayIndex}/blocks`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blockIds }),
        });
        if (!res.ok) throw new Error("reorder failed");
        setTrip(await res.json());
        reorderSnapshotRef.current = null;
      } catch {
        if (reorderSnapshotRef.current) {
          setTrip(reorderSnapshotRef.current);
          reorderSnapshotRef.current = null;
        }
        toast(t("trip.toastSaveFailed"), "error");
      }
    },
    [tripId, toast, t]
  );

  const reorderBlocks = useCallback(
    (dayIndex: number, blockIds: string[]) => {
      setTrip((prev) => {
        if (persist === "server" && !reorderSnapshotRef.current) {
          reorderSnapshotRef.current = prev;
        }
        return applyReorder(prev, dayIndex, blockIds);
      });

      if (persist === "local") {
        setIsDirty(true);
        return;
      }

      pendingReorderRef.current = { dayIndex, blockIds };
      if (reorderDebounceRef.current) clearTimeout(reorderDebounceRef.current);
      reorderDebounceRef.current = setTimeout(() => {
        const pending = pendingReorderRef.current;
        if (pending) void flushReorder(pending.dayIndex, pending.blockIds);
      }, REORDER_DEBOUNCE_MS);
    },
    [persist, flushReorder]
  );

  const addPlaceBlock = useCallback(
    (
      dayIndex: number,
      place: Place,
      label = "Stop",
      details?: PlaceDetailRecord
    ) => {
      if (details) {
        registerPlaceDetail(place.id, details);
        setExtraDetails((prev) => {
          const next = { ...prev, [place.id]: details };
          setRuntimePlaceDetails(next);
          return next;
        });
      }

      if (persist === "local") {
        const block = makeBlock(label, place);
        setTrip((prev) => ({
          ...prev,
          days: prev.days.map((d) =>
            d.dayIndex === dayIndex ? { ...d, blocks: [...d.blocks, block] } : d
          ),
        }));
        setIsDirty(true);
        return;
      }

      let previous: Trip | null = null;
      const block = makeBlock(label, place);
      setTrip((prev) => {
        previous = prev;
        return {
          ...prev,
          days: prev.days.map((d) =>
            d.dayIndex === dayIndex ? { ...d, blocks: [...d.blocks, block] } : d
          ),
        };
      });

      void (async () => {
        try {
          const res = await fetch(`/api/trips/${tripId}/days/${dayIndex}/blocks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label, kind: place.kind, place }),
          });
          if (!res.ok) throw new Error("add failed");
          setTrip(await res.json());
        } catch {
          if (previous) setTrip(previous);
          toast(t("trip.toastSaveFailed"), "error");
        }
      })();
    },
    [persist, tripId, toast, t]
  );

  const resetTrip = useCallback(() => {
    if (persist === "local") {
      clearStored(tripId);
    }
    setTrip(initialRef.current);
    setExtraDetails({});
    setRuntimePlaceDetails({});
    setIsDirty(false);
    reorderSnapshotRef.current = null;
  }, [persist, tripId]);

  const patchBlock = useCallback(
    (
      dayIndex: number,
      blockId: string,
      data: { status?: PlanBlock["status"]; selectedPlaceId?: string }
    ) => {
      let previous: Trip | null = null;
      setTrip((prev) => {
        previous = prev;
        return {
          ...prev,
          days: prev.days.map((d) => {
            if (d.dayIndex !== dayIndex) return d;
            return {
              ...d,
              blocks: d.blocks.map((b) => {
                if (b.id !== blockId) return b;
                return {
                  ...b,
                  ...(data.status !== undefined ? { status: data.status } : {}),
                  ...(data.selectedPlaceId !== undefined
                    ? { selectedPlaceId: data.selectedPlaceId }
                    : {}),
                };
              }),
            };
          }),
        };
      });

      if (persist === "local") {
        setIsDirty(true);
        return;
      }

      void (async () => {
        try {
          const res = await fetch(
            `/api/trips/${tripId}/days/${dayIndex}/blocks/${blockId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            }
          );
          if (!res.ok) throw new Error("patch failed");
          setTrip(await res.json());
        } catch {
          if (previous) setTrip(previous);
          toast(t("trip.toastSaveFailed"), "error");
        }
      })();
    },
    [persist, tripId, toast, t]
  );

  const runRegenerate = useCallback(
    async (
      scope: "block" | "day",
      dayIndex: number,
      blockId: string | undefined,
      reason: string,
      customFeedback?: string
    ) => {
      if (persist !== "server") return;
      setIsRegenerating(true);
      try {
        const res = await fetch(`/api/trips/${tripId}/regenerate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scope,
            dayIndex,
            blockId,
            reason,
            customFeedback,
            locale,
          }),
        });
        if (!res.ok) throw new Error("regenerate failed");
        setTrip(await res.json());
        toast(t("regenerate.toastDone"), "success");
      } catch {
        toast(t("regenerate.toastFailed"), "error");
      } finally {
        setIsRegenerating(false);
      }
    },
    [persist, tripId, toast, t, locale]
  );

  const regenerateBlock = useCallback(
    async (
      dayIndex: number,
      blockId: string,
      reason: string,
      customFeedback?: string
    ) => {
      await runRegenerate("block", dayIndex, blockId, reason, customFeedback);
    },
    [runRegenerate]
  );

  const regenerateDay = useCallback(
    async (dayIndex: number, reason: string, customFeedback?: string) => {
      await runRegenerate("day", dayIndex, undefined, reason, customFeedback);
    },
    [runRegenerate]
  );

  const value = useMemo(
    () => ({
      trip,
      editable,
      persistMode: persist,
      isDirty: persist === "local" ? isDirty : false,
      isRegenerating,
      removeBlock,
      reorderBlocks,
      addPlaceBlock,
      patchBlock,
      regenerateBlock,
      regenerateDay,
      resetTrip,
    }),
    [
      trip,
      editable,
      persist,
      isDirty,
      isRegenerating,
      removeBlock,
      reorderBlocks,
      addPlaceBlock,
      patchBlock,
      regenerateBlock,
      regenerateDay,
      resetTrip,
    ]
  );

  return (
    <EditableTripContext.Provider value={value}>{children}</EditableTripContext.Provider>
  );
}

export function useEditableTrip() {
  const ctx = useContext(EditableTripContext);
  if (!ctx) throw new Error("useEditableTrip must be used within EditableTripProvider");
  return ctx;
}

export function useEditableTripOptional() {
  return useContext(EditableTripContext);
}
