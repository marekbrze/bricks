# Feature: Add Action from the Goal view

## Type
Feature (planned by proto-feature)

## User goal
The Owner standing on a Goal's own page wants to add an Action to that Goal
right there. Today the page only lists the Goal's Actions read-only and the
empty state defers to Inbox triage — the only real add paths are the Actions
view's quick-add rows or triage, both of which require navigating elsewhere
first.

## MVP scope
- The **Actions section of the Goal progress page**
  (`/paths/:pathId/goals/:goalId`) gains the same inline quick-add row the
  Actions view uses: type a name, optionally pick a due date, press
  Enter / Add. The input keeps focus so several Actions can be typed in a
  row.
- The row is hidden while the owning Path is archived (read-only), matching
  every other mutation control on the page.
- The created Action appears immediately in the page's own list, the
  cumulative count, and the embedded win balance — all already reactive.
- **Later (deferred)**: making the listed rows interactive (complete,
  schedule, rename, move from this page); an add entry in the Goal tree's
  row overflow menu; a standalone "add" affordance on sub-Goal rows (each
  sub-Goal already has its own progress page, which gets the row for free).

## Impact map
- **New module?**: no — extends `goals`' Goal progress screen.
- **Modules affected**: `goals` (screen change + spec docs); `actions`
  (no code change — its `QuickAddActionRow` gains a second consumer);
  `capture-triage` (no code change — `useActions().createAction` already
  creates assigned Actions).
- **Cross-module integration**: `goals` renders a component owned by
  `actions` and writes through a hook owned by `capture-triage`. Import
  direction is precedented — `GoalProgressPage` already imports from
  `winlog`, `capture-triage`, and `paths`. This is the riskiest point of the
  plan and it is low-risk.
- **Shared-doc additions**: ACTIONS.md (+1 Action row), MODULES.md (goals
  Key Actions + Connects-to), docs/modules/goals.md (flow, screens, actions
  table), docs/modules/goals-edgecases.md (empty-state behavior note).

## Per-module changes

### goals
- **Data**: none — no new entities or fields. A new `Action` is written
  through `useActions().createAction` with `goalId` set; `Goal` untouched.
- **Actions**: new surface for an existing action — "Create Action under
  Goal" becomes reachable from the Goal progress page, not only the Actions
  view and triage.
- **Screens & flows**: the Actions section
  (`src/modules/goals/components/GoalProgressPage.tsx:189-211`) gains a
  `QuickAddActionRow` below the list / empty state, wired
  `createAction({ name, pathId: goal.pathId, goalId: goal.id, scheduledDate })`
  — the exact wiring `GoalGroup` uses
  (`src/modules/actions/hooks/use-goal-groups.tsx:96-98`). Empty-state copy
  changes from "triage one in from the Inbox" to point at the row first.
- **States**: no new screen states. Read-only (archived Path) hides the row
  — covered by the existing `ArchivedPathReadOnly` story.
- **Edge cases**: empty/whitespace name is a no-op (guarded in
  `createAction`, `src/modules/capture-triage/hooks/use-actions.ts:330-350`,
  and the disabled Add button); adding an Action to a frog Goal does **not**
  flag the new Action — the one-time propagation stance already documented
  (docs/modules/goals.md:83) — and the empty-list state now coexists with an
  add affordance.
- **Design**: none — the row is the exact component the `actions` module
  already designed against DESIGN.md (ADR 0034). Vocabulary reused verbatim,
  so no `proto-design` pass is warranted.

### actions
- No code change. Docs note that `QuickAddActionRow` is no longer exclusive
  to this module's view.

## Routing — which proto skill builds what
No new screens, no new states, no new visual vocabulary: the routed
detail → lofi → edgecases → harden loop is not warranted. The whole feature
is a small, precise extension of an existing screen reusing an existing,
already-designed component — so it routes entirely to residual direct
edits, applied in this order:

| Step | Skill | Target | What it does |
|------|-------|--------|--------------|
| 1 | (direct edit) | `GoalProgressPage.tsx` | render + wire the quick-add row (see residual) |
| 2 | (direct edit) | shared docs | ACTIONS.md, MODULES.md, goals spec + edgecases |
| 3 | (direct edit) | `GoalProgressPage.stories.tsx` | confirm all stories still render; add-row visible except archived |

If the scope later grows interactive rows or a tree-page add entry, re-run
`proto-feature`, then route those through `proto-detail(goals)`.

## Residual — direct edits not covered by a proto skill
- **[`src/modules/goals/components/GoalProgressPage.tsx:43`]**
  — now: `useActions()` destructures only `dataUnreadable` / `resetActions`.
  change to: also destructure `createAction`. why: the write-through hook for
  the new row.
- **[`src/modules/goals/components/GoalProgressPage.tsx:189-211`]**
  — now: Actions section renders a read-only list or a dead-end empty state.
  change to: render `QuickAddActionRow` (imported from
  `@/modules/actions/components/QuickAddActionRow`) below the list / empty
  state when `!readOnly`, `label={\`Add action to “${goal.name}”\`}`, onCreate
  → `createAction({ name, pathId: goal.pathId, goalId: goal.id, scheduledDate })`.
  why: the feature itself.
- **[`src/modules/goals/components/GoalProgressPage.tsx:194-196`]**
  — now: empty state reads "No Actions assigned directly to this Goal yet —
  triage one in from the Inbox." change to: point at the add row first, keep
  triage as the second path. why: the copy's old advice was the workaround
  for this missing feature.

## Later (deferred)
- Interactive Action rows on the Goal progress page (complete, schedule,
  rename, move) — today the list is name + frog only.
- "Add action" in the Goal tree page's row overflow menu.
- Quick-add under a sub-Goal row on the parent's page.

## Hand-off
Apply the residual edits in order, then commit. This doc is the base;
no other proto skill needs to run for the MVP.
