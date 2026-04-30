import { describe, expect, it, vi } from "vitest";

import type {
  CanvasScene,
  StickyNoteObject,
} from "@/features/canvas/model/canvas-types";
import {
  addObjectToScene,
  deleteObjectsFromScene,
  duplicateObjectInScene,
  getNextObjectZIndex,
  moveObjectInScene,
  resizeObjectInScene,
  selectObjectsInScene,
  updateObjectInScene,
} from "@/features/canvas/state/scene-reducer";

function createScene(): CanvasScene {
  return {
    boardId: "board-1",
    objects: {},
    objectOrder: [],
    selectedObjectIds: [],
  };
}

function createNote(id = "note-1", zIndex = 1): StickyNoteObject {
  return {
    id,
    type: "stickyNote",
    x: 10,
    y: 20,
    width: 240,
    height: 180,
    rotation: 0,
    zIndex,
    createdAt: 100,
    updatedAt: 100,
    text: "Test note",
    color: "yellow",
  };
}

describe("scene reducer", () => {
  it("adds an object and selects it", () => {
    const object = createNote();
    const scene = addObjectToScene(createScene(), object);

    expect(scene.objects[object.id]).toBe(object);
    expect(scene.objectOrder).toEqual([object.id]);
    expect(scene.selectedObjectIds).toEqual([object.id]);
  });

  it("returns the next z-index above all objects", () => {
    const scene = addObjectToScene(
      addObjectToScene(createScene(), createNote("note-1", 4)),
      createNote("note-2", 9),
    );

    expect(getNextObjectZIndex(scene)).toBe(10);
  });

  it("updates an object without changing its id or type", () => {
    const scene = addObjectToScene(createScene(), createNote());
    const updatedScene = updateObjectInScene(scene, "note-1", {
      text: "Updated",
    });

    expect(updatedScene.objects["note-1"]).toMatchObject({
      id: "note-1",
      type: "stickyNote",
      text: "Updated",
    });
  });

  it("moves an object", () => {
    const scene = addObjectToScene(createScene(), createNote());
    const updatedScene = moveObjectInScene(scene, "note-1", {
      x: 120,
      y: 140,
    });

    expect(updatedScene.objects["note-1"]).toMatchObject({
      x: 120,
      y: 140,
    });
  });

  it("resizes an object and clamps size to at least one pixel", () => {
    const scene = addObjectToScene(createScene(), createNote());
    const updatedScene = resizeObjectInScene(scene, "note-1", {
      width: -10,
      height: 0,
    });

    expect(updatedScene.objects["note-1"]).toMatchObject({
      width: 1,
      height: 1,
    });
  });

  it("deduplicates and filters selection IDs", () => {
    const scene = addObjectToScene(createScene(), createNote());
    const updatedScene = selectObjectsInScene(scene, [
      "note-1",
      "missing",
      "note-1",
    ]);

    expect(updatedScene.selectedObjectIds).toEqual(["note-1"]);
  });

  it("deletes objects and removes them from order and selection", () => {
    const scene = selectObjectsInScene(
      addObjectToScene(createScene(), createNote()),
      ["note-1"],
    );
    const updatedScene = deleteObjectsFromScene(scene, ["note-1"]);

    expect(updatedScene.objects["note-1"]).toBeUndefined();
    expect(updatedScene.objectOrder).toEqual([]);
    expect(updatedScene.selectedObjectIds).toEqual([]);
  });

  it("duplicates an object with offset position and fresh timestamps", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);

    const scene = addObjectToScene(createScene(), createNote());
    const updatedScene = duplicateObjectInScene(scene, "note-1", "note-2");

    expect(updatedScene.objects["note-2"]).toMatchObject({
      id: "note-2",
      type: "stickyNote",
      x: 34,
      y: 44,
      zIndex: 2,
      createdAt: 1000,
      updatedAt: 1000,
    });
    expect(updatedScene.objectOrder).toEqual(["note-1", "note-2"]);
    expect(updatedScene.selectedObjectIds).toEqual(["note-2"]);

    vi.useRealTimers();
  });
});
