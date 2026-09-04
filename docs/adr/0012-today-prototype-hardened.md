# 0012 - Today prototype hardened

**Date**: 2026-09-04
**Module**: today
**Status**: Accepted

## Context

The `today` module's prototype handled happy paths but not edge cases (see
`docs/modules/today-edgecases.md`).

## Decision

Implemented 8 of the 11 audited gaps:
- Self-heal now clears `scheduledDate`/`completedAt` on an orphaned Action
  (#1), instead of leaving a stale day behind for a future re-triage to
  resurrect.
- The viewed day moved into the URL (`/today/:date`, validated with a
  today fallback) so a refresh or bookmark keeps day-nav position (#2).
- `abandonAction` now returns an `UndoFn`, wired into both toasts, matching
  `Unschedule`/`Discard` (#3).
- `AddToTodayDialog`'s empty state distinguishes "nothing anywhere" from
  "nothing for this Path" and points at the other Paths instead of always
  blaming the Inbox (#4).
- `Unschedule` is hidden on a completed (`done`) row — only `Move` remains
  — so a finished Action can't be silently pulled out of every day view
  (#5).
- `formatDayLabel` appends the year outside the current calendar year (#6).
- The "added to \[day\]" toast now carries an Undo action (#7).
- Each Path section's `Add` button got a Path-specific `aria-label` (#9).

Deferred: cross-midnight re-sync of the viewed date (#8), list
virtualization (#10), and a double-submit guard on the two date dialogs
(#11) — all explicitly low-priority/prototype-scale in the audit and
consistent with the same deferred classes already accepted in `goals` and
`capture-triage`.

## Impact

The prototype now handles every flow path in this module, not just the
happy one. Visual polish is a separate future `proto-design` pass.
