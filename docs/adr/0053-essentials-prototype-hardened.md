# 0053 - Essentials prototype hardened

**Date**: 2026-09-10
**Module**: essentials
**Status**: Accepted

## Context
The `essentials` prototype handled happy paths and the spec's named edge cases,
but the systematic audit (`docs/modules/essentials-edgecases.md`, ADR 0052)
found 12 gaps.

## Decision
Implemented 7, deferred 5.

**Closed:**
- **#1** `reorderEssential` returns `UndoFnOrNull` — `null` on any no-op — and
  `EssentialsPage` only toasts on a real change (the toast is also the SR
  announcement, so a dead Undo lied).
- **#2** `useActions`' Path-orphan self-heal now **deletes** orphaned `done`
  Actions that carry an `essentialId` instead of resurrecting them in the Inbox
  — a logged completion is history, not a to-do. The "moved back to the Inbox"
  toast counts only genuinely restored items. This is a small behavioural change
  to `capture-triage`'s self-heal, scoped to `essentialId`-tagged `done` rows;
  `ENTITY_MAP.md` and `docs/modules/essentials.md` updated to match.
- **#3** `EssentialRow`'s completion counter stacks under the deed name below
  the `sm` breakpoint (phone), inline on the right above it.
- **#4** `EssentialsSummary` count relabelled "N logs on this Path" (was
  "completed all-time") so it reads as a per-Path lens, not a duplicate of the
  win balance's small-win count (both still move on a log — ADR 0051).
- **#5** `title` tooltips on the clamped row name/detail.
- **#8** Reorder toast copy unified to `Moved "X"`.
- **#12** `break-words` on the Essentials-tab `<h1>`.
- Bonus: explicit `aria-label` on the row counter.

**Deferred:** #6 input-length limits (project-wide pending, paths #13), #7
per-render count recompute (prototype-scale fine; real-build concern), #9
Path-aware seed examples (→ proto-design), #10 rescheduling a logged Action
(harmless, self-correcting), #11 in-flight submit guard (creation synchronous,
paths #17).

## Impact
The `essentials` flows now handle every path, not just the happy one. `tsc` +
`eslint` + `npm run build` + 141 story tests green. Visual polish is the next
pass (`proto-design essentials` → `proto-polish essentials`). Re-run
`proto-edgecases essentials` for a fresh baseline if the prototype changes
further.
