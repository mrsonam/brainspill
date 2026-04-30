# Brainspill Milestone 1 Implementation Plan

## Goal

Build the first single-user, canvas-first milestone from the approved design spec:

- Next.js App Router scaffold.
- Desktop-first app shell.
- shadcn/ui setup.
- Local board dashboard.
- Board workspace route.
- Infinite-feeling canvas with pan, zoom, grid, sticky notes, and image placement.
- Local scene store shaped for future Convex and Yjs migration.

This plan intentionally does not implement Convex persistence, Yjs collaboration, authentication enforcement, or durable asset storage. Those are later milestones.

## Constraints

- Use TypeScript strict mode.
- Use Next.js App Router conventions.
- Keep the dashboard light and server-friendly.
- Keep the board workspace as a client island.
- Avoid async client components.
- Use shadcn/ui for product controls, not the canvas hot path.
- Keep pan, zoom, drag, and resize out of React per-frame state updates.
- Use `requestAnimationFrame` for continuous pointer interactions.
- Keep local object state compatible with future Yjs object records.
- Do not introduce Convex or Yjs runtime dependencies until the canvas foundation is ready unless setup requires placeholder boundaries.

## Phase 1: Project Scaffold

Tasks:

- Initialize a Next.js App Router project in the existing project root.
- Enable TypeScript strict mode.
- Set up ESLint.
- Set up Tailwind CSS.
- Initialize shadcn/ui non-interactively with defaults.
- Verify the generated app runs locally.

Expected files:

- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `eslint.config.mjs`
- `postcss.config.mjs`
- `components.json`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/lib/utils.ts`

Validation:

- `npm run lint` passes.
- `npm run build` passes after the first meaningful implementation checkpoint.
- Font setup avoids circular Tailwind theme font variables if shadcn rewrites `globals.css`.

## Phase 2: App Shell And Routes

Tasks:

- Create a calm desktop-first shell.
- Add the dashboard route.
- Add the board route.
- Keep the board workspace separate from dashboard UI.
- Add route-level structure for future auth-protected app areas.

Recommended route shape:

```txt
src/app/
  layout.tsx
  page.tsx
  boards/
    page.tsx
    [boardId]/
      page.tsx
```

Expected behavior:

- `/` can redirect or link to `/boards`.
- `/boards` lists local boards and supports create/open.
- `/boards/[boardId]` opens the canvas workspace.

Validation:

- Dashboard route loads without importing canvas renderer modules.
- Board route owns the heavy interactive canvas code.

## Phase 3: Local Board Store

Tasks:

- Create a local board model.
- Store board records in a small local client store.
- Persist local boards in browser storage for prototype continuity.
- Keep persistence isolated so Convex can replace it later.

Recommended files:

```txt
src/features/boards/
  board-types.ts
  local-board-store.ts
  BoardDashboard.tsx
```

Data shape:

```ts
type Board = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
};
```

Validation:

- User can create a board.
- User can open a board.
- Board records survive refresh.
- Local storage access is guarded to client-only code.

## Phase 4: Canvas Scene Model

Tasks:

- Define the local scene object types.
- Create local scene store actions.
- Keep scene state independent from viewport state.
- Include stable IDs and flat records for future Yjs migration.

Recommended files:

```txt
src/features/canvas/
  model/canvas-types.ts
  model/create-canvas-object.ts
  state/canvas-scene-store.ts
  state/canvas-selection-store.ts
```

Initial object types:

- `stickyNote`
- `image`

Required actions:

- Create sticky note.
- Create image.
- Update object.
- Move object.
- Resize object.
- Duplicate object.
- Delete object.
- Select object.
- Clear selection.

Validation:

- Object reducers are unit-testable without React.
- Object state does not include viewport transform.
- Image objects store metadata, not binary file blobs beyond local preview URLs.

## Phase 5: Canvas Viewport Runtime

Tasks:

- Implement screen-to-canvas coordinate conversion.
- Implement pan.
- Implement zoom around cursor.
- Implement zoom reset.
- Implement grid rendering.
- Use an external/ref-based viewport runtime for pointer-move hot paths.

Recommended files:

```txt
src/features/canvas/
  viewport/viewport-types.ts
  viewport/viewport-math.ts
  viewport/useCanvasViewport.ts
  components/CanvasViewport.tsx
  components/GridLayer.tsx
```

Performance rules:

- Do not call React state setters on every pointer event.
- Schedule transform writes with `requestAnimationFrame`.
- Apply pan/zoom through one transform layer.
- Commit durable changes after interactions settle.

Validation:

- Pan feels smooth with mouse drag.
- Zoom occurs around cursor.
- Grid remains readable across zoom levels.
- Continuous pan/zoom does not rerender every canvas object.

## Phase 6: Canvas Objects UI

Tasks:

- Render sticky note objects.
- Render image objects.
- Add selection visuals.
- Add move interaction.
- Add resize handles.
- Add duplicate and delete actions.
- Add basic z-order behavior.

Recommended files:

```txt
src/features/canvas/
  components/CanvasObjectLayer.tsx
  components/StickyNoteObject.tsx
  components/ImageObject.tsx
  components/SelectionOverlay.tsx
  interactions/useObjectDrag.ts
  interactions/useObjectResize.ts
```

Validation:

- User can create, move, resize, duplicate, and delete sticky notes.
- User can create, move, resize, duplicate, and delete image objects.
- Editing one object does not rerender the entire workspace.

## Phase 7: Board Workspace UI

Tasks:

- Add a compact toolbar.
- Add grid toggle.
- Add note tool.
- Add image file picker.
- Add clipboard paste handler for images.
- Add minimal contextual inspector if needed.
- Add empty canvas prompt.

Recommended files:

```txt
src/features/board-workspace/
  BoardWorkspace.tsx
  CanvasToolbar.tsx
  EmptyCanvasPrompt.tsx
  CanvasShortcuts.tsx
```

shadcn/ui components:

- `button`
- `tooltip`
- `dropdown-menu`
- `dialog` if confirmation is needed
- `input` for board naming

Validation:

- User can add a note from the toolbar.
- User can add an image through file selection.
- User can paste an image from clipboard.
- Empty state disappears when content exists.

## Phase 8: Keyboard Shortcuts And Accessibility

Tasks:

- Add delete shortcut.
- Add duplicate shortcut.
- Add zoom reset shortcut.
- Add keyboard-accessible toolbar controls.
- Add visible focus states.
- Respect reduced motion for non-essential transitions.

Validation:

- Shortcuts do not fire while typing inside a sticky note.
- Toolbar controls are focusable.
- Canvas UI remains usable with keyboard-assisted workflows.

## Phase 9: Tests And Verification

Unit tests:

- Viewport transform math.
- Screen-to-canvas coordinate conversion.
- Object creation defaults.
- Move reducer.
- Resize reducer.
- Duplicate reducer.
- Delete reducer.

Integration or browser checks:

- Create board.
- Open board.
- Add sticky note.
- Add image.
- Paste image.
- Move and resize objects.
- Toggle grid.
- Use keyboard shortcuts.

Performance checks:

- Confirm dashboard does not import board canvas modules.
- Confirm pan/zoom remains smooth with at least 100 mixed objects.
- Confirm continuous viewport movement avoids React-driven object rerender storms.

## Implementation Order

1. Scaffold project.
2. Add shadcn/ui and base visual system.
3. Build dashboard route with local boards.
4. Build board route and workspace shell.
5. Implement scene object types and reducers.
6. Implement viewport runtime and grid.
7. Render sticky notes and images.
8. Add object interactions.
9. Add toolbar, file selection, and clipboard paste.
10. Add shortcuts and accessibility pass.
11. Add tests and manual verification.
12. Review implementation against this plan and the approved design spec.

## Later Milestone Hooks

Keep these boundaries visible while coding:

- `local-board-store.ts` should be replaceable by Convex queries and mutations.
- `canvas-scene-store.ts` should be replaceable by a Yjs document adapter.
- Image `src` should later become an asset ID plus resolved URL.
- Board route should eventually check permissions before loading editable UI.
- Toolbar actions should eventually respect editor/viewer roles.

## Do Not Build Yet

Do not implement these in Milestone 1:

- Convex auth.
- Convex schema.
- Yjs provider.
- Multiplayer cursors.
- Durable upload storage.
- Invites or sharing.
- Viewer role.
- Freehand drawing.
- Export.
- Version history.
