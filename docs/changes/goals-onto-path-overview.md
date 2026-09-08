# Feature: Goals list on the Path overview

## Type
Feature (planned by proto-feature)

## User goal
Opening a Path should show everything about it on one screen — the Vision, the
numbers, and the Goal list — without a "Goals" tab in between. The separate
Goals tab is one click that buys nothing.

## MVP scope
The Path overview (`/paths/:pathId`) renders three stacked sections, top to
bottom:

1. **Vision** — the existing `VisionSummaryCard` (unchanged).
2. **Stats** — the Path's numbers: Goal count, achieved-Goal count, Action
   count, and the per-Path `WinBalance` (small / big wins). Replaces the old
   "Goals and Actions" stub blurb + standalone "Wins" section.
3. **Goals** — the full Goal tree that used to live on `/paths/:pathId/goals`:
   `GoalRow` list in manual priority order, drag-and-drop + keyboard reorder,
   per-row lifecycle menu (edit / add sub-Goal / move / achieve / abandon /
   delete), the "New Goal" action, and the empty state.

The **Goals tab is removed** from `PathTabs`; `/paths/:pathId/goals` (the tree
route) is deleted. `GoalProgressPage` (`/paths/:pathId/goals/:goalId`) stays —
it is reached by clicking a Goal row on the overview, and its "back" target
becomes the Path overview.

Tabs after this change: **Overview · Actions · Vision**.

Deferred: nothing. This is a self-contained IA move.

## Impact map
- **New module?**: no — extends `paths` and `goals`.
- **Modules affected**:
  - `goals` — the tree page becomes an embeddable section owned by `goals`
    (`PathGoalsSection`), mirroring how `vision` owns `VisionSummaryCard`.
    `GoalTreePage` is deleted; `GoalProgressPage` + `GoalNotFound` back-links
    repoint to the Path overview.
  - `paths` — `PathOverviewPage` re-composed into Vision / Stats / Goals;
    `PathTabs` loses the Goals entry; `paths/index.tsx` route doc updated.
- **Cross-module integration**: `paths` overview embeds a `goals`-owned
  section (new component `PathGoalsSection`). Same pattern already used for
  `VisionSummaryCard` — low risk. The section reads `useGoals` / `useActions`
  and mounts the Goal dialogs itself.
- **Shared-doc additions**:
  - `ACTIONS.md` — no new actions; "View the Goal tree for a Path" and
    "Open a Path tab" descriptions change (tree is now a section, tab is gone).
  - `ENTITY_MAP.md` — no change.
  - `GLOSSARY.md` — no change.
  - `UI-STRATEGY.md` — `goals` is no longer a sub-navigation destination; it is
    a section on the Path overview. `vision` stays a sub-nav destination.

## Per-module changes

### goals
- **Data**: none.
- **Actions**: none added. "View the Goal tree" is no longer its own route —
  the tree renders inline on the Path overview.
- **Screens & flows**:
  - **New** `src/modules/goals/components/PathGoalsSection.tsx` — props
    `{ pathId: string; readOnly: boolean }`. Contains everything from
    `GoalTreePage`'s body: the `topLevelGoals` list, `GoalRow` recursion, drag
    state, reorder / set-state / row-action handlers, and the create / edit /
    move / delete `GoalDialog` + `MoveGoalDialog` + `DeleteGoalDialog` mounts.
    Renders its own `<section aria-labelledby>` with an `<h2>` "Goals" and the
    "New Goal" button in the section header (hidden when `readOnly`).
  - **Deleted** `GoalTreePage.tsx` + `GoalTreePage.stories.tsx`.
  - `GoalProgressPage.tsx` — back-link `/paths/:pathId/goals` → `/paths/:pathId`
    (label becomes the Path name); the self-delete `navigate('/paths/:pathId/goals')`
    → `navigate('/paths/:pathId')`. The move-self navigation keeps targeting the
    Goal progress route (`/paths/:newPathId/goals/:goalId`) — unchanged.
  - `GoalNotFound.tsx` — link `/paths/:pathId/goals` → `/paths/:pathId`,
    label "Back to Path".
  - `goals/index.tsx` — drop the `goals-tree` route + `GoalTreePage` import;
    update the header comment.
- **States**: the section keeps `GoalTreePage`'s empty state (no Goals yet) and
  the archived-Path read-only rendering. The corrupt-`goals` / corrupt-`actions`
  recovery screens move to `PathOverviewPage` (it already renders the Paths and
  Vision recovery screens; add the Goals + Actions ones).
- **Edge cases**: unchanged set — empty tree, single Goal (reorder inert),
  archived Path read-only, corrupt `goals`, corrupt `actions`, deep-link to a
  deleted Goal. All already hardened; they follow the component to its new home.
- **Design**: `PathGoalsSection` reuses the existing `GoalRow` visuals. The
  section header matches the other overview sections (`text-sm font-semibold`
  `<h2>`, optional action on the right).

### paths
- **Data**: none.
- **Actions**: "Open a Path tab" now lists Overview · Actions · Vision.
- **Screens & flows**:
  - `PathOverviewPage.tsx` — section order becomes **Vision → Stats → Goals**:
    - keep `<VisionSummaryCard pathId={path.id} />`.
    - **Stats section** (new, inline): `<h2>` "Stats"; a small figure row —
      Goals (`goalCountForPath`), Achieved (count of this Path's Goals in
      `state === 'achieved'`), Actions (`actionCountForPath`) — then
      `<WinBalance size="sm" counts={winKindCounts(winsForPath(path.id))} />`.
      Removes the `ModuleStubSection` "Goals and Actions" blurb and the old
      standalone "Wins" `<section>`.
    - `<PathGoalsSection pathId={path.id} readOnly={readOnly} />`.
    - Add the Goals + Actions data-unreadable recovery screens (via `useGoals`
      / `useActions` `dataUnreadable`), matching the existing Paths / Vision
      guards.
  - `PathTabs.tsx` — remove the `{ to: '/goals', label: 'Goals', ... }` entry
    and the `Target` import; update the file comment.
  - `paths/index.tsx` — update the routing comment (no more
    `/paths/:pathId/goals`).
  - `PathActionsPage.tsx` — no logic change; it still renders `PathTabs`, which
    now has one fewer tab.
- **States**: Stats section always renders (honest zeros, like `WinBalance`).
- **Edge cases**: archived Path — the Goals section renders read-only via the
  `readOnly` prop; the restore banner stays at the top of the overview.
- **Design**: three sections share one heading rhythm. `DESIGN.md` bordered-
  surface rule (bg-card) already satisfied by `GoalRow` / `WinBalance` /
  `VisionSummaryCard`; the Stats figure tiles sit on `bg-card`.

## Routing — which proto skill builds what
| Step | Skill | Target | What it does |
|------|-------|--------|--------------|
| 1 | (direct edit) | goals | extract `PathGoalsSection` from `GoalTreePage`; delete the page; repoint `GoalProgressPage` / `GoalNotFound` back-links; trim `goals/index.tsx` |
| 2 | (direct edit) | paths | re-compose `PathOverviewPage` (Vision / Stats / Goals); drop the Goals tab from `PathTabs`; add Goals + Actions recovery guards |
| 3 | (direct edit) | stories | delete `GoalTreePage.stories`; add `PathGoalsSection.stories`; extend `PathOverviewPage.stories` to seed `goals` + `actions` |
| 4 | (direct edit) | docs | `paths.md`, `goals.md`, `UI-STRATEGY.md`, `MODULES.md`, ADR 0043 |

No new screens, no new entities, no new states → `proto-lofi` / `proto-edgecases`
/ `proto-harden` are not needed. All work is direct edits on existing,
already-hardened components.

## Residual — direct edits not covered by a proto skill
- **`src/modules/goals/components/GoalTreePage.tsx`** — delete. Body moves to
  the new `PathGoalsSection.tsx` (drop the page header, back-link, and
  `PathTabs`; keep everything from the read-only banner's data down; swap the
  `<div className="flex flex-col gap-6">` wrapper for a `<section>`).
- **`src/modules/goals/components/PathGoalsSection.tsx`** — new. See the goals
  per-module changes above for the prop shape and contents.
- **`src/modules/goals/index.tsx:15`** — remove
  `<Route key="goals-tree" path="/paths/:pathId/goals" element={<GoalTreePage />} />`
  and the import; keep `goals-progress`.
- **`src/modules/goals/components/GoalProgressPage.tsx:143`** — `to={`/paths/${path.id}/goals`}`
  → `to={`/paths/${path.id}`}`; the label (line 146) `Goals` → `{path.name}`.
- **`src/modules/goals/components/GoalProgressPage.tsx:402`** —
  `navigate(`/paths/${pathId}/goals`)` → `navigate(`/paths/${pathId}`)`.
- **`src/modules/goals/components/GoalNotFound.tsx:15`** — `to={`/paths/${pathId}/goals`}`
  → `to={`/paths/${pathId}`}`; text "Back to Goals" → "Back to Path".
- **`src/modules/paths/components/PathTabs.tsx:18`** — remove the Goals tab
  entry; drop the now-unused `Target` import; update the doc comment.
- **`src/modules/paths/components/PathOverviewPage.tsx`** — re-compose as
  Vision / Stats / Goals; add `useGoals` + `useActions` `dataUnreadable`
  guards; remove `ModuleStubSection` usage (and the file if nothing else uses
  it — `PathActionsPage` does not; check `git grep`).
- **`src/modules/paths/index.tsx:12-18`** — update the routing comment.

## Later (deferred)
- None.

## Hand-off
Run the routing steps in order. This doc is the base each step reads.
