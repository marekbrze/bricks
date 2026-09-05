# 0025 - Triage: "Create Goal" must not silently discard the Action

**Date**: 2026-09-05
**Module**: capture-triage
**Status**: Accepted

## Context

ADR 0024 folded Promote-to-Goal into the Goal search as a single "Create
Goal '…'" row: typing a name with no match and picking that row created a
Goal and **discarded** the originating Action (unchanged Promote semantics
from ADR 0004 — the idea "becomes" the Goal). In practice this reads as
"create a Goal for this Action", not "convert this Action into a Goal", and
an Owner who typed a name expecting the Action to end up *under* the new
Goal instead found the Action gone entirely — reported after triaging,
leaving mid-session, and coming back unable to find an item, only to
discover it had been promoted. The old, pre-0024 `PromoteToGoalDialog` had
the same discard behavior but its own screen and copy made that explicit;
folding it into a plain "Create Goal" row lost that signal.

## Decision

Split the single row into two, whenever the typed query has no exact match:

- **"Create Goal '…' and assign here"** — highlighted first (the default
  Enter target). Creates the Goal under the chosen Path and assigns the
  current Action to it via `assignAction`. The Action **survives** as a
  normal child of the new Goal. This is the common case an Owner reaches
  for when they type a Goal name that doesn't exist yet.
- **"Promote to Goal '…' instead"** — a second, visually secondary row right
  below it, with an explicit subtext ("This Action becomes the Goal — the
  Inbox item is retired"). Same `promoteAction` + discard semantics as
  before (ADR 0004) — kept, just no longer the only option and no longer
  the default.

`assignAction` (in `useActions`) now returns an `UndoFn`, matching
`promoteAction`/`discardAction`/`abandonAction`/`deleteAction` — every
outcome that can lose track of an Action (including a plain existing-Goal
assign, not just the new Create row) now gets an Undo toast, not just
Promote and Discard.

## Impact

- `AssignPicker` gained a third `onPromote` callback alongside
  `onAssignExisting` / `onCreateGoal` (renamed in intent: it now means
  "create and assign", not "create and discard").
- `TriagePage` gained `handleCreateGoalAndAssign` (new) alongside the
  existing `handleAssign`/`handlePromote`; `handleAssign` now surfaces an
  Undo toast too.
- `docs/modules/capture-triage.md` and `docs/ACTIONS.md` updated: the Goal
  search's two-row behavior, and Undo now covering plain Assign.
- No storage/entity shape changes — both rows produce a `Goal` +
  (assigned-or-discarded) `Action` via the same `createGoal`/`assignAction`/
  `promoteAction` primitives `goals`/`capture-triage` already exposed.
