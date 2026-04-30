"use client";

import { useMemo, useSyncExternalStore } from "react";

import type {
  CanvasObject,
  CanvasPoint,
  CanvasScene,
  CanvasSize,
} from "@/features/canvas/model/canvas-types";
import {
  createImageObject,
  createStickyNoteObject,
} from "@/features/canvas/model/create-canvas-object";
import { createEmptyScene } from "@/features/canvas/model/scene-defaults";
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

type SceneListener = () => void;

type CreateStickyNoteOptions = CanvasPoint & {
  text?: string;
};

type CreateImageOptions = CanvasPoint & {
  src: string;
  fileName?: string;
  mimeType?: string;
  naturalWidth?: number;
  naturalHeight?: number;
  width?: number;
  height?: number;
};

const sceneSnapshots = new Map<string, CanvasScene>();
const serverSceneSnapshots = new Map<string, CanvasScene>();
const sceneListeners = new Map<string, Set<SceneListener>>();

function getScene(boardId: string) {
  const scene = sceneSnapshots.get(boardId);

  if (scene) {
    return scene;
  }

  const emptyScene = createEmptyScene(boardId);
  sceneSnapshots.set(boardId, emptyScene);

  return emptyScene;
}

function emitSceneChange(boardId: string) {
  sceneListeners.get(boardId)?.forEach((listener) => listener());
}

export function replaceLocalScene(boardId: string, scene: CanvasScene) {
  const normalized: CanvasScene = {
    ...scene,
    boardId,
    selectedObjectIds: [],
  };

  sceneSnapshots.set(boardId, normalized);
  emitSceneChange(boardId);

  return normalized;
}

function updateScene(
  boardId: string,
  updater: (scene: CanvasScene) => CanvasScene,
) {
  const nextScene = updater(getScene(boardId));
  sceneSnapshots.set(boardId, nextScene);
  emitSceneChange(boardId);

  return nextScene;
}

function createDuplicateId(object: CanvasObject) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${object.type}-${crypto.randomUUID()}`;
  }

  return `${object.type}-${Math.random().toString(36).slice(2, 10)}`;
}

export function subscribeLocalScene(boardId: string, listener: SceneListener) {
  const listeners = sceneListeners.get(boardId) ?? new Set<SceneListener>();
  listeners.add(listener);
  sceneListeners.set(boardId, listeners);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      sceneListeners.delete(boardId);
    }
  };
}

export function getLocalSceneSnapshot(boardId: string) {
  return getScene(boardId);
}

export function getServerLocalSceneSnapshot(boardId: string) {
  const scene = serverSceneSnapshots.get(boardId);

  if (scene) {
    return scene;
  }

  const emptyScene = createEmptyScene(boardId);
  serverSceneSnapshots.set(boardId, emptyScene);

  return emptyScene;
}

export function createLocalStickyNote(
  boardId: string,
  options: CreateStickyNoteOptions,
) {
  return updateScene(boardId, (scene) => {
    const object = createStickyNoteObject({
      ...options,
      zIndex: getNextObjectZIndex(scene),
    });

    return addObjectToScene(scene, object);
  });
}

export function createLocalImage(boardId: string, options: CreateImageOptions) {
  return updateScene(boardId, (scene) => {
    const object = createImageObject({
      ...options,
      zIndex: getNextObjectZIndex(scene),
    });

    return addObjectToScene(scene, object);
  });
}

export function updateLocalObject(
  boardId: string,
  objectId: string,
  patch: Parameters<typeof updateObjectInScene>[2],
) {
  return updateScene(boardId, (scene) => {
    return updateObjectInScene(scene, objectId, patch);
  });
}

export function moveLocalObject(
  boardId: string,
  objectId: string,
  point: CanvasPoint,
) {
  return updateScene(boardId, (scene) => {
    return moveObjectInScene(scene, objectId, point);
  });
}

export function resizeLocalObject(
  boardId: string,
  objectId: string,
  size: CanvasSize,
) {
  return updateScene(boardId, (scene) => {
    return resizeObjectInScene(scene, objectId, size);
  });
}

export function selectLocalObjects(boardId: string, objectIds: string[]) {
  return updateScene(boardId, (scene) => {
    return selectObjectsInScene(scene, objectIds);
  });
}

export function deleteLocalObjects(boardId: string, objectIds: string[]) {
  return updateScene(boardId, (scene) => {
    return deleteObjectsFromScene(scene, objectIds);
  });
}

export function duplicateLocalObject(boardId: string, objectId: string) {
  return updateScene(boardId, (scene) => {
    const object = scene.objects[objectId];

    if (!object) {
      return scene;
    }

    return duplicateObjectInScene(scene, objectId, createDuplicateId(object));
  });
}

export function useLocalScene(boardId: string) {
  const subscribe = useMemo(() => {
    return (listener: SceneListener) => subscribeLocalScene(boardId, listener);
  }, [boardId]);
  const getSnapshot = useMemo(() => {
    return () => getLocalSceneSnapshot(boardId);
  }, [boardId]);
  const getServerSnapshot = useMemo(() => {
    return () => getServerLocalSceneSnapshot(boardId);
  }, [boardId]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
