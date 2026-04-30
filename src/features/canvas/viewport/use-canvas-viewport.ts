"use client";

import { RefObject, useCallback, useRef } from "react";

import type {
  CanvasPoint,
  CanvasViewport,
} from "@/features/canvas/model/canvas-types";
import { DEFAULT_VIEWPORT } from "@/features/canvas/model/scene-defaults";
import {
  clampViewportScale,
  panViewport,
  zoomViewportAroundPoint,
} from "@/features/canvas/viewport/viewport-math";

type UseCanvasViewportOptions = {
  transformRef: RefObject<HTMLElement | null>;
  gridRef: RefObject<HTMLElement | null>;
  onViewportChange?: (viewport: CanvasViewport) => void;
};

function toTransform(viewport: CanvasViewport) {
  return `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.scale})`;
}

function toGridStyle(viewport: CanvasViewport) {
  return {
    backgroundPosition: `${viewport.x}px ${viewport.y}px`,
    backgroundSize: `${48 * viewport.scale}px ${48 * viewport.scale}px`,
  };
}

export function useCanvasViewport({
  transformRef,
  gridRef,
  onViewportChange,
}: UseCanvasViewportOptions) {
  const viewportRef = useRef<CanvasViewport>(DEFAULT_VIEWPORT);
  const frameRef = useRef<number | null>(null);
  const lastPointerRef = useRef<CanvasPoint | null>(null);

  const applyViewport = useCallback(() => {
    frameRef.current = null;
    const viewport = viewportRef.current;

    if (transformRef.current) {
      transformRef.current.style.transform = toTransform(viewport);
    }

    if (gridRef.current) {
      const gridStyle = toGridStyle(viewport);
      gridRef.current.style.backgroundPosition = gridStyle.backgroundPosition;
      gridRef.current.style.backgroundSize = gridStyle.backgroundSize;
    }

    onViewportChange?.(viewport);
  }, [gridRef, onViewportChange, transformRef]);

  const scheduleViewportApply = useCallback(() => {
    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(applyViewport);
  }, [applyViewport]);

  const setViewport = useCallback(
    (viewport: CanvasViewport) => {
      viewportRef.current = {
        ...viewport,
        scale: clampViewportScale(viewport.scale),
      };
      scheduleViewportApply();
    },
    [scheduleViewportApply],
  );

  const resetViewport = useCallback(() => {
    setViewport(DEFAULT_VIEWPORT);
  }, [setViewport]);

  const beginPan = useCallback((point: CanvasPoint) => {
    lastPointerRef.current = point;
  }, []);

  const panTo = useCallback(
    (point: CanvasPoint) => {
      const lastPointer = lastPointerRef.current;

      if (!lastPointer) {
        lastPointerRef.current = point;
        return;
      }

      viewportRef.current = panViewport(viewportRef.current, {
        x: point.x - lastPointer.x,
        y: point.y - lastPointer.y,
      });
      lastPointerRef.current = point;
      scheduleViewportApply();
    },
    [scheduleViewportApply],
  );

  const endPan = useCallback(() => {
    lastPointerRef.current = null;
  }, []);

  const zoomAt = useCallback(
    (anchorPoint: CanvasPoint, deltaY: number) => {
      const zoomIntensity = 0.0015;
      const zoomFactor = Math.exp(-deltaY * zoomIntensity);
      const nextScale = viewportRef.current.scale * zoomFactor;

      viewportRef.current = zoomViewportAroundPoint(
        viewportRef.current,
        anchorPoint,
        nextScale,
      );
      scheduleViewportApply();
    },
    [scheduleViewportApply],
  );

  return {
    viewportRef,
    beginPan,
    panTo,
    endPan,
    zoomAt,
    resetViewport,
    setViewport,
  };
}
