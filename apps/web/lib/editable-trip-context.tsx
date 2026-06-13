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

const STORAGE_PREFIX = "travel-planner:trip:";

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

interface EditableTripContextValue {
  trip: Trip;
  editable: boolean;
  isDirty: boolean;
  removeBlock: (dayIndex: number, blockId: string) => void;
  reorderBlocks: (dayIndex: number, blockIds: string[]) => void;
  addPlaceBlock: (
    dayIndex: number,
    place: Place,
    label?: string,
    details?: PlaceDetailRecord
  ) => void;
  resetTrip: () => void;
}

const EditableTripContext = createContext<EditableTripContextValue | null>(null);

interface ProviderProps {
  tripId: string;
  initialTrip: Trip;
  editable?: boolean;
  children: React.ReactNode;
}

export function EditableTripProvider({
  tripId,
  initialTrip,
  editable = true,
  children,
}: ProviderProps) {
  const initialRef = useRef(initialTrip);
  initialRef.current = initialTrip;

  const [trip, setTrip] = useState(initialTrip);
  const [extraDetails, setExtraDetails] = useState<Record<string, PlaceDetailRecord>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStored(tripId);
    if (stored) {
      setTrip(stored.trip);
      if (stored.extraDetails) {
        setExtraDetails(stored.extraDetails);
        setRuntimePlaceDetails(stored.extraDetails);
      }
      setIsDirty(true);
    }
    setHydrated(true);
  }, [tripId]);

  useEffect(() => {
    if (hydrated && isDirty) {
      saveStored(tripId, { trip, extraDetails });
    }
  }, [trip, extraDetails, tripId, hydrated, isDirty]);

  const removeBlock = useCallback((dayIndex: number, blockId: string) => {
    setTrip((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.dayIndex === dayIndex
          ? { ...d, blocks: d.blocks.filter((b) => b.id !== blockId) }
          : d
      ),
    }));
    setIsDirty(true);
  }, []);

  const reorderBlocks = useCallback((dayIndex: number, blockIds: string[]) => {
    setTrip((prev) => ({
      ...prev,
      days: prev.days.map((d) => {
        if (d.dayIndex !== dayIndex) return d;
        const active = d.blocks.filter((b) => b.status !== "skipped");
        const skipped = d.blocks.filter((b) => b.status === "skipped");
        const byId = new Map(active.map((b) => [b.id, b]));
        const reordered = blockIds.map((id) => byId.get(id)).filter(Boolean) as PlanBlock[];
        return { ...d, blocks: [...reordered, ...skipped] };
      }),
    }));
    setIsDirty(true);
  }, []);

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
      const block = makeBlock(label, place);
      setTrip((prev) => ({
        ...prev,
        days: prev.days.map((d) =>
          d.dayIndex === dayIndex ? { ...d, blocks: [...d.blocks, block] } : d
        ),
      }));
      setIsDirty(true);
    },
    []
  );

  const resetTrip = useCallback(() => {
    clearStored(tripId);
    setTrip(initialRef.current);
    setExtraDetails({});
    setRuntimePlaceDetails({});
    setIsDirty(false);
  }, [tripId]);

  const value = useMemo(
    () => ({
      trip,
      editable,
      isDirty,
      removeBlock,
      reorderBlocks,
      addPlaceBlock,
      resetTrip,
    }),
    [trip, editable, isDirty, removeBlock, reorderBlocks, addPlaceBlock, resetTrip]
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
