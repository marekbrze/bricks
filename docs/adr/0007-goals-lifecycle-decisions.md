# 0007 - Goals lifecycle decisions: cascade delete, manual achieve, one-time frog propagation

**Date**: 2026-09-04
**Module**: goals
**Status**: Accepted

## Context

`proto-detail` for `goals` needed to resolve two items PROJECT.md/ACTIONS.md
had left open, plus one behavior the interview surfaced as ambiguous:

1. Deleting a Goal that has child Actions and/or sub-Goals — what happens to
   them? (`ACTIONS.md` flagged this explicitly.)
2. Achieving a Goal — automatic once all child Actions are done, or manual?
   (PROJECT.md Open Questions.)
3. Toggling a Goal's frog flag propagates to its Actions — does un-marking
   retract it, and does it apply to Actions added later?

## Decision

1. **Delete Goal cascades**, mirroring the existing `Path` delete pattern
   exactly: an `AlertDialog` with a cascade summary (sub-Goal + Action
   counts), no undo. Considered alternatives — re-parenting Actions/sub-Goals
   up to the Path, or blocking delete until the Goal is empty — were rejected
   for consistency with the one cascade pattern the app already teaches the
   Owner (Path delete) and to avoid a second, different mental model for
   "delete something with contents."
2. **Achieve is manual only**, matching how `Achievement` already works in
   `paths` — never automatic when all child Actions complete. Keeps the
   achieve/abandon lifecycle a deliberate Owner call across the whole app,
   not entity-specific.
3. **Frog propagation is one-time and one-directional**: marking a Goal a
   frog flags its *current* Actions once; unmarking the Goal does not
   retract those flags, and Actions added afterward aren't auto-flagged.
   Avoids a live, ongoing sync between Goal and Action frog state that would
   otherwise need its own edge-case handling every time an Action moves.

## Impact

- `docs/ACTIONS.md`: "Delete Goal" row updated from "decide what happens to
  its Actions" to the cascade behavior.
- `docs/PROJECT.md`: "Achieving a Goal" Open Question marked resolved.
- `docs/modules/goals.md` created, encoding all three decisions in the
  relevant flows and Edge Cases.
