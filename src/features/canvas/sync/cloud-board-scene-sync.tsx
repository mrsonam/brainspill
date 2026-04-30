"use client";

import { useConvex, useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";

import type { CanvasScene } from "@/features/canvas/model/canvas-types";
import {
  parseCanvasSceneJson,
  serializeCanvasScene,
} from "@/features/canvas/model/scene-serialization";
import {
  replaceLocalScene,
  useLocalScene,
} from "@/features/canvas/state/local-scene-store";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

const CLIENT_MAX_SCENE_BYTES = 15 * 1024 * 1024;
const SAVE_DEBOUNCE_MS = 900;

export function useCloudBoardSceneSync(options: {
  boardId: string;
  enabled: boolean;
  scene: CanvasScene;
}) {
  const { boardId, enabled, scene } = options;
  const convex = useConvex();
  const generateSceneUploadUrl = useMutation(
    api.boardScenes.generateSceneUploadUrl,
  );
  const commitBoardScene = useMutation(api.boardScenes.commitBoardScene);
  const hydratedRef = useRef(false);
  const [saveGeneration, setSaveGeneration] = useState(0);

  useEffect(() => {
    if (!enabled) {
      hydratedRef.current = true;
      return;
    }

    hydratedRef.current = false;
    let cancelled = false;

    void (async () => {
      try {
        const download = await convex.query(api.boardScenes.getBoardSceneDownload, {
          boardId: boardId as Id<"boards">,
        });

        if (cancelled) {
          return;
        }

        if (download?.url) {
          const response = await fetch(download.url);

          if (!response.ok) {
            throw new Error("Could not download canvas snapshot.");
          }

          const json: unknown = await response.json();
          const parsedScene = parseCanvasSceneJson(json);

          if (parsedScene && !cancelled) {
            replaceLocalScene(boardId, parsedScene);
          }
        }
      } catch (error) {
        console.warn("[brainspill] Canvas cloud hydrate failed.", error);
      } finally {
        if (!cancelled) {
          hydratedRef.current = true;
          setSaveGeneration((generation) => generation + 1);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [boardId, convex, enabled]);

  useEffect(() => {
    if (!enabled || !hydratedRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const payload = serializeCanvasScene(scene);
          const encoder = new TextEncoder();
          const bytes = encoder.encode(payload);

          if (bytes.byteLength > CLIENT_MAX_SCENE_BYTES) {
            console.warn(
              "[brainspill] Canvas snapshot exceeds sync limit; skipping upload.",
            );
            return;
          }

          const blob = new Blob([bytes], {
            type: "application/json;charset=utf-8",
          });
          const uploadUrl = await generateSceneUploadUrl();
          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json;charset=utf-8",
            },
            body: blob,
          });

          if (!uploadResponse.ok) {
            throw new Error("Canvas snapshot upload failed.");
          }

          const uploadJson: unknown = await uploadResponse.json();

          if (
            !uploadJson ||
            typeof uploadJson !== "object" ||
            !("storageId" in uploadJson) ||
            typeof (uploadJson as { storageId: unknown }).storageId !== "string"
          ) {
            throw new Error("Unexpected upload response.");
          }

          const storageId = (uploadJson as { storageId: string }).storageId;

          await commitBoardScene({
            boardId: boardId as Id<"boards">,
            storageId: storageId as Id<"_storage">,
            byteSize: blob.size,
          });
        } catch (error) {
          console.warn("[brainspill] Canvas cloud save failed.", error);
        }
      })();
    }, SAVE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    boardId,
    commitBoardScene,
    enabled,
    generateSceneUploadUrl,
    saveGeneration,
    scene,
  ]);
}

type CloudBoardSceneSyncProps = {
  boardId: string;
  enabled: boolean;
};

export function CloudBoardSceneSync({
  boardId,
  enabled,
}: CloudBoardSceneSyncProps) {
  const scene = useLocalScene(boardId);

  useCloudBoardSceneSync({
    boardId,
    enabled,
    scene,
  });

  return null;
}
