# Feature: Achieved Goals collapse at the end of the Path's Goals list

## Type
Feature (small — one module, no new entities/actions/states)

## Motivation

On the Path overview, `PathGoalsSection` listed every top-level Goal in one flat
priority-ordered list. Achieved Goals held their original slot with a full
interactive row, pushing the still-open work down the page. A finished Goal is
worth keeping for the record and the win balance, but not worth re-reading every
visit — "nie ma sensu trzymać takich achieved goals na widoku".

## Scope

`goals` module only. `abandoned` Goals are deliberately left in place — a
"stopped doing this" is still live context, unlike a finished item.

## Changes

### `src/modules/goals/hooks/use-goals.ts`
- `byOrder` → `byPriority`: `achieved` Goals sort below every `active` /
  `abandoned` sibling; manual `order` breaks ties within each group.
- Applied in `siblingsOf` (top-level Goals) and `childGoals` (sub-Goals).
  `reorderGoal` reads `siblingsOf`, so its index math stays consistent — an
  open Goal's move up/down still lands where expected; reordering never mixes
  the two groups.
- Sort is derived only. Stored `order` values are untouched — no migration.

### `src/modules/goals/components/PathGoalsSection.tsx`
- Split `topLevelGoals(pathId)` into `openGoals` (`state !== 'achieved'`) and
  `achievedGoals`.
- `openGoals` render in the existing `<ul>` (indices `0..n-1`, `siblingCount`
  = `openGoals.length`).
- `achievedGoals` render inside a disclosure: a chevron toggle button
  (`aria-expanded` / `aria-controls`) labelled "Achieved" with a count,
  **collapsed by default**, `useState` per mount. Rows use their real index in
  the full sibling list (`openGoals.length + j`) so `reorderGoal` stays correct.
- When `openGoals` is empty but achieved Goals exist: a one-line note
  ("Every Goal on this Path is achieved.") instead of the dashed
  "No Goals yet" empty state. That empty state now shows only when the Path
  has zero Goals total.

### Stories — `PathGoalsSection.stories.tsx`
- `WithAchievedGoals` (uses `MOCK_GOALS`; `path-sport` has one achieved Goal):
  play test asserts the achieved Goal is not in the DOM until the toggle is
  clicked, and the toggle starts `aria-expanded="false"`.
- `AllGoalsAchieved`: every top-level Goal achieved → fallback note + collapsed
  section.

## Edge cases

- **Achieved parent with active sub-Goals**: the whole subtree collapses with
  the parent. Acceptable — the sub-Goals are one click away, and an achieved
  parent implies the branch is done. Not worth special-casing.
- **Reorder near the boundary**: an open Goal dragged/moved "down" past the
  last open slot has no visible effect — `byPriority` re-sinks the achieved
  Goals. Harmless.
- **Archived (read-only) Path**: unchanged — rows are already non-interactive;
  the disclosure still works, still collapsed by default.

## Regression scope

- `topLevelGoals` / `childGoals` consumers get achieved-last ordering:
  `PathGoalsSection`, `GoalRow` (child rows), `GoalProgressPage` breadcrumbs.
  All display-only; no consumer depends on achieved Goals keeping a manual slot.
- `winlog` reads `goals` by `state`/`achievedOn`, not sibling order — unaffected.
- `reorderGoal`, `moveGoalToPath`, `createGoal` all use `siblingsOf`'s `maxOrder`
  — still correct (a new/moved Goal is `active`, lands after open Goals).

## Hand-off

**Done and verified.** `pnpm lint` clean, `tsc --noEmit` clean, `pnpm build`
clean, story test suite `118 passed`. ADR: `docs/adr/0046-achieved-goals-collapsed-on-path.md`.
