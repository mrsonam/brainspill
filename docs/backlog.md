# Backlog

## Priority 0: Decisions Before Build

- Choose canvas rendering approach.
- Choose auth provider for Convex.
- Choose asset storage provider.
- Choose Yjs sync and persistence strategy.
- Define upload size limits.
- Decide whether freehand drawing is MVP or V1.

## Priority 1: MVP Foundation

- Scaffold Next.js app.
- Configure TypeScript, linting, formatting, and basic project scripts.
- Configure Convex.
- Add auth provider.
- Create authenticated app shell.
- Create base visual system for workspace UI.
- Create board dashboard route.
- Create board workspace route.

## Priority 2: Board Data

- Define Convex schema for users, boards, members, assets, and snapshots.
- Add create board mutation.
- Add rename board mutation.
- Add delete or archive board mutation.
- Add list boards query.
- Add get board query with permission checks.
- Add board member role checks.

## Priority 3: Canvas Core

- Implement canvas viewport state.
- Implement pan with mouse and trackpad support.
- Implement zoom around cursor.
- Implement zoom-to-fit.
- Implement reset view.
- Implement grid overlay.
- Implement adaptive grid density.
- Implement selection state.
- Implement keyboard shortcut manager.

## Priority 4: Object System

- Define shared canvas object schema.
- Render sticky note objects.
- Add note creation tool.
- Add note text editing.
- Add object movement.
- Add object resizing.
- Add duplicate, delete, copy, and paste.
- Add z-order support.
- Add basic shapes.
- Add basic arrows.

## Priority 5: Media

- Add file upload UI.
- Add drag/drop upload.
- Add clipboard image paste.
- Store uploaded files.
- Store asset metadata in Convex.
- Insert image object after upload.
- Preserve transparent PNG display.
- Generate or store image dimensions.
- Add file validation.

## Priority 6: Realtime Collaboration

- Create Yjs document per board.
- Sync canvas object state through Yjs.
- Add collaborator presence.
- Add live cursors.
- Add live selections.
- Add permission-aware document mutation.
- Add reconnect handling.
- Add document snapshot persistence.
- Recover board state after reload.

## Priority 7: Sharing

- Add board member list.
- Add invite editor flow.
- Add viewer role.
- Add share link model.
- Add permission-aware toolbar states.
- Add access removed handling.

## Priority 8: Polish

- Add empty board starter prompts.
- Add shortcut help.
- Add autosave or sync status.
- Add contextual inspector.
- Add loading skeletons.
- Add graceful upload errors.
- Add board thumbnail generation.
- Add export as PNG.

## Later

- Comments and reactions.
- Presentation mode.
- Templates.
- Minimap.
- Version history UI.
- Mobile/tablet viewing.
- Tablet editing.
- AI-assisted organization.
- Marketplace or sticker packs.

## First Milestone

The first milestone should end with a signed-in user creating a board, placing sticky notes and images, navigating the infinite canvas smoothly, and seeing another collaborator's cursor and object changes in realtime.
