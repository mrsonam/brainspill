"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { GridLayer } from "@/features/canvas/components/GridLayer";
import type { CanvasViewport as CanvasViewportState } from "@/features/canvas/model/canvas-types";
import { useCanvasViewport } from "@/features/canvas/viewport/use-canvas-viewport";

type CanvasViewportProps = {
  boardId: string;
};

export function CanvasViewport({ boardId }: CanvasViewportProps) {
  const transformRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [scaleLabel, setScaleLabel] = useState("100%");
  const { beginPan, panTo, endPan, resetViewport, zoomAt } = useCanvasViewport({
    transformRef,
    gridRef,
    onViewportChange: (viewport: CanvasViewportState) => {
      setScaleLabel(`${Math.round(viewport.scale * 100)}%`);
    },
  });

  return (
    <div
      className="relative flex flex-1 touch-none overflow-hidden"
      onPointerDown={(event) => {
        if (event.button !== 0) {
          return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
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
        <div className="absolute left-8 top-8 w-72 rounded-3xl border border-black/10 bg-background/90 p-6 shadow-sm backdrop-blur">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {boardId}
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            The canvas can move now.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Drag the surface to pan. Scroll to zoom around your cursor. Notes and
            images plug into this layer next.
          </p>
        </div>
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
