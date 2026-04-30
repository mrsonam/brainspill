"use client";

import Image from "next/image";
import { RefObject } from "react";

import type {
  CanvasViewport,
  ImageObject as ImageObjectType,
} from "@/features/canvas/model/canvas-types";
import { useObjectDrag } from "@/features/canvas/interactions/use-object-drag";
import { useObjectResize } from "@/features/canvas/interactions/use-object-resize";
import { selectLocalObjects } from "@/features/canvas/state/local-scene-store";
import { cn } from "@/lib/utils";

type ImageObjectProps = {
  boardId: string;
  object: ImageObjectType;
  selected: boolean;
  viewportRef: RefObject<CanvasViewport>;
};

export function ImageObject({
  boardId,
  object,
  selected,
  viewportRef,
}: ImageObjectProps) {
  const dragHandlers = useObjectDrag({ boardId, object, viewportRef });
  const resizeHandlers = useObjectResize({ boardId, object, viewportRef });

  return (
    <div
      className={cn(
        "absolute touch-none select-none overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm",
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
      <Image
        src={object.src}
        alt={object.fileName ?? "Canvas image"}
        fill
        sizes={`${Math.round(object.width)}px`}
        className="object-cover"
        unoptimized={object.src.startsWith("data:")}
      />
      {selected ? (
        <button
          aria-label="Resize image"
          className="absolute bottom-1 right-1 size-4 rounded-full border border-black/20 bg-white shadow-sm"
          {...resizeHandlers}
        />
      ) : null}
    </div>
  );
}
