# 0010 - Goals prototype hardened

**Date**: 2026-09-04
**Module**: goals
**Status**: Accepted

## Context

The module's prototype handled happy paths but not every edge case (see
`docs/modules/goals-edgecases.md`, 11 gaps from proto-edgecases).

## Decision

Implemented 8 of the 11 gaps:
- Archived-Path Goals now render read-only (restore banner + every
  mutation control hidden), matching `PathOverviewPage`'s Achievements
  section (#1).
- Both Goals routes now check `useActions().dataUnreadable` too, not just
  `paths`/`goals` (#2).
- `moveGoalToPath` (and the `useActions` helper it calls) now snapshot and
  return an `UndoFn`, wired into the Move toast (#4).
- Long Goal names clamp + wrap (`line-clamp-2 break-words`) instead of a
  bare `truncate`, matching `PathCard` (#5).
- Create and Edit dialogs now toast on success (#6, #7).
- Drag-over only allows the drop cursor when the hovered row shares the
  dragged Goal's Path + parent (#8).

Deferred, with a decision recorded rather than silently dropped:
- **#3** (achieve/abandon doesn't flag a Goal's own Actions) — left as-is;
  Actions don't render outside this Goal's own page yet (`today` isn't
  built), so there's nowhere else for a per-Action flag to matter. The
  Goal's own state badge is the signal for now. Revisit once `today` reads
  `goalId` off Actions.
- **#9** (no tree virtualization) and **#10** (no double-submit guard) —
  deferred, matching the same precedent already accepted in `paths` and
  `capture-triage`.
- **#11** (no confirm/nudge on Add-sub-Goal-under-a-closed-parent, or on
  achieving/abandoning a Goal with open children) — left frictionless on
  purpose, consistent with the "manual, not automatic" achieve/abandon
  philosophy from ADR 0007.

## Impact

The prototype now handles every flow path in this module, not just the
happy one. `docs/modules/goals.md` and `goals-edgecases.md` updated to
match. Visual polish is a separate future `proto-design`/`proto-polish`
pass.
