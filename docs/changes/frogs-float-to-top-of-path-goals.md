# Frogs float to the top of the Path's Goal list

**Type**: proto-feature (extend `goals`)
**Date**: 2026-09-10

## Problem

On the Path overview, `PathGoalsSection` (ADR 0043) renders open Goals in pure
manual priority order. A Goal flagged a **frog** — the "eat the frog", do-this-
first marker that already propagates to its Actions — kept whatever slot its
manual `order` gave it, and its only visual tell was a small `text-frog` flame
tucked between the deadline and Action-count badges. On a Path with several
Goals the one that matters most could sit mid-list and read no louder than the
rest.

## Decision

Frog emphasis, no new entities / actions / states.

- **Sort** (`useGoals` → `byPriority`): a third band on top of the existing
  achieved-sink (ADR 0046). Order of bands: `active` + `frog` → everything
  else (`active` non-frog, `abandoned`) → `achieved`. Manual `order` breaks
  ties within each band. Same helper feeds `topLevelGoals` / `siblingsOf` /
  `childGoals`, so `reorderGoal` stays consistent and sub-Goal frogs float
  within their branch too.
- **Row** (`GoalRow`): when `goal.frog && goal.state === 'active'` the row gets
  `border-frog/70 bg-frog-soft ring-1 ring-frog/40` and the bare flame is
  replaced by a solid `bg-frog text-background` "Frog" pill. A frog Goal that
  is later achieved/abandoned falls back to the quiet flame and normal row.
- `PathGoalsSection` is unchanged — it already renders `openGoals` in sorted
  order, so frogs lead the list for free.

## Impact

`goals` only. Touches `use-goals.ts` (`byPriority`), `GoalRow.tsx` (frog
styling), `data/mock.ts` (`goal-pullup-program` given `order: 4` so it
demonstrably floats), and `PathGoalsSection.stories.tsx` (new
`FrogGoalFloatsToTop` play story). No migration — the sort is derived, stored
`order` untouched. Docs: `docs/modules/goals.md`, ADR 0047.
