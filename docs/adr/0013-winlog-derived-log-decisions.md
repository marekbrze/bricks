# 0013 - WinLog derived-log decisions: no stored ledger, click-through targets, Path filter

**Date**: 2026-09-04
**Module**: winlog
**Status**: Accepted

## Context

`proto-detail` for `winlog` needed to resolve the open question
`docs/MODULES.md` had carried forward from `proto-deepen` — whether `WinLog`
history survives deletion of the underlying Action — plus two behaviors the
interview surfaced as needed for the module to be buildable: where clicking
a Win row should navigate, and how the global Log page scopes to one Path.

## Decision

1. **No stored ledger — `winlog` stays a live derived read.** A Win is
   computed from current `Action.completedAt` / `Goal` achievement state,
   every render. Un-completing an Action, reactivating a Goal, or deleting
   either removes its Win immediately — there is no separate "it happened"
   record that survives the source being undone or deleted. Considered
   keeping an append-only ledger (a real history that survives undo/delete)
   but rejected it: it would introduce the module's only stored entity for a
   case nothing else in the app asks for (every other lifecycle change in
   `today`/`goals` is already reversible and expected to retract its
   downstream effects, e.g. un-completing an Action already reverses its Win
   per `docs/ACTIONS.md`).
2. **Win rows click through to their source, scoped by scope**: an
   Action-Win navigates to `/today/:date` using the Action's `completedAt`
   date (not wherever it's currently scheduled); a Goal-Win navigates to
   that Goal's progress page. Keeps the Log page a hub rather than a dead
   end.
3. **One Path filter control on the global Log page**, re-scoping both the
   graph and the chronological list together. Embedded graphs (Path
   overview, Goal progress) stay unfiltered since their page context already
   defines the scope.

## Impact

- `docs/MODULES.md`: the `WinLog`-history open question marked resolved in
  Open Strategic Questions.
- `docs/ACTIONS.md`: added "Filter WinLog by Path" to the WinLog /
  ContributionGraph table.
- `docs/modules/winlog.md` created, encoding all three decisions in the
  relevant flows and Edge Cases.
