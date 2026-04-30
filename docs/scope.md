# Scope

## Release Strategy

The product should be developed in phases. The first usable version must prove that the canvas feels excellent: smooth navigation, reliable object manipulation, intuitive paste/upload flows, and collaborative presence that does not distract from the work.

## MVP

The MVP is a polished collaborative canvas foundation.

Included:

- Account-backed access.
- Board dashboard with create, open, rename, and delete.
- Infinite-feeling canvas with pan, zoom, zoom-to-fit, reset view, and keyboard shortcuts.
- Blank canvas and grid overlay modes.
- Sticky notes with color, text, position, size, and z-order.
- Image upload, drag/drop, and clipboard paste.
- Transparent PNG sticker support through the same image object model.
- Selection, move, resize, duplicate, delete, copy, paste, undo, and redo.
- Basic realtime presence: active users, cursors, and selected objects.
- Live collaborative object updates through a Yjs document model.
- Board permissions for owner and editor roles.
- Durable board metadata and document snapshots.

## V1

V1 should expand the MVP into a product that can support real creative and project workflows.

Included:

- Viewer role and shareable board links.
- Basic shapes, arrows, and text labels.
- Freehand drawing if performance and collaboration remain stable.
- Asset library per board.
- Board thumbnails.
- Export as PNG and JSON.
- Improved undo/redo across collaborative sessions.
- Activity indicators for recently edited objects.
- Better empty states, onboarding tips, and shortcut help.

## V2

V2 can add higher-level workflows after the canvas core is trusted.

Candidate features:

- Comments and reactions.
- Presentation mode.
- Templates for moodboards, planning, retros, and research boards.
- Minimap for large boards.
- Version history and restore points.
- Team workspaces and organization-level permissions.
- PDF export.
- Mobile and tablet viewing, followed by touch editing.
- Smart layout helpers.

## Deferred

These should not block the first release:

- Plugin ecosystem.
- Marketplace for stickers or templates.
- Full diagramming engine with complex connectors.
- AI-generated boards or media.
- OCR and semantic search across board content.
- Advanced enterprise controls.

## Success Criteria

- A user can create a board and start placing notes or pasted images within seconds.
- Zoom and pan remain smooth with a realistic number of objects.
- Two signed-in users can edit the same board and understand what the other person is doing.
- Board data survives reloads and reconnects.
- The UI feels quiet enough that the content remains the visual focus.
