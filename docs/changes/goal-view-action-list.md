# Feature: Full Action list on the Goal view

## Type
Feature (planned by proto-feature)

## User goal
The Actions list on a Goal's own page should behave like every other Action
list in the app — the standard row vocabulary (complete, schedule, rename,
frog, move, delete) — and additionally let the Owner manage the *order* of
the Goal's Actions. A Goal is a sequence of steps; today the page renders a
dumb name-plus-frog list with no management and no ordering, while sub-Goals
on the very same page drag to reorder — an asymmetry the Owner feels
immediately.

## MVP scope
- The Goal progress page's Actions section is rebuilt on the shared row
  stack: `ActionRowItem` + `useActionRowActions()` (the exact mount the
  Actions view and a Path's Actions tab use), plus the "Show completed"
  toggle and the "All clear" line — the list vocabulary is identical
  everywhere.
- **Manual ordering within a Goal** (designer decision, 2026-09-08): a new
  optional `order` field on `Action`; rows get a drag grip (drop onto a
  sibling to reposition) and Move up / Move down in the row menu — the same
  pattern the Goal tree uses for its own reorder. `reorderAction` returns an
  Undo toast like every structural change.
- Aggregate views keep their automatic sort. `order` is read ONLY on the
  Goal page; the Actions view / Path Actions tab / Today continue sorting
  frog-first → scheduled → creation. Extending manual order to standalone
  groups or aggregate views is deferred.
- Read-only (archived Path) keeps the current simple list — no management,
  no reorder, no quick-add, per the established read-only convention.
- **Later (deferred)**: honoring `order` in the aggregate views; reorder for
  standalone Path Actions; drag-to-re-file between Goals from this page.

## Impact map
- **New module?**: no — one screen in `goals`, plus a field and a hook
  method in `capture-triage` (the Action owner) and optional props on
  `actions`' row component.
- **Modules affected**: `capture-triage` (Action type + `reorderAction` +
  order stamps on create/move); `actions` (`ActionRowItem` gains optional
  reorder affordances — backwards compatible, the Actions view passes
  nothing); `goals` (Goal progress Actions section rebuild).
- **Cross-module integration**: the Goal page mounts `actions`' row stack
  and writes through `capture-triage`'s hook — the same import direction it
  already uses for `QuickAddActionRow` / `createAction` (ADR 0041). Risk
  point: `order` semantics must stay invisible to views that don't read it —
  guaranteed by keeping the aggregate sort functions untouched.
- **Shared-doc additions**: ACTIONS.md (+Reorder Actions within a Goal,
  order note on create/move), ENTITY_MAP.md (Action flags: `order`),
  MODULES.md (goals Key Actions), docs/modules/goals.md, docs/modules/
  actions.md (row component note), docs/modules/goals-edgecases.md.

## Per-module changes

### capture-triage (owns `Action`)
- **Data**: `Action.order?: number` — manual position among a Goal's own
  Actions. Optional on purpose: legacy/mock rows without it stay valid and
  sort after sequenced ones by creation order (total comparator, no
  migration pass).
- **Actions**: new `reorderAction(id, toIndex): UndoFn` — snapshot, splice
  within the Goal's own Actions, renumber 0..n-1, return undo (mirrors
  `useGoals.reorderGoal`). `createAction` stamps `order` = end of the target
  group (quick-add appends); `moveActionToGoal` stamps `order` = end of the
  destination group (a moved-in Action lands last).
- **Screens & flows**: none — hook- and type-level only.
- **Edge cases**: reorder clamps out-of-range indexes and no-ops on
  self-drops; comparator handles order gaps after deletes.

### actions
- **Data**: none.
- **Actions**: none new — the row *gains affordances* for a reorder its
  caller owns.
- **Screens & flows**: `ActionRowItem` gets one optional `reorder` prop
  (index/siblingCount, drag handlers, move-up/down); when present the row
  shows a grip and the menu gains Move up / Move down. Absent → byte-for-byte
  current rendering everywhere else.
- **Edge cases**: grip must not start a drag from the checkbox/menu hit
  areas; menu items disabled at the ends.
- **Design**: none — reuses the designed row (ADR 0034) and the Goal tree's
  established drag/grip pattern (ADR 0026 family).

### goals
- **Data**: none (reads `order` through the comparator).
- **Actions**: row management (complete/un-complete, add-to-today, schedule,
  rename, frog, move-to, delete) via `useActionRowActions()`; reorder via
  `reorderAction` with an Undo toast; `actionsFor` now order-sorted.
- **Screens & flows**: the Actions section
  (`src/modules/goals/components/GoalProgressPage.tsx:189-…`) becomes:
  rows (`ActionRowItem` + `actionRowProps`), "Show completed" toggle,
  "All clear" line, quick-add row (existing), empty state (existing copy).
  Drag state lives on the page exactly like its sub-Goal reorder already
  does.
- **States**: "Show completed" toggle (hidden by default, rendered in place
  when shown); read-only archived keeps the simple list.
- **Edge cases**: settled rows hidden behind the toggle; single-Action list
  offers no move; Undo reverts any reorder; "All clear" when every row is
  settled and hidden; deleting an Action leaves order gaps (harmless).
- **Design**: none — vocabulary reused verbatim; no `proto-design` pass
  warranted.

## Routing — which proto skill builds what
No new screens, no new states beyond a toggle, no new visual vocabulary —
the routed detail → lofi → edgecases → harden loop is not warranted. All
residual direct edits, applied in order:

| Step | Skill | Target | What it does |
|------|-------|--------|--------------|
| 1 | (direct edit) | `capture-triage` | `order` field, comparator lib, `reorderAction`, create/move stamps |
| 2 | (direct edit) | `actions` | `ActionRowItem` optional `reorder` prop |
| 3 | (direct edit) | `goals` | Goal progress Actions section rebuild |
| 4 | (direct edit) | shared docs | ACTIONS.md, ENTITY_MAP.md, MODULES.md, module specs |

If scope grows (aggregate views honoring `order`, standalone reorder),
re-run `proto-feature` first.

## Residual — direct edits not covered by a proto skill
- **[`src/modules/capture-triage/types/action.ts`]**
  — now: no `order`. change to: `order?: number` with the semantics above.
- **[`src/modules/capture-triage/lib/` (new) `action-order.ts`]**
  — new tiny lib: `compareActionsByOrder` (order asc, missing order last by
  createdAt) + `nextOrderFor(actions, pathId, goalId)` (max sibling order +
  1). Shared by the hook and the goals module's `actionsFor` sort.
- **[`src/modules/capture-triage/hooks/use-actions.ts:330` (`createAction`)]**
  — now: no order. change to: stamp end-of-group order. why: quick-add
  appends, matching the Goals convention.
- **[`src/modules/capture-triage/hooks/use-actions.ts:378` (`moveActionToGoal`)]**
  — now: preserves everything but pathId/goalId. change to: also re-stamp
  `order` to the end of the destination group. why: a moved-in Action lands
  last, not at a stale position.
- **[`src/modules/capture-triage/hooks/use-actions.ts` (new `reorderAction`)]**
  — mirror `reorderGoal` (`use-goals.ts:161`): snapshot → clamp → splice
  within the Goal's own Actions → renumber → UndoFn. Exposed in the hook
  return.
- **[`src/modules/actions/components/ActionRowItem.tsx`]**
  — now: fixed prop set, grip only under an `ActionDndProvider`. change to:
  optional `reorder` prop adding grip + drag handlers + Move up/Move down
  menu entries; absent → unchanged.
- **[`src/modules/goals/hooks/use-goals.ts:268` (`actionsFor`)]**
  — now: unsorted filter. change to: sort with `compareActionsByOrder`.
- **[`src/modules/goals/components/GoalProgressPage.tsx:189-…` (Actions section)]**
  — now: dumb list + quick-add. change to: managed `ActionRowItem` list +
  Show completed + All clear + reorder drag + existing quick-add; archived
  Path keeps the simple read-only list.

## Later (deferred)
- `order` in aggregate views (Actions view, Path Actions tab, Today).
- Manual order for standalone Path Actions.
- Drag-to-re-file an Action to another Goal from the Goal page.

## Hand-off
Apply the residual edits in order, then commit. This doc is the base; no
other proto skill needs to run for the MVP.
