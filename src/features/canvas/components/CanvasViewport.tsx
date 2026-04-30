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
  gridVisible: boolean;
};

export function CanvasViewport({ boardId, gridVisible }: CanvasViewportProps) {
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
      {gridVisible ? <GridLayer gridRef={gridRef} /> : null}

      <div
        ref={transformRef}
        className="absolute left-0 top-0 h-[1px] w-[1px] origin-top-left will-change-transform"
      >
        <div className="absolute left-0 top-0 size-3 rounded-full bg-foreground/70" />
        <CanvasObjectLayer boardId={boardId} viewportRef={viewportRef} />
      </div>

      {scene.objectOrder.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <div className="max-w-sm rounded-3xl border border-black/10 bg-background/90 p-6 text-center shadow-sm backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Empty spill
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              Paste an image, write a note, or turn on grid.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Use the toolbar on the left, paste an image from your clipboard,
              or drag the surface to start exploring the canvas.
            </p>
          </div>
        </div>
      ) : null}

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
