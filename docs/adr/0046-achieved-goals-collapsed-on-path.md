# [0046] - Achieved Goals sink to the end and collapse on the Path overview

**Date**: 2026-09-10
**Status**: Accepted

## Context

The Goals section on the Path overview (`PathGoalsSection`, ADR 0043) rendered
every top-level Goal in one flat list in manual priority order, regardless of
lifecycle state. An achieved Goal kept its slot and its full row — drag handle,
overflow menu, Action count — sitting between the Goals still being worked on.
On a Path with a few finished Goals the open work was pushed down the page and
the list read as busier than it was. A finished Goal is history: worth keeping
for the record and the win, not worth scrolling past on every visit.

`abandoned` is a different case — a deliberate "not doing this" the user may
still want in sight — so it stays in place.

## Decision

Planned in `docs/changes/achieved-goals-collapsed-on-path.md`.

- **Sort**: the sibling sort in `useGoals` (`byPriority`, replacing `byOrder`)
  now sinks `achieved` Goals below every `active` / `abandoned` sibling,
  manual `order` breaking ties within each group. Applied to both top-level
  Goals (`topLevelGoals` / `siblingsOf`) and sub-Goals (`childGoals`), so
  `reorderGoal` — which reads the same helper — stays consistent and reorder
  math is unaffected.
- **Collapse**: `PathGoalsSection` splits the top-level list into open Goals
  (rendered as before) and achieved Goals, which move into a disclosure at the
  bottom — a chevron toggle labelled "Achieved" with a count, collapsed by
  default, session-only state per mount. Sub-Goals under an achieved parent
  collapse with it.
- **All-achieved Path**: when every top-level Goal is achieved the open list
  falls back to a one-line note ("Every Goal on this Path is achieved.") rather
  than the "No Goals yet" empty state, which now only shows when the Path truly
  has zero Goals.

No new entities, actions, or states. `GoalRow`, the lifecycle menu, and the
Goal progress page are untouched.

## Impact

Affects `goals` only — `useGoals` (`byPriority` sort), `PathGoalsSection`
(split + disclosure), and its stories (`WithAchievedGoals` with a play test,
`AllGoalsAchieved`). No migration: the sort is derived, stored `order` is left
as-is. `winlog` still reads achieved Goals for the win history, unchanged.
Docs updated: `docs/modules/goals.md`.
