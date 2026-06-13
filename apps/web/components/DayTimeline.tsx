"use client";

import type { DayPlan, Trip } from "@travel-planner/core";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BlockCard } from "./BlockCard";
import { RegenerateDialog } from "./RegenerateDialog";
import { AddPlaceDialog } from "./AddPlaceDialog";
import { Button } from "./ui/button";
import { useI18n } from "@/lib/i18n/context";
import { useState } from "react";
import { GripVertical } from "lucide-react";

interface Props {
  trip: Trip;
  day: DayPlan;
  onUpdate: (trip: Trip) => void;
}

function SortableBlock({
  trip,
  dayIndex,
  block,
  index,
  onUpdate,
  onRegenerate,
}: {
  trip: Trip;
  dayIndex: number;
  block: DayPlan["blocks"][0];
  index: number;
  onUpdate: (trip: Trip) => void;
  onRegenerate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="flex gap-2">
      <button
        type="button"
        className="mt-4 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex-1">
        <BlockCard
          trip={trip}
          dayIndex={dayIndex}
          block={block}
          index={index}
          onUpdate={onUpdate}
          onRegenerate={onRegenerate}
        />
      </div>
    </div>
  );
}

export function DayTimeline({ trip, day, onUpdate }: Props) {
  const { t } = useI18n();
  const [regenOpen, setRegenOpen] = useState(false);
  const [regenBlockId, setRegenBlockId] = useState<string | undefined>();
  const [addOpen, setAddOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = day.blocks.findIndex((b) => b.id === active.id);
    const newIndex = day.blocks.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(day.blocks, oldIndex, newIndex);

    const res = await fetch(`/api/trips/${trip.id}/days/${day.dayIndex}/blocks`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockIds: reordered.map((b) => b.id) }),
    });
    onUpdate(await res.json());
  }

  async function regenerate(reason: string, customFeedback?: string) {
    const res = await fetch(`/api/trips/${trip.id}/regenerate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scope: regenBlockId ? "block" : "day",
        dayIndex: day.dayIndex,
        blockId: regenBlockId,
        reason,
        customFeedback,
      }),
    });
    onUpdate(await res.json());
    setRegenBlockId(undefined);
  }

  async function addPlace(data: { label: string; rawInput: string }) {
    const enrichRes = await fetch("/api/places/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawInput: data.rawInput, destination: trip.destination }),
    });
    const enriched = await enrichRes.json();
    const place = enriched.place ?? enriched;

    const res = await fetch(`/api/trips/${trip.id}/days/${day.dayIndex}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: data.label, kind: place.kind, place }),
    });
    onUpdate(await res.json());
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => { setRegenBlockId(undefined); setRegenOpen(true); }}>
          {t("dayActions.redoDay")}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
          {t("dayActions.addOwn")}
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={day.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {day.blocks.map((block, i) => (
              <SortableBlock
                key={block.id}
                trip={trip}
                dayIndex={day.dayIndex}
                block={block}
                index={i}
                onUpdate={onUpdate}
                onRegenerate={() => { setRegenBlockId(block.id); setRegenOpen(true); }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <RegenerateDialog open={regenOpen} onClose={() => setRegenOpen(false)} onSubmit={regenerate} />
      <AddPlaceDialog
        open={addOpen}
        destination={trip.destination}
        onClose={() => setAddOpen(false)}
        onAdd={addPlace}
      />
    </div>
  );
}
