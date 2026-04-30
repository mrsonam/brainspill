"use client";

import { RefObject } from "react";

import { ImageObject } from "@/features/canvas/components/ImageObject";
import { StickyNoteObject } from "@/features/canvas/components/StickyNoteObject";
import type { CanvasViewport } from "@/features/canvas/model/canvas-types";
import { useLocalScene } from "@/features/canvas/state/local-scene-store";

type CanvasObjectLayerProps = {
  boardId: string;
  viewportRef: RefObject<CanvasViewport>;
};

export function CanvasObjectLayer({
  boardId,
  viewportRef,
}: CanvasObjectLayerProps) {
  const scene = useLocalScene(boardId);
  const selectedObjectIds = new Set(scene.selectedObjectIds);

  return (
    <>
      {scene.objectOrder.map((objectId) => {
        const object = scene.objects[objectId];

        if (!object) {
          return null;
        }

        if (object.type === "stickyNote") {
          return (
            <StickyNoteObject
              key={object.id}
              boardId={boardId}
              object={object}
              selected={selectedObjectIds.has(object.id)}
              viewportRef={viewportRef}
            />
          );
        }

        return (
          <ImageObject
            key={object.id}
            boardId={boardId}
            object={object}
            selected={selectedObjectIds.has(object.id)}
            viewportRef={viewportRef}
          />
        );
      })}
    </>
  );
}
