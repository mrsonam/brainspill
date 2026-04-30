# Data Model

## Principles

- Keep high-frequency collaborative state in Yjs.
- Keep searchable, permissioned, durable product records in Convex.
- Store binary assets outside the collaborative document.
- Reference assets by stable IDs from canvas objects.
- Design for snapshots and future version history from the beginning.

## Convex Records

### User

Represents an authenticated account.

Fields:

- `id`
- `displayName`
- `email`
- `avatarUrl`
- `createdAt`
- `updatedAt`

### Board

Represents a saved workspace.

Fields:

- `id`
- `ownerId`
- `title`
- `description`
- `thumbnailAssetId`
- `defaultGridEnabled`
- `defaultGridSize`
- `createdAt`
- `updatedAt`
- `lastOpenedAt`
- `archivedAt`

### BoardMember

Represents a user's access to a board.

Fields:

- `id`
- `boardId`
- `userId`
- `role`
- `invitedBy`
- `createdAt`
- `updatedAt`

Roles:

- `owner`
- `editor`
- `viewer`

### BoardInvite

Represents pending share access.

Fields:

- `id`
- `boardId`
- `email`
- `role`
- `tokenHash`
- `expiresAt`
- `acceptedAt`
- `createdAt`

### Asset

Represents uploaded or pasted media.

Fields:

- `id`
- `boardId`
- `ownerId`
- `storageKey`
- `mimeType`
- `fileName`
- `fileSize`
- `width`
- `height`
- `transparent`
- `createdAt`

### DocumentSnapshot

Represents a durable checkpoint of the Yjs document.

Fields:

- `id`
- `boardId`
- `snapshotKey`
- `updateClock`
- `byteSize`
- `createdAt`
- `createdBy`

### PublicShareLink

Represents optional link-based access.

Fields:

- `id`
- `boardId`
- `role`
- `tokenHash`
- `enabled`
- `expiresAt`
- `createdAt`
- `createdBy`

## Yjs Canvas Document

The Yjs document should contain collaborative board state that changes frequently.

Suggested structure:

- `objects`: map of canvas object IDs to object records.
- `rootOrder`: array or ordering structure for z-order.
- `boardSettings`: collaborative settings such as grid visibility.
- `presence`: provider-level awareness for cursors, active selections, and user status.

## Canvas Object Shape

Shared fields:

- `id`
- `type`
- `x`
- `y`
- `width`
- `height`
- `rotation`
- `zIndex`
- `locked`
- `createdBy`
- `createdAt`
- `updatedBy`
- `updatedAt`

Sticky note fields:

- `text`
- `color`
- `textAlign`
- `fontSize`

Image and sticker fields:

- `assetId`
- `src`
- `alt`
- `crop`
- `opacity`

Shape fields:

- `shape`
- `fill`
- `stroke`
- `strokeWidth`

Arrow fields:

- `start`
- `end`
- `stroke`
- `strokeWidth`
- `arrowHead`

Freehand fields:

- `points`
- `stroke`
- `strokeWidth`
- `smoothing`

## Presence State

Presence is transient and should not be stored as durable board data.

Fields:

- `userId`
- `displayName`
- `avatarUrl`
- `color`
- `cursor`
- `selectedObjectIds`
- `activeTool`
- `lastActiveAt`

## Permission Rules

- Owners can manage board settings, delete boards, and manage members.
- Editors can create, update, and delete canvas objects.
- Viewers can open boards and see presence, but cannot publish canvas changes.
- Asset reads follow board access.
- Asset writes require editor or owner access.