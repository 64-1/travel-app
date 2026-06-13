"use client";

import type { PlanBlock } from "@travel-planner/core";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SharePlaceCard } from "@/components/SharePlaceCard";
import { useI18n } from "@/lib/i18n/context";
import { getSelectedPlace } from "@travel-planner/core";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableItemProps {
  block: PlanBlock;
  blockIdx: number;
  basePath: string;
  locale: "en" | "zh";
  onRemove?: () => void;
}

function SortableStopCard({ block, blockIdx, basePath, locale, onRemove }: SortableItemProps) {
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const place = getSelectedPlace(block);
  if (!place) return null;

  const placeName =
    locale === "zh" ? place.nameI18n?.zh ?? place.name : place.nameI18n?.en ?? place.name;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("relative", isDragging && "z-10 opacity-90")}
    >
      {onRemove !== undefined && (
        <button
          type="button"
          className="share-focus absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-lg bg-[var(--share-card)]/90 p-1.5 text-[var(--share-muted)] shadow-sm hover:text-[var(--share-accent)]"
          aria-label={t("share.dragToReorder")}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <div className={onRemove !== undefined ? "pl-8" : undefined}>
        <SharePlaceCard
          place={place}
          label={block.label}
          index={blockIdx + 1}
          detailHref={`${basePath}/place/${place.id}`}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
}

interface Props {
  blocks: PlanBlock[];
  basePath: string;
  editable: boolean;
  onReorder: (blockIds: string[]) => void;
  onRemove: (blockId: string, placeName: string) => void;
}

export function ShareSortableStops({ blocks, basePath, editable, onReorder, onRemove }: Props) {
  const { t, locale } = useI18n();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = [...blocks];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    onReorder(next.map((b) => b.id));
  }

  const gridClass = blocks.length === 1 ? "grid gap-5" : "grid gap-5 lg:grid-cols-2";

  if (!editable) {
    return (
      <div className={gridClass}>
        {blocks.map((block, blockIdx) => {
          const place = getSelectedPlace(block);
          if (!place) return null;
          const placeName =
            locale === "zh" ? place.nameI18n?.zh ?? place.name : place.nameI18n?.en ?? place.name;
          return (
            <SharePlaceCard
              key={block.id}
              place={place}
              label={block.label}
              index={blockIdx + 1}
              detailHref={`${basePath}/place/${place.id}`}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--share-muted)]">{t("share.dragToReorder")}</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={rectSortingStrategy}>
          <div className={gridClass}>
            {blocks.map((block, blockIdx) => {
              const place = getSelectedPlace(block);
              if (!place) return null;
              const placeName =
                locale === "zh"
                  ? place.nameI18n?.zh ?? place.name
                  : place.nameI18n?.en ?? place.name;
              return (
                <SortableStopCard
                  key={block.id}
                  block={block}
                  blockIdx={blockIdx}
                  basePath={basePath}
                  locale={locale}
                  onRemove={() => onRemove(block.id, placeName)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
