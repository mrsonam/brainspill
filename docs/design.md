# Design

## Visual Thesis

Brainspill is a witty, low-chrome creative workspace where notes, images, and stickers carry the energy while the product UI stays almost invisible.

The interface should feel precise, calm, and fast. Avoid heavy panels, card mosaics, bright dashboard styling, and decorative chrome. The canvas is the product.

## Layout Model

The board workspace is organized around four regions:

- Canvas: the primary working surface.
- Creation toolbar: compact access to select, note, image, sticker, shape, arrow, and draw tools.
- Presence area: collaborators, live cursors, and lightweight session state.
- Inspector: contextual controls for selected objects, hidden when no selection needs editing.

## Canvas Behavior

- New boards open centered on an initial origin at a comfortable zoom level.
- The board has no visible hard edge.
- Users can pan in any direction and zoom out to reveal more workspace.
- Object placement beyond the current viewport expands the perceived bounds.
- Grid mode is an overlay, not a different board type.
- Grid density should adapt to zoom so it remains useful without becoming noisy.

## Core Interactions

- Click and drag to select or move objects.
- Drag handles to resize images, stickers, shapes, and notes.
- Use keyboard shortcuts for duplicate, delete, copy, paste, undo, redo, zoom, and fit-to-view.
- Paste images directly from the clipboard.
- Drag image files onto the canvas to upload and place them.
- Double-click a note to edit text.
- Hold a modifier key for constrained movement or proportional resize where appropriate.

## Object Behavior

### Sticky Notes

Sticky notes are lightweight thought containers. They should support:

- Text editing.
- Color variants.
- Resize.
- Basic formatting if it does not complicate collaboration.
- Auto-sizing defaults for quick capture.

### Images And Stickers

Images and stickers share the same object model. Transparent PNGs should preserve transparency and behave naturally as stickers.

Required behavior:

- Upload.
- Clipboard paste.
- Drag/drop.
- Resize.
- Move.
- Duplicate.
- Delete.
- Maintain aspect ratio by default.

### Shapes And Arrows

Shapes and arrows should start simple:

- Rectangle, ellipse, line, and arrow.
- Fill, stroke, and basic color controls.
- No complex connector routing in MVP.

### Drawing

Freehand drawing is valuable, but should not compromise canvas performance or collaboration stability. Treat it as V1 unless implementation risk is low after the canvas foundation is complete.

## Realtime Design

Realtime collaboration should be visible but restrained:

- Show collaborator cursors only while active.
- Show names near selections when useful.
- Avoid persistent noisy trails.
- Use color consistently per collaborator.
- Make permission state clear when a user cannot edit.

## Empty States

The first board should invite action without feeling like a tutorial modal.

Suggested empty-state actions:

- Write a note.
- Paste an image.
- Drop a file.
- Turn on grid.
- Invite someone.

## Motion

Motion should support orientation and confidence:

- Smooth zoom and pan.
- Subtle grid fade between zoom levels.
- Selection and resize transitions that clarify state.
- Lightweight collaborator cursor movement.

Avoid ornamental animations that make the canvas feel slower.