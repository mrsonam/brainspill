import type {
  CanvasObject,
  CanvasObjectPatch,
  CanvasPoint,
  CanvasScene,
  CanvasSize,
} from "@/features/canvas/model/canvas-types";

function nextZIndex(scene: CanvasScene) {
  return scene.objectOrder.reduce((maxZIndex, objectId) => {
    return Math.max(maxZIndex, scene.objects[objectId]?.zIndex ?? 0);
  }, 0) + 1;
}

function touchObject<TObject extends CanvasObject>(
  object: TObject,
  now = Date.now(),
) {
  return {
    ...object,
    updatedAt: now,
  };
}

export function getNextObjectZIndex(scene: CanvasScene) {
  return nextZIndex(scene);
}

export function addObjectToScene(
  scene: CanvasScene,
  object: CanvasObject,
): CanvasScene {
  return {
    ...scene,
    objects: {
      ...scene.objects,
      [object.id]: object,
    },
    objectOrder: [...scene.objectOrder, object.id],
    selectedObjectIds: [object.id],
  };
}

export function updateObjectInScene(
  scene: CanvasScene,
  objectId: string,
  patch: CanvasObjectPatch,
): CanvasScene {
  const object = scene.objects[objectId];

  if (!object) {
    return scene;
  }

  return {
    ...scene,
    objects: {
      ...scene.objects,
      [objectId]: touchObject({
        ...object,
        ...patch,
      } as CanvasObject),
    },
  };
}

export function moveObjectInScene(
  scene: CanvasScene,
  objectId: string,
  point: CanvasPoint,
): CanvasScene {
  return updateObjectInScene(scene, objectId, point);
}

export function resizeObjectInScene(
  scene: CanvasScene,
  objectId: string,
  size: CanvasSize,
): CanvasScene {
  return updateObjectInScene(scene, objectId, {
    width: Math.max(1, size.width),
    height: Math.max(1, size.height),
  });
}

export function selectObjectsInScene(
  scene: CanvasScene,
  selectedObjectIds: string[],
): CanvasScene {
  const selectedIds = selectedObjectIds.filter((objectId) => {
    return objectId in scene.objects;
  });

  return {
    ...scene,
    selectedObjectIds: Array.from(new Set(selectedIds)),
  };
}

export function deleteObjectsFromScene(
  scene: CanvasScene,
  objectIds: string[],
): CanvasScene {
  const objectIdSet = new Set(objectIds);
  const objects = Object.fromEntries(
    Object.entries(scene.objects).filter(([objectId]) => {
      return !objectIdSet.has(objectId);
    }),
  ) as CanvasScene["objects"];

  return {
    ...scene,
    objects,
    objectOrder: scene.objectOrder.filter((objectId) => {
      return !objectIdSet.has(objectId);
    }),
    selectedObjectIds: scene.selectedObjectIds.filter((objectId) => {
      return !objectIdSet.has(objectId);
    }),
  };
}

export function duplicateObjectInScene(
  scene: CanvasScene,
  objectId: string,
  duplicateId: string,
): CanvasScene {
  const object = scene.objects[objectId];

  if (!object) {
    return scene;
  }

  const now = Date.now();
  const duplicatedObject = {
    ...object,
    id: duplicateId,
    x: object.x + 24,
    y: object.y + 24,
    zIndex: nextZIndex(scene),
    createdAt: now,
    updatedAt: now,
  } as CanvasObject;

  return addObjectToScene(scene, duplicatedObject);
}
