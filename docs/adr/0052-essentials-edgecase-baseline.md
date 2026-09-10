# 0052 - Essentials edge-case baseline

**Date**: 2026-09-10
**Module**: essentials
**Status**: Accepted

## Context
The `essentials` prototype (proto-lofi, ADR 0051 + commit `260c3b4`) handled the
happy paths and the spec's named edge cases but had not been stress-tested
systematically.

## Decision
Audited into `docs/modules/essentials-edgecases.md`. 12 new gaps found: 🔴 0 ·
🟡 4 · 🟢 8.

Top priorities:
- **#1** A drag-reorder that resolves to the same position still fires a
  "Reordered · Undo" toast whose Undo is a no-op — `reorderEssential` should
  return `UndoFn | null` (like `vision`'s `reorderTile`) and the caller should
  only toast on a real change.
- **#2** Deleting a Path resurrects its logged Essential completions as Inbox
  items: `useActions`' orphan self-heal resets the `done` standalone Action to
  `inbox`. A completed deed should be cascade-deleted with the Path, not
  returned to the Inbox.
- **#3** `EssentialRow`'s action cluster is too tight at ~360 px — the counter
  and buttons crowd out the deed name on a phone.
- **#4** The Path overview shows a logged deed twice (Wins small-win +1 and
  "Essentials · N completed") — deliberate (ADR 0051) but reads as a
  double-count bug; needs a copy fix.

## Impact
proto-harden implements the priority list (#1–#4), then folds #5–#12 into
proto-design / proto-polish or the project-wide input-length pass. Re-run
proto-edgecases after the prototype changes for a fresh baseline.
