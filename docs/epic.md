# Epics

## Epic 1: Project Foundation

Build the base application structure for a desktop-first web app.

User value:

- Users can access a reliable, fast app shell.
- The product has a foundation for auth, routing, backend calls, and future iteration.

Key outcomes:

- Next.js app scaffold.
- Convex configured.
- Auth decision implemented.
- Base layout and visual system.
- Environment setup documented.

## Epic 2: Board Dashboard

Let users manage their saved boards.

User value:

- Users can create and return to workspaces.
- Boards feel persistent and account-backed.

Key outcomes:

- Create board.
- Rename board.
- Delete or archive board.
- List recent boards.
- Open board workspace.
- Show board thumbnails when available.

## Epic 3: Brainspill Canvas Core

Build the core workspace interaction model.

User value:

- Users can think spatially without hitting page limits.
- The canvas feels fast, precise, and easy to navigate.

Key outcomes:

- Pan.
- Zoom.
- Zoom-to-fit.
- Reset view.
- Grid overlay.
- Initial origin and viewport behavior.
- Selection model.
- Keyboard shortcuts.

## Epic 4: Canvas Objects

Support the first useful set of editable canvas content.

User value:

- Users can capture thoughts, arrange references, and build visual boards.

Key outcomes:

- Sticky notes.
- Uploaded images.
- Pasted images.
- Transparent PNG stickers.
- Basic shapes.
- Basic arrows.
- Object move, resize, duplicate, delete, copy, and paste.

## Epic 5: Assets And Media

Provide reliable handling for uploaded and pasted media.

User value:

- Users can collect visual references without friction.

Key outcomes:

- Upload flow.
- Clipboard image handling.
- Drag/drop handling.
- Asset metadata.
- Storage integration.
- Image dimensions and thumbnails.
- File size and MIME validation.

## Epic 6: Realtime Collaboration

Enable multiple users to work in the same board.

User value:

- Teams can brainstorm, moodboard, and plan together live.

Key outcomes:

- Yjs document lifecycle.
- Shared object state.
- Live cursors.
- Selection presence.
- Collaborative object edits.
- Reconnect behavior.
- Viewer edit prevention.

## Epic 7: Sharing And Permissions

Control who can view and edit boards.

User value:

- Users can safely invite collaborators.

Key outcomes:

- Owner role.
- Editor role.
- Viewer role.
- Invite flow.
- Shareable links.
- Permission checks in Convex.
- Permission-aware UI states.

## Epic 8: Persistence And Recovery

Keep board data durable across reloads and sessions.

User value:

- Users can trust the board with real work.

Key outcomes:

- Document snapshots.
- Board metadata persistence.
- Asset references.
- Reload recovery.
- Basic failure states.
- Autosave status.

## Epic 9: Product Polish

Make the app feel refined enough for repeated use.

User value:

- Users feel oriented and confident while working.

Key outcomes:

- Empty board onboarding.
- Shortcut help.
- Contextual inspector.
- Toolbar refinement.
- Presence polish.
- Board loading states.
- Error and reconnect states.