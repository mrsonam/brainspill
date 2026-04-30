export type CanvasObjectType = "stickyNote" | "image";

export type CanvasPoint = {
  x: number;
  y: number;
};

export type CanvasSize = {
  width: number;
  height: number;
};

export type CanvasRect = CanvasPoint & CanvasSize;

export type CanvasViewport = {
  x: number;
  y: number;
  scale: number;
};

export type StickyNoteColor = "yellow" | "pink" | "blue" | "green" | "white";

export type CanvasObjectBase = CanvasRect & {
  id: string;
  type: CanvasObjectType;
  rotation: number;
  zIndex: number;
  createdAt: number;
  updatedAt: number;
};

export type StickyNoteObject = CanvasObjectBase & {
  type: "stickyNote";
  text: string;
  color: StickyNoteColor;
};

export type ImageObject = CanvasObjectBase & {
  type: "image";
  src: string;
  fileName?: string;
  mimeType?: string;
  naturalWidth?: number;
  naturalHeight?: number;
};

export type CanvasObject = StickyNoteObject | ImageObject;

export type CanvasScene = {
  boardId: string;
  objects: Record<string, CanvasObject>;
  objectOrder: string[];
  selectedObjectIds: string[];
};

export type CanvasObjectPatch = Partial<
  Omit<CanvasObject, "id" | "type" | "createdAt">
>;
