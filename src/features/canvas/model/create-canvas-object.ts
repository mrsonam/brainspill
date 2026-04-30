import {
  DEFAULT_IMAGE_SIZE,
  DEFAULT_NOTE_COLOR,
  DEFAULT_NOTE_SIZE,
} from "./scene-defaults";
import type {
  CanvasPoint,
  ImageObject,
  StickyNoteColor,
  StickyNoteObject,
} from "./canvas-types";

type CreateObjectBaseInput = CanvasPoint & {
  zIndex: number;
  now?: number;
};

type CreateStickyNoteInput = CreateObjectBaseInput & {
  text?: string;
  color?: StickyNoteColor;
};

type CreateImageInput = CreateObjectBaseInput & {
  src: string;
  fileName?: string;
  mimeType?: string;
  naturalWidth?: number;
  naturalHeight?: number;
  width?: number;
  height?: number;
};

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createStickyNoteObject({
  x,
  y,
  zIndex,
  now = Date.now(),
  text = "",
  color = DEFAULT_NOTE_COLOR,
}: CreateStickyNoteInput): StickyNoteObject {
  return {
    id: createId("note"),
    type: "stickyNote",
    x,
    y,
    width: DEFAULT_NOTE_SIZE.width,
    height: DEFAULT_NOTE_SIZE.height,
    rotation: 0,
    zIndex,
    createdAt: now,
    updatedAt: now,
    text,
    color,
  };
}

export function createImageObject({
  x,
  y,
  zIndex,
  now = Date.now(),
  src,
  fileName,
  mimeType,
  naturalWidth,
  naturalHeight,
  width = naturalWidth ?? DEFAULT_IMAGE_SIZE.width,
  height = naturalHeight ?? DEFAULT_IMAGE_SIZE.height,
}: CreateImageInput): ImageObject {
  return {
    id: createId("image"),
    type: "image",
    x,
    y,
    width,
    height,
    rotation: 0,
    zIndex,
    createdAt: now,
    updatedAt: now,
    src,
    fileName,
    mimeType,
    naturalWidth,
    naturalHeight,
  };
}
