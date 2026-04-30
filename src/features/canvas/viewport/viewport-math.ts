import type {
  CanvasPoint,
  CanvasViewport,
} from "@/features/canvas/model/canvas-types";
import {
  MAX_VIEWPORT_SCALE,
  MIN_VIEWPORT_SCALE,
} from "@/features/canvas/viewport/viewport-constants";

export function clampViewportScale(scale: number) {
  return Math.min(MAX_VIEWPORT_SCALE, Math.max(MIN_VIEWPORT_SCALE, scale));
}

export function screenToCanvasPoint(
  screenPoint: CanvasPoint,
  viewport: CanvasViewport,
): CanvasPoint {
  return {
    x: (screenPoint.x - viewport.x) / viewport.scale,
    y: (screenPoint.y - viewport.y) / viewport.scale,
  };
}

export function canvasToScreenPoint(
  canvasPoint: CanvasPoint,
  viewport: CanvasViewport,
): CanvasPoint {
  return {
    x: canvasPoint.x * viewport.scale + viewport.x,
    y: canvasPoint.y * viewport.scale + viewport.y,
  };
}

export function panViewport(
  viewport: CanvasViewport,
  delta: CanvasPoint,
): CanvasViewport {
  return {
    ...viewport,
    x: viewport.x + delta.x,
    y: viewport.y + delta.y,
  };
}

export function zoomViewportAroundPoint(
  viewport: CanvasViewport,
  anchorPoint: CanvasPoint,
  nextScale: number,
): CanvasViewport {
  const clampedScale = clampViewportScale(nextScale);
  const canvasAnchor = screenToCanvasPoint(anchorPoint, viewport);

  return {
    x: anchorPoint.x - canvasAnchor.x * clampedScale,
    y: anchorPoint.y - canvasAnchor.y * clampedScale,
    scale: clampedScale,
  };
}

export function getGridSizeForScale(baseGridSize: number, scale: number) {
  const visibleGridSize = baseGridSize * scale;

  if (visibleGridSize < 18) {
    return baseGridSize * 4;
  }

  if (visibleGridSize < 32) {
    return baseGridSize * 2;
  }

  if (visibleGridSize > 120) {
    return baseGridSize / 2;
  }

  return baseGridSize;
}
