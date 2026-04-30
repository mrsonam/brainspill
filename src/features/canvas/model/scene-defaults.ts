import type { CanvasScene, CanvasViewport, StickyNoteColor } from "./canvas-types";

export const DEFAULT_VIEWPORT: CanvasViewport = {
  x: 0,
  y: 0,
  scale: 1,
};

export const DEFAULT_NOTE_COLOR: StickyNoteColor = "yellow";

export const DEFAULT_NOTE_SIZE = {
  width: 240,
  height: 180,
} as const;

export const DEFAULT_IMAGE_SIZE = {
  width: 320,
  height: 220,
} as const;

export function createEmptyScene(boardId: string): CanvasScene {
  return {
    boardId,
    objects: {},
    objectOrder: [],
    selectedObjectIds: [],
  };
}
