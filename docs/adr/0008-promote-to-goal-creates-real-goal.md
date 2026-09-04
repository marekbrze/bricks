# 0008 - Promote to Goal now creates a real Goal

**Date**: 2026-09-04
**Module**: goals (cross-cutting: capture-triage)
**Status**: Accepted

## Context

ADR 0004 decided that "Promote Action to Goal" discards the originating
Inbox `Action` once "the new Goal is created" — but at the time `goals`
didn't exist, so `capture-triage`'s `promoteAction` only ever discarded the
Action; no Goal was actually created anywhere (`capture-triage-edgecases.md`
gap #4/#11 tracked this explicitly, deferred until `goals` shipped).

`proto-lofi(goals)` builds `useGoals().createGoal`, so this gap is no longer
structural — the question is just whether `capture-triage` should now wire
up to it.

## Decision

`TriagePage.handlePromote` now calls `useGoals().createGoal(...)` for the
chosen Path (always top-level) before retiring the Inbox Action, and the
success toast says so plainly ("promoted to a new Goal under X") instead of
the softened "noted as a future Goal" copy from ADR 0004's hardening pass.
The `AssignPicker`'s Goal chips are now real Goals (via `useGoals`, tree-
flattened, active-only) instead of the static `MOCK_GOAL_OPTIONS` list, which
is deleted.

Undo is made symmetric: undoing a promotion both restores the Action to the
Inbox *and* deletes the Goal that was just created, so a changed mind leaves
no orphaned Goal behind.

One more decision falls out of Goals being real: `AssignPicker` only offers
`active` Goals (flattened, sub-Goals indented) — an already-`achieved` or
`abandoned` Goal isn't a real destination for a newly-triaged Action.

## Impact

- `src/modules/capture-triage/data/mock-goal-options.ts` deleted.
- `AssignPicker.tsx`, `TriagePage.tsx` now depend on `useGoals()`.
- `docs/modules/capture-triage-edgecases.md` gaps #4 and #11 marked
  superseded/closed.
- No entity or state changes — `Action`/`Goal` shapes are unchanged; this is
  a wiring decision, not a data-model one.
