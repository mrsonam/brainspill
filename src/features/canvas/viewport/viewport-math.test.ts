import { describe, expect, it } from "vitest";

import type { CanvasViewport } from "@/features/canvas/model/canvas-types";
import {
  MAX_VIEWPORT_SCALE,
  MIN_VIEWPORT_SCALE,
} from "@/features/canvas/viewport/viewport-constants";
import {
  canvasToScreenPoint,
  clampViewportScale,
  getGridSizeForScale,
  panViewport,
  screenToCanvasPoint,
  zoomViewportAroundPoint,
} from "@/features/canvas/viewport/viewport-math";

describe("viewport math", () => {
  const viewport: CanvasViewport = {
    x: 100,
    y: 50,
    scale: 2,
  };

  it("converts screen points into canvas points", () => {
    expect(screenToCanvasPoint({ x: 300, y: 250 }, viewport)).toEqual({
      x: 100,
      y: 100,
    });
  });

  it("converts canvas points into screen points", () => {
    expect(canvasToScreenPoint({ x: 100, y: 100 }, viewport)).toEqual({
      x: 300,
      y: 250,
    });
  });

  it("pans the viewport by a screen-space delta", () => {
    expect(panViewport(viewport, { x: -20, y: 15 })).toEqual({
      x: 80,
      y: 65,
      scale: 2,
    });
  });

  it("clamps viewport scale", () => {
    expect(clampViewportScale(-1)).toBe(MIN_VIEWPORT_SCALE);
    expect(clampViewportScale(999)).toBe(MAX_VIEWPORT_SCALE);
    expect(clampViewportScale(1.5)).toBe(1.5);
  });

  it("keeps the canvas anchor stable while zooming", () => {
    const anchorPoint = { x: 320, y: 240 };
    const canvasAnchorBefore = screenToCanvasPoint(anchorPoint, viewport);
    const zoomedViewport = zoomViewportAroundPoint(viewport, anchorPoint, 3);
    const canvasAnchorAfter = screenToCanvasPoint(anchorPoint, zoomedViewport);

    expect(canvasAnchorAfter.x).toBeCloseTo(canvasAnchorBefore.x);
    expect(canvasAnchorAfter.y).toBeCloseTo(canvasAnchorBefore.y);
    expect(zoomedViewport.scale).toBe(3);
  });

  it("adapts grid size to visible scale", () => {
    expect(getGridSizeForScale(48, 0.2)).toBe(192);
    expect(getGridSizeForScale(48, 0.5)).toBe(96);
    expect(getGridSizeForScale(48, 1)).toBe(48);
    expect(getGridSizeForScale(48, 3)).toBe(24);
  });
});
