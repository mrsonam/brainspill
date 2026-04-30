import { describe, expect, it } from "vitest";

import { createEmptyScene } from "@/features/canvas/model/scene-defaults";
import { createStickyNoteObject } from "@/features/canvas/model/create-canvas-object";
import {
  parseCanvasSceneJson,
  serializeCanvasScene,
} from "@/features/canvas/model/scene-serialization";
import { addObjectToScene } from "@/features/canvas/state/scene-reducer";

describe("scene serialization", () => {
  it("roundtrips a minimal scene", () => {
    let scene = createEmptyScene("board_test");
    const note = createStickyNoteObject({
      x: 12,
      y: 34,
      zIndex: 1,
      text: "hello",
      color: "yellow",
      now: 12_345,
    });
    scene = addObjectToScene(scene, note);

    const json = JSON.parse(serializeCanvasScene(scene)) as unknown;
    const parsed = parseCanvasSceneJson(json);

    expect(parsed).not.toBeNull();
    expect(parsed?.boardId).toBe("board_test");
    expect(parsed?.objectOrder).toEqual([note.id]);
    expect(parsed?.objects[note.id]?.type).toBe("stickyNote");
    expect(parsed?.selectedObjectIds).toEqual([]);
  });

  it("rejects malformed payloads", () => {
    expect(parseCanvasSceneJson(null)).toBeNull();
    expect(parseCanvasSceneJson({ boardId: "x" })).toBeNull();
  });
});
