"use client";

import { RefObject } from "react";

import type {
  CanvasViewport,
  StickyNoteObject as StickyNoteObjectType,
} from "@/features/canvas/model/canvas-types";
import { useObjectDrag } from "@/features/canvas/interactions/use-object-drag";
import { useObjectResize } from "@/features/canvas/interactions/use-object-resize";
import { selectLocalObjects } from "@/features/canvas/state/local-scene-store";
import { cn } from "@/lib/utils";

type StickyNoteObjectProps = {
  boardId: string;
  object: StickyNoteObjectType;
  selected: boolean;
  viewportRef: RefObject<CanvasViewport>;
};

const noteColorClassNames: Record<StickyNoteObjectType["color"], string> = {
  yellow: "bg-yellow-200",
  pink: "bg-pink-200",
  blue: "bg-sky-200",
  green: "bg-emerald-200",
  white: "bg-white",
};

export function StickyNoteObject({
  boardId,
  object,
  selected,
  viewportRef,
}: StickyNoteObjectProps) {
  const dragHandlers = useObjectDrag({ boardId, object, viewportRef });
  const resizeHandlers = useObjectResize({ boardId, object, viewportRef });

  return (
    <div
      className={cn(
        "absolute touch-none select-none rounded-2xl border border-black/10 p-4 text-zinc-950 shadow-sm",
        noteColorClassNames[object.color],
        selected && "ring-2 ring-zinc-950 ring-offset-2",
      )}
      style={{
        left: object.x,
        top: object.y,
        width: object.width,
        height: object.height,
        zIndex: object.zIndex,
      }}
      onClick={(event) => {
        event.stopPropagation();
        selectLocalObjects(boardId, [object.id]);
      }}
      {...dragHandlers}
    >
      <p className="whitespace-pre-wrap text-sm leading-6">
        {object.text || "New thought..."}
      </p>
      {selected ? (
        <button
          aria-label="Resize sticky note"
          className="absolute -bottom-2 -right-2 size-4 rounded-full border border-black/20 bg-white shadow-sm"
          {...resizeHandlers}
        />
      ) : null}
    </div>
  );
}
