# 0018 - Vision prototype hardened

**Date**: 2026-09-04
**Module**: vision
**Status**: Accepted

## Context

The `vision` prototype handled its happy path but not the 10 gaps found in
`docs/modules/vision-edgecases.md`.

## Decision

Implemented 9 edge-case states, 1 documented as-is:

1. Added the upload size guard the module spec flagged: files above 1.5 MB
   are refused before reading, with a toast explaining the local-storage
   budget — one phone photo can no longer stop the whole app from
   persisting. Together with a file-type check (non-images refused) and a
   `reader.onerror` toast, the upload path now fails loudly instead of
   silently.
2. `deleteTile`/`reorderTile` return `null` when nothing changed; the
   "Moved" / "Tile deleted" toasts (and their Undo actions) fire only on a
   real change — no more lying toasts, and the toast doubles as a truthful
   screen-reader announcement (`Toaster` is `aria-live="polite"`).
3. `PathOverviewPage` checks `useVision().dataUnreadable` and routes to the
   same `VisionDataUnreadable` recovery screen as the board — a corrupt
   `visions` value is no longer disguised as an inviting empty state.
4. Note tiles clamp to six lines on the board; storage and click-to-edit
   keep the full text, so a pasted wall can't break the grid's rhythm.
5. A pick lock in the Unsplash dialog makes a double-activate add exactly
   one tile.
6. The export filename slug folds diacritics — "Życie" downloads as
   `zycie-vision.md`, not `ycie-vision.md`.
7. Single-click tile delete with Undo kept (no confirm dialog) — documented
   as the fragment-sized counterpart of Goal's typed dialog, to revisit only
   if user testing shows destructive misfires.

## Impact

- `src/modules/vision/` — `hooks/use-vision.ts` (`UndoFnOrNull`),
  `components/{VisionBoardPage,VisionTileCard,UnsplashSearchDialog}.tsx`,
  `lib/export-markdown.ts`; new stories: `VisionBoardPage.stories.tsx`,
  `UnsplashSearchDialog.stories.tsx`, `story-helpers.tsx`.
- `src/modules/paths/components/PathOverviewPage.tsx` — corrupt-`visions`
  recovery guard next to the existing corrupt-`paths` one.
- `docs/modules/vision-edgecases.md` — all 10 rows marked ✅ with file:line.
- `docs/modules/vision.md` — Edge Cases synced to the hardened behavior
  (upload guard is now real, not flagged).
- The prototype now handles every flow path on this module, not just the
  happy one. Visual polish is a separate future `proto-design` pass.
