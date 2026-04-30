import type {
  CanvasObject,
  CanvasScene,
  CanvasObjectType,
  StickyNoteColor,
} from "@/features/canvas/model/canvas-types";

const NOTE_COLORS = new Set<StickyNoteColor>([
  "yellow",
  "pink",
  "blue",
  "green",
  "white",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseCanvasObject(value: unknown): CanvasObject | null {
  if (!isPlainObject(value)) {
    return null;
  }

  const id = typeof value.id === "string" ? value.id : null;
  const type = value.type as CanvasObjectType | undefined;

  if (!id || (type !== "stickyNote" && type !== "image")) {
    return null;
  }

  const x = parseNumber(value.x);
  const y = parseNumber(value.y);
  const width = parseNumber(value.width);
  const height = parseNumber(value.height);
  const rotation = parseNumber(value.rotation);
  const zIndex = parseNumber(value.zIndex);
  const createdAt = parseNumber(value.createdAt);
  const updatedAt = parseNumber(value.updatedAt);

  if (
    x === null ||
    y === null ||
    width === null ||
    height === null ||
    rotation === null ||
    zIndex === null ||
    createdAt === null ||
    updatedAt === null
  ) {
    return null;
  }

  if (type === "stickyNote") {
    if (typeof value.text !== "string") {
      return null;
    }

    const text = value.text;
    const color =
      typeof value.color === "string" && NOTE_COLORS.has(value.color as StickyNoteColor)
        ? (value.color as StickyNoteColor)
        : null;

    if (!color) {
      return null;
    }

    return {
      id,
      type: "stickyNote",
      x,
      y,
      width,
      height,
      rotation,
      zIndex,
      createdAt,
      updatedAt,
      text,
      color,
    };
  }

  const src = typeof value.src === "string" ? value.src : null;

  if (!src) {
    return null;
  }

  const naturalWidth = parseNumber(value.naturalWidth);
  const naturalHeight = parseNumber(value.naturalHeight);

  return {
    id,
    type: "image",
    x,
    y,
    width,
    height,
    rotation,
    zIndex,
    createdAt,
    updatedAt,
    src,
    fileName: parseOptionalString(value.fileName),
    mimeType: parseOptionalString(value.mimeType),
    naturalWidth: naturalWidth ?? undefined,
    naturalHeight: naturalHeight ?? undefined,
  };
}

export function serializeCanvasScene(scene: CanvasScene): string {
  return JSON.stringify(scene);
}

export function parseCanvasSceneJson(raw: unknown): CanvasScene | null {
  if (!isPlainObject(raw)) {
    return null;
  }

  const boardId = typeof raw.boardId === "string" ? raw.boardId : null;

  if (!boardId) {
    return null;
  }

  const objectsRaw = raw.objects;
  const orderRaw = raw.objectOrder;
  const selectionRaw = raw.selectedObjectIds;

  if (!isPlainObject(objectsRaw) || !Array.isArray(orderRaw)) {
    return null;
  }

  if (!Array.isArray(selectionRaw) || !selectionRaw.every((id) => typeof id === "string")) {
    return null;
  }

  const objects: Record<string, CanvasObject> = {};

  for (const objectId of orderRaw) {
    if (typeof objectId !== "string") {
      return null;
    }

    const parsed = parseCanvasObject(objectsRaw[objectId]);

    if (!parsed || parsed.id !== objectId) {
      return null;
    }

    objects[objectId] = parsed;
  }

  for (const key of Object.keys(objectsRaw)) {
    if (!(key in objects)) {
      return null;
    }
  }

  return {
    boardId,
    objects,
    objectOrder: orderRaw as string[],
    selectedObjectIds: [],
  };
}
