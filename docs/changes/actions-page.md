# Feature: Actions Page

## Type
Feature (planned by proto-feature)

## User goal
See every Action in one flat, scannable list — grouped by Path, then Goal — like a
Todoist/Things task list, and add new Actions (to a Goal or standalone to a Path) and new
Goals right from that list, with an optional due date. Today is *what to do now*; this is
*everything that exists*, organized.

## MVP scope
Must work:
- `/actions` page as the **5th nav entry** (desktop top bar + mobile bottom tabs).
- List grouped **Path → Goal → Actions**: one section per active Path; within it, Actions
  grouped under each Goal (sub-Goals nested as sub-groups); after the Goal groups, the
  Path's standalone Actions; an **Inbox group pinned at the top** when the Inbox is non-empty.
- **Quick-add Action**: inline input under a Goal group (adds assigned to that Goal) and
  under the Path section (adds standalone), with an optional due date (Today / Tomorrow /
  pick a date) — stored as `scheduledDate`, shared with `today`.
- **Quick-create Goal** from a Path section (name + optional deadline) — top-level only;
  sub-Goals are still created in the `goals` module.
- Row interactions: complete / un-complete (checkbox, feeds WinLog), frog badge,
  overflow menu — schedule / unschedule (reuses the `ScheduleActionDialog` pattern),
  edit name, move between Goals/Paths is *not* in MVP (exists upstream).
- **Show completed** toggle: `done` and `abandoned` Actions hidden by default; when shown,
  they render in place within their groups (struck-through / dimmed).
- Deadline countdown chip on Goals that have one (reuses `goals/lib/deadline.ts`).

Deferred to "Later":
- Reordering (drag & drop / Move up-down) inside this view — priority order stays owned by
  the `goals` module; this view renders in existing order fields.
- Search / filters (by due date, by frog), Todoist-style "Today / Upcoming" smart lists.
- Outliner-style inline editing of the Goal tree (creating sub-Goals here).
- Bulk actions, multi-select.

## Impact map
- **New module?**: **yes — `actions`** (Core). It is a list/aggregation surface with its own
  quick-add flows; it doesn't fit `goals` (tree + lifecycle) or `today` (a single day).
- **Modules affected**: `app-shell` (5th nav slot + routes + UI-STRATEGY.md), `capture-triage`
  (no code change — remains owner of `useActions`; this module only consumes it),
  `scenarios` (full scenario gains data shaped for this view).
- **Cross-module integration**: read-side consumption of `useActions` + `useGoals` +
  `usePaths` (the established cross-module pattern — see `src/modules/today/components/TodayPage.tsx:7`).
  Writes go through the existing hooks only: `addAction`, `updateAction`, `addGoal`, `updateGoal`.
  No new entities, no storage migration — the riskiest point is only *rendering consistency*
  (a Goal whose state is `achieved`/`abandoned` still holding open Actions).
- **Shared-doc additions**: MODULES.md (+`actions` module entry, nav table update),
  ACTIONS.md (+Quick-add Action in list view, +Quick-create Goal from list view, +Open Actions view),
  UI-STRATEGY.md (4→5 nav entries, new route row), GLOSSARY.md (+`ActionsView` term, +`actions` module row),
  ENTITY_MAP.md (no entity changes — add a derived-view note).

## Per-module changes

### actions (new)
- **Data**: none stored — reads `Action`, `Goal`, `Path` via existing hooks. Derived
  grouping: Paths (active, nav order) → Goals tree (manual priority order) → Actions
  (creation order / existing field order); Inbox Actions (`state === 'inbox'`) at top;
  standalone Actions (`goalId === null`) after the Goal groups.
- **Actions**: Open Actions view; Quick-add Action (to Goal / standalone to Path, optional
  `scheduledDate`); Quick-create Goal (top-level, name + optional deadline); Complete /
  Un-complete Action; Schedule / Unschedule Action; Rename Action; Show/hide completed.
- **Screens & flows**: `/actions` single-page list. Header row: title + "Show completed"
  toggle. Inbox group (conditional). Sections per Path (nav order), each: Path name,
  quick-create Goal affordance, Goal groups (nested sub-Goals), standalone quick-add row.
  Nav entry: 5th item, label "Actions", icon `ListTodo` (lucide), route `/actions`,
  positioned after Today (daily-planning cluster: Today, Actions, Paths, Inbox, Log).
- **States**: empty app (no Paths) → guided empty state; Path with no Goals/actions →
  collapsed-ish section with quick-add; all done → "All clear" summary line per group;
  data unreadable → reuse the `*DataUnreadable` banner pattern; toggle visible only when
  there is anything hidden.
- **Edge cases**: Goal `achieved`/`abandoned` with open Actions (show group under a dimmed
  goal header); `goalId` pointing at a missing Goal (orphan — skip group, surface action in
  a fallback group); Path missing for a standalone Action (self-heal already in
  `useActions`); Inbox items keep "needs triage" hint, no quick-schedule from Inbox group
  (triage owns assignment); storage corruption (banner, reset); 5 tabs at 360 px width.
- **Design**: new surface → needs `proto-design`/`proto-polish` once DESIGN.md exists
  (no `docs/DESIGN.md` in the repo yet — lo-fi is the visual baseline for now).

### app-shell
- **Data**: none.
- **Actions**: Navigate to `/actions` from top bar / bottom tabs.
- **Screens & flows**: `NAV_ITEMS` gains the 5th entry; route registered in `App.tsx`.
- **States**: none new.
- **Edge cases**: mobile bottom tabs at 5 items — labels stay, tighten spacing.
- **Design**: no shell redesign.

### scenarios
- **Data**: `full` scenario seeds at least one Inbox Action, standalone Actions, sub-Goal
  actions, done/abandoned items and scheduled items so every group type renders.
- **Actions**: none.
- **Screens & flows**: none.
- **States**: none.
- **Edge cases**: covered by the module work above.

## Routing — which proto skill builds what
| Step | Skill | Target | What it does |
|------|-------|--------|--------------|
| 1 | proto-detail | `actions` | module spec + shared-doc entries (MODULES, ACTIONS, GLOSSARY, UI-STRATEGY, ENTITY_MAP note) |
| 2 | proto-lofi | `actions` | build `/actions` list page + wire the 5th nav slot + scenario data |
| 3 | proto-edgecases | `actions` | systematic stress-test of the list/quick-add flows |
| 4 | proto-harden | `actions` | implement the diagnosed states |
| 5 | (direct edits) | — | see residual below |
| 6 | proto-design → polish | `actions` | hi-fi, only after `docs/DESIGN.md` exists |

## Residual — direct edits not covered by a proto skill
Applied inside step 2 (`proto-lofi`), since they are small and mechanical:
- **`src/shared/navigation.ts:22-27`** — now: 4 `NAV_ITEMS`. change to: 5 items, insert
  `{ module: 'actions', label: 'Actions', path: '/actions', icon: ListTodo }` after Today.
  why: the feature's nav slot.
- **`src/App.tsx:1-33`** — now: module route imports + spread. change to: import
  `actionsRoutes` from `./modules/actions`, spread before the catch-all. why: route registration.
- **`docs/UI-STRATEGY.md`** — now: "Only 4 of the 6 design modules are top-level
  destinations". change to: 5 of 7, new row in the module navigation table. why: docs truth.
- **`src/scenarios/full.ts`** — now: no data shaped for grouped list rendering. change to:
  seed Inbox/standalone/sub-Goal/done/abandoned/scheduled Actions. why: every group state
  visible in the full scenario.

## Later (deferred)
- Reordering inside this view; search + smart lists (Today/Upcoming filters); outliner-style
  tree editing; bulk actions. Re-run proto-feature when any of these graduates.

## Hand-off
Run the routing steps in order. This doc is the base each skill reads.
