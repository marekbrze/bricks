# [0047] - Frog Goals float to the top of the Path's Goal list and render loud

**Date**: 2026-09-10
**Status**: Accepted

## Context

`PathGoalsSection` (ADR 0043) rendered open Goals in pure manual priority
order. The **frog** flag — the do-this-first marker that already propagates to
a Goal's Actions — did not change a Goal's position, and showed only as a small
`text-frog` flame among the row's trailing badges. The single most important
Goal on a Path could sit mid-list and look like every other row.

## Decision

Planned in `docs/changes/frogs-float-to-top-of-path-goals.md`. Emphasis only —
no new entities, actions, or states.

- **Sort**: `useGoals`'s `byPriority` gains a band above the ADR 0046
  achieved-sink. Bands, top to bottom: `active` frogs → everything else
  (`active` non-frog + `abandoned`) → `achieved`. Manual `order` orders within
  each band. The shared sibling helper means top-level *and* sub-Goal frogs
  float within their group, and `reorderGoal` math is unaffected.
- **Row**: `GoalRow` tints the row (`border-frog/70 bg-frog-soft ring-1
  ring-frog/40`) and swaps the bare flame for a solid `bg-frog text-background`
  "Frog" pill, but only while the Goal is `active`. An achieved/abandoned Goal
  that still carries the flag reverts to the quiet flame and normal row.
- `PathGoalsSection` is untouched — it renders `openGoals` in sorted order, so
  frogs lead the list without a code change there.

## Impact

Affects `goals` only — `use-goals.ts` (`byPriority`), `GoalRow.tsx` (frog
styling), `data/mock.ts` (`goal-pullup-program` given `order: 4` to
demonstrate the float), and `PathGoalsSection.stories.tsx` (new
`FrogGoalFloatsToTop` play story). No migration: the sort is derived, stored
`order` is left as-is. Docs updated: `docs/modules/goals.md`.
