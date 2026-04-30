"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { CanvasObjectLayer } from "@/features/canvas/components/CanvasObjectLayer";
import { GridLayer } from "@/features/canvas/components/GridLayer";
import type { CanvasViewport as CanvasViewportState } from "@/features/canvas/model/canvas-types";
import {
  deleteLocalObjects,
  duplicateLocalObject,
  selectLocalObjects,
  useLocalScene,
} from "@/features/canvas/state/local-scene-store";
import { useCanvasViewport } from "@/features/canvas/viewport/use-canvas-viewport";

type CanvasViewportProps = {
  boardId: string;
};

export function CanvasViewport({ boardId }: CanvasViewportProps) {
  const transformRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const scene = useLocalScene(boardId);
  const [scaleLabel, setScaleLabel] = useState("100%");
  const { beginPan, panTo, endPan, resetViewport, viewportRef, zoomAt } =
    useCanvasViewport({
      transformRef,
      gridRef,
      onViewportChange: (viewport: CanvasViewportState) => {
        setScaleLabel(`${Math.round(viewport.scale * 100)}%`);
      },
    });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isTextInput =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA");

      if (isTextInput) {
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        deleteLocalObjects(boardId, scene.selectedObjectIds);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        scene.selectedObjectIds.forEach((objectId) => {
          duplicateLocalObject(boardId, objectId);
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [boardId, scene.selectedObjectIds]);

  return (
    <div
      className="relative flex flex-1 touch-none overflow-hidden"
      onPointerDown={(event) => {
        if (event.button !== 0) {
          return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        selectLocalObjects(boardId, []);
        beginPan({ x: event.clientX, y: event.clientY });
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          return;
        }

        panTo({ x: event.clientX, y: event.clientY });
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }

        endPan();
      }}
      onPointerCancel={endPan}
      onWheel={(event) => {
        event.preventDefault();
        zoomAt({ x: event.clientX, y: event.clientY }, event.deltaY);
      }}
    >
      <GridLayer gridRef={gridRef} />

      <div
        ref={transformRef}
        className="absolute left-0 top-0 h-[1px] w-[1px] origin-top-left will-change-transform"
      >
        <div className="absolute left-0 top-0 size-3 rounded-full bg-foreground/70" />
        <CanvasObjectLayer boardId={boardId} viewportRef={viewportRef} />
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-2xl border border-black/10 bg-background/90 p-2 shadow-sm backdrop-blur">
        <span className="min-w-12 px-2 text-center text-xs font-medium text-muted-foreground">
          {scaleLabel}
        </span>
        <Button variant="outline" size="sm" onClick={resetViewport}>
          Reset
        </Button>
      </div>
    </div>
  );
}
