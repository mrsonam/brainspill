"use client";

import { RefObject, useRef } from "react";

import type {
  CanvasObject,
  CanvasPoint,
  CanvasSize,
  CanvasViewport,
} from "@/features/canvas/model/canvas-types";
import { resizeLocalObject } from "@/features/canvas/state/local-scene-store";

type UseObjectResizeOptions = {
  boardId: string;
  object: CanvasObject;
  viewportRef: RefObject<CanvasViewport>;
};

export function useObjectResize({
  boardId,
  object,
  viewportRef,
}: UseObjectResizeOptions) {
  const resizeStartRef = useRef<{
    pointer: CanvasPoint;
    size: CanvasSize;
  } | null>(null);

  return {
    onPointerDown(event: React.PointerEvent<HTMLElement>) {
      if (event.button !== 0) {
        return;
      }

      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      resizeStartRef.current = {
        pointer: {
          x: event.clientX,
          y: event.clientY,
        },
        size: {
          width: object.width,
          height: object.height,
        },
      };
    },
    onPointerMove(event: React.PointerEvent<HTMLElement>) {
      const resizeStart = resizeStartRef.current;

      if (
        !resizeStart ||
        !event.currentTarget.hasPointerCapture(event.pointerId)
      ) {
        return;
      }

      event.stopPropagation();
      const scale = viewportRef.current.scale;

      resizeLocalObject(boardId, object.id, {
        width:
          resizeStart.size.width + (event.clientX - resizeStart.pointer.x) / scale,
        height:
          resizeStart.size.height + (event.clientY - resizeStart.pointer.y) / scale,
      });
    },
    onPointerUp(event: React.PointerEvent<HTMLElement>) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      resizeStartRef.current = null;
    },
    onPointerCancel() {
      resizeStartRef.current = null;
    },
  };
}
