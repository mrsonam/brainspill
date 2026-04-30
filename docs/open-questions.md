# Open Questions

## Product

### What is the strongest first use case?

Current direction: creative moodboards and project whiteboarding.

Decision needed: whether the first onboarding, templates, examples, and empty states should lean more creative or more project-oriented.

Recommendation: start with creative moodboards as the emotional hook, while keeping project planning tools available through notes, shapes, arrows, and collaboration.

### Should public boards exist?

Decision needed: whether boards can be published publicly or only shared with specific people.

Recommendation: defer public publishing. Start with private boards, invited collaborators, and later view-only links.

### Is freehand drawing MVP?

Decision needed: whether drawing ships in the first release.

Recommendation: make freehand drawing V1 unless the selected rendering layer makes it low-risk.

## Technical

### Which canvas rendering layer should be used?

Options:

- Custom scene model with DOM/SVG/canvas rendering.
- `tldraw` as a foundation.
- `Konva`.
- `PixiJS`.

Recommendation: prototype a small custom scene model first, then compare against `tldraw` before committing. The decision should be based on selection behavior, text editing, Yjs integration, and long-term product control.

### Which auth provider should be paired with Convex?

Options:

- Convex Auth.
- Clerk.
- Auth.js.

Recommendation: choose Convex Auth if it covers the desired login methods and account management. Choose Clerk if polished hosted auth, social login, and future team/account features are important early.

### Where should images be stored?

Options:

- Convex file storage if it satisfies file size and serving needs.
- S3-compatible object storage.
- Cloudflare R2.

Recommendation: keep the asset model storage-neutral and choose the provider during implementation based on Convex integration, cost, and CDN needs.

### How should Yjs be synced and persisted?

Decision needed: select a Yjs provider and snapshot strategy.

Recommendation: evaluate provider compatibility with Next.js, Convex auth, server persistence, viewer restrictions, and reconnect behavior before implementation.

## Collaboration

### Should object locking exist?

Decision needed: whether users can lock objects from editing by others.

Recommendation: defer hard locking. Use visible selections and collaborative conflict behavior first.

### Should selections be private or shared?

Decision needed: whether everyone sees all selected objects.

Recommendation: share selections for collaborators in the same board, but keep it subtle and easy to ignore.

### How deep should undo/redo be?

Decision needed: whether MVP requires robust collaborative undo.

Recommendation: support local per-user undo for recent actions first. Add named history and restore points later.

## Export And Import

### Which export formats matter first?

Options:

- PNG.
- PDF.
- JSON board file.
- Proprietary board file.

Recommendation: ship PNG first, then JSON backup/export once the object schema stabilizes.

### Is import required?

Decision needed: whether users need to import existing boards or assets in bulk.

Recommendation: defer board import. Support multi-file image drag/drop first.

## Business And Growth

### Is this personal-first or team-first?

Decision needed: whether pricing, onboarding, and collaboration limits should optimize for individuals or small teams.

Recommendation: personal-first with easy sharing. This keeps the app approachable while leaving room for team workspaces later.

### Will there be templates?

Decision needed: whether templates are required for launch.

Recommendation: defer templates until after the core canvas is validated.