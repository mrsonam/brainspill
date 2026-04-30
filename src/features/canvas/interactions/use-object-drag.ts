"use client";

import { RefObject, useRef } from "react";

import type {
  CanvasObject,
  CanvasPoint,
  CanvasViewport,
} from "@/features/canvas/model/canvas-types";
import { moveLocalObject } from "@/features/canvas/state/local-scene-store";

type UseObjectDragOptions = {
  boardId: string;
  object: CanvasObject;
  viewportRef: RefObject<CanvasViewport>;
};

export function useObjectDrag({
  boardId,
  object,
  viewportRef,
}: UseObjectDragOptions) {
  const dragStartRef = useRef<{
    pointer: CanvasPoint;
    object: CanvasPoint;
  } | null>(null);

  return {
    onPointerDown(event: React.PointerEvent<HTMLElement>) {
      if (event.button !== 0) {
        return;
      }

      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragStartRef.current = {
        pointer: {
          x: event.clientX,
          y: event.clientY,
        },
        object: {
          x: object.x,
          y: object.y,
        },
      };
    },
    onPointerMove(event: React.PointerEvent<HTMLElement>) {
      const dragStart = dragStartRef.current;

      if (!dragStart || !event.currentTarget.hasPointerCapture(event.pointerId)) {
        return;
      }

      event.stopPropagation();
      const scale = viewportRef.current.scale;

      moveLocalObject(boardId, object.id, {
        x: dragStart.object.x + (event.clientX - dragStart.pointer.x) / scale,
        y: dragStart.object.y + (event.clientY - dragStart.pointer.y) / scale,
      });
    },
    onPointerUp(event: React.PointerEvent<HTMLElement>) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      dragStartRef.current = null;
    },
    onPointerCancel() {
      dragStartRef.current = null;
    },
  };
}
