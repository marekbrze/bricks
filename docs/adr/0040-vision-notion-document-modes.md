# 0040 - Vision as a Notion-style document with view/edit modes

**Date**: 2026-09-07
**Module**: vision
**Status**: Accepted

## Context

The Vision board rendered every tile as a card in a 3-column grid on desktop.
That makes the Vision a mosaic of small cards — but a vision is something the
Owner *reads* to remember what it is all for, and a mosaic is a poor reading
surface. Everything was also editable all the time: drag handles and menus on
every tile compete with the reading.

The request: single-column, Notion-like stacking; a default view mode that
reads like an article; a separate edit mode for everything mutating.

## Decision

- The board renders **one column at the prose measure** (DESIGN.md's
  65–75ch for vision notes) on every breakpoint — no grid.
- **View mode is the default**: notes as prose paragraphs, images as figures
  with attribution captions, achievements as to-do checklist rows. No drag
  handles, no menus, no inline editing.
- Achievement ticking stays available in **view mode** — "it came true" is a
  reading moment (ADR 0037: achievements are ticked in place), not an
  editing one. It remains deliberately reversible.
- **Edit mode** (header toggle Edit ↔ Done) carries every mutating
  affordance: drag & drop, Move up/down, Delete, click-to-edit drafts,
  "+ Add", and the inline new-tile forms. The keyboard reorder path
  (menu items) lives there too.
- The tile list itself does not change: one flat order, all types mixed.
  View mode is a rendering of that order, not a re-structure — the export
  and the Path overview summary keep working off the same data.
- Notes lose the display clamp: an article reads in full, and a single
  column has no grid row to blow out.
- Archived Paths stay read-only in view mode with no Edit toggle.

## Impact

Specified in `docs/changes/vision-notion-document-modes.md`. `vision` module
only — no entity, storage, or route changes. ACTIONS.md, GLOSSARY.md and
`docs/modules/vision.md` are updated to the two-mode model; Storybook stories
gain an edit-mode variant and re-default to view mode.
