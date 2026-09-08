# Paths

## Vision

`Path` is the container the whole app hangs off — a never-ending life direction
(the sport path, the earnings path), not a project with an end. The `paths` module
owns two things: the **list of Paths** (the entry point to everything) and the
**Path overview** (the hub screen that pulls the Vision summary, Goals and the
win balance into one place). **Achievements** — the order-independent
"along the way" items ("I can do a pull-up", "muscle-up", "100 push-ups") —
moved into the Vision board as a tile type (ADR 0037); `paths` surfaces their
progress in its summaries but no longer owns them.

The mental model has to land here first: a Path is a direction, achievements
are things you'll be able to do one day (no concrete task required) and live
on the Vision board, Goals are the execution layer, Vision is the picture of
the future. Everything else in the app surfaces *through* the Path overview.

The list is a **card grid** — each card is a rich at-a-glance summary (name,
Goal and achievement counts, the Path's win line — small/big wins with counts,
a Vision snippet) so opening `/paths` already tells the Owner where their
energy is going.
Archived Paths are out of the way on their own screen; the main list is only
active directions.

## User Flows

### Create a Path

1. User is on `/paths` → clicks **New Path** (primary action, top of the screen).
2. A **single modal** opens: a name field, plus a dynamic list of achievement text
   rows with **+ add another** and a remove (✕) per row. The rows are a seed —
   on Create they land on the new Path's Vision board as achievement tiles
   (ADR 0037); the dialog itself writes no Vision data.
3. User types a name, fills one or more achievement rows (all optional except the
   name), clicks **Create**.
4. Modal closes → the new Path card appears at the **end** of the grid → user lands
   on (or the card links to) the new Path overview.
5. Empty achievement rows are ignored on submit. Submitting with an empty name is
   blocked (see Edge Cases).

### Browse Paths and open one

1. User opens `/paths` → sees the card grid of active Paths in manual order.
2. Each card shows: name, `N goals · X/Y achievements` (read from the Path's
   Vision achievement tiles), the Path's win line (`WinKindBadges` — small and
   big wins with counts, owned by `winlog`), a short Vision snippet (first
   note, truncated).
3. User clicks a card → **Path overview** (`/paths/:pathId`).

### Path overview (the hub)

1. User opens `/paths/:pathId` → contextual header with the Path name and a
   **back to Paths** affordance, plus an overflow menu (Rename, Archive, Delete).
2. Under the header sits the Path's **tab bar** — Overview · Actions · Vision —
   carried by those screens (ADR 0026; Goals tab removed, ADR 0043). They are
   separate routes, so back/forward and "open in a new tab" keep working.
3. Overview sections, top to bottom (ADR 0043):
   - **Vision summary** — a condensed read-only view of the Vision board (a few
     notes / thumbnails, an `X/Y achievements` progress line) + **Open Vision
     board** → `/paths/:pathId/vision` (owned by the `vision` module).
     Achievements live on that board (ADR 0037) — the summary reports them.
   - **Wins** — the per-Path win balance (`WinBalance`, owned by `winlog`,
     embedded here — small wins and big wins with counts, ADR 0039).
   - **Goals** — the full Goal tree, inline (`PathGoalsSection`, owned by
     `goals`): `GoalRow` list in manual priority order, drag-and-drop +
     keyboard reorder, per-row lifecycle menu, **New Goal**, empty state.
     Clicking a Goal row opens Goal progress
     (`/paths/:pathId/goals/:goalId`).
4. From here the user branches into `actions`, `vision`, Goal progress, or
   `winlog`; `paths` itself fully owns only the Path-level actions (rename,
   archive, delete, reorder).

### Path Actions tab

1. `/paths/:pathId/actions` — the Actions view, scoped to this one Path: its Goal
   groups in priority order (sub-Goals nested), the Path's standalone Actions,
   then closed Goals still holding open work.
2. Same components as `/actions` (`PathActionsBody`, `useGoalGroups`,
   `useActionRowActions`), so grouping, row menus, dialogs and the persisted
   collapse state are shared, not copied.
3. Actions drag between Goal groups and onto the Standalone block; the row menu's
   **Move to…** does the same from the keyboard and reaches every other Path.
   See docs/modules/actions.md for the full flow.
4. Header carries **Show completed** and **New goal**. An archived Path renders
   the tab read-only: no quick-add, no New goal, no dragging.

### Manage Achievements

(Removed from this module — ADR 0037. Achievements are Vision achievement
tiles now; see `docs/modules/vision.md`. The former overview checklist's
behaviors moved with it: reversible tick, inline edit, lightweight delete.)

### Reorder Paths

1. On `/paths`, each card has a **drag handle**.
2. User drags a card to a new position → the manual order updates and persists.
3. This order drives the sectioning in the Today view.
4. Keyboard-accessible alternative is required (WCAG 2.2 AAA) — move-up / move-down
   via the card's overflow menu or a roving control.

### Rename a Path

1. Path overview → overflow menu → **Rename** → inline edit or a small dialog with
   the current name prefilled → save.

### Archive / unarchive a Path

1. Path overview → overflow menu → **Archive** → a light confirm ("Archive
   “Sport”? Its contents are kept and you can restore it anytime.") → the Path
   leaves the active grid.
2. `/paths` shows a **View archived** link (footer of the list) → `/paths/archived`.
3. `/paths/archived` lists archived Paths (name + counts, muted) with an
   **Unarchive** action per row → the Path returns to the end of the active order.

### Delete a Path (cascade)

1. Path overview → overflow menu → **Delete** (also reachable from
   `/paths/archived`).
2. A **confirmation dialog with a summary** of exactly what will be destroyed:
   > Delete “Sport”? This permanently deletes: 1 Vision board, 5 Achievements,
   > 3 Goals, 12 Actions. This cannot be undone.
   > [Cancel] [Delete Path]
3. Confirm → the Path and everything under it (Vision, VisionNotes, VisionImages,
   Achievements, Goals, sub-Goals, Actions) is removed → user returns to `/paths`
   with a "“Sport” deleted" confirmation toast, focus on the page heading.
4. The dialog is an `AlertDialog` (no dismiss on outside click). Cascade counts
   for Goals / Actions / Vision tiles are **estimates** until those modules are
   built — the dialog says so; Achievement count is real.

## Screens (rough)

- **Paths list** (`/paths`): primary **New Path** button; responsive **card grid**
  of active Paths (name — clamped to 2 lines, `N goals · M achievements`, win
  line with small/big counts, Vision snippet, drag handle, overflow menu);
  **View archived** link at the end. Empty state when there are no Paths.
- **New Path modal**: name input + repeatable achievement rows (+ add another / ✕;
  on Create they seed the new Vision's achievement tiles), Cancel / Create. Name
  required (inline error). A dirty form asks to confirm before discarding on
  Cancel / Escape / backdrop.
- **Path overview** (`/paths/:pathId`): contextual header (name, back, overflow:
  Rename / Archive / Delete); the Path tab bar; stacked sections (ADR 0043) —
  Vision summary (+ open board; snippet, `X/Y achievements` line, thumbnails),
  **Wins** (per-Path win balance), **Goals** (the inline Goal tree,
  `PathGoalsSection`). Achievements live on the Vision
  board (ADR 0037) — the summary reports their progress. **Archived Paths render
  read-only**: a restore banner at the top; the Goals section drops its
  create / reorder / row-menu controls until unarchived.
- **Path Actions tab** (`/paths/:pathId/actions`): header (name, back, tab bar) →
  Show completed + New goal → this Path's Goal groups, standalone Actions, and
  closed Goals with open work, all draggable. An "Unassigned" fallback catches
  this Path's orphaned Actions. Read-only while archived.
- **Path tab bar** (`PathTabs`, on the Path screens): Overview · Actions ·
  Vision as plain links with `aria-current`; scrolls horizontally on narrow
  widths. (Goals tab removed — ADR 0043.)
- **Archived Paths** (`/paths/archived`): muted list of archived Paths with
  Unarchive / Delete per row; back to `/paths`. Empty state when nothing archived.
- **Delete confirmation** (`AlertDialog`): destructive cascade summary (real
  counts, achievements read from the Vision), Cancel / Delete Path.
- **Rename**: small dialog with the current name prefilled.
- **Data-unreadable recovery** (all three routes): shown instead of content when
  the stored `paths` value is corrupt — explains the data can’t be read (not that
  it’s empty) and offers a confirmed reset.
- **Storage-failure banner** (app shell, every screen): shown when a LocalStorage
  write fails or storage is blocked outright — edits stay in memory but won’t
  survive a reload.

## Actions

| Action | Description in this module | Entity | Notes |
|--------|---------------------------|--------|-------|
| Create Path | Single modal: name + optional achievement rows that seed the new Vision's achievement tiles | `Path` | Name required; empty rows dropped; the seed write goes through `useVision` (ADR 0037) |
| Rename Path | Overflow menu → inline / small dialog | `Path` | |
| Reorder Paths | Drag handle on cards + keyboard move-up/down fallback | `Path` | Drives Today view section order; each move shows an Undo toast |
| Archive Path | Overflow menu → immediate + Undo toast (restores exact prior state); contents kept | `Path` | Reversible; from the overview it also navigates back to `/paths` |
| Unarchive Path | From `/paths/archived` or the archived overview’s restore banner; returns to end of active order; confirmation toast | `Path` | |
| Delete Path | Overflow menu / archived list → `AlertDialog` with a cascade summary | `Path` | Cascades to the Vision (tiles and achievements included), Goals, Actions; confirmation toast, no undo |
| View Path overview | The hub screen: Vision summary (with achievement progress) + per-Path win balance + the inline Goal tree | `Path` | Vision / balance / Goal tree rendered by other modules (ADR 0043) |
| Open a Path tab | Overview / Actions / Vision from the Path tab bar | `Path` | Separate routes, `aria-current` marks the active one |
| View Path Actions | This Path's Goal groups + standalone Actions, in the Actions view's shape | `Action` | `/paths/:pathId/actions`; components shared with `actions` |
| Manage a Path's Actions | Schedule, complete, rename, move, delete, toggle frog, quick-add | `Action` | Rows/dialogs reused from `actions`; quick-add and dragging disabled while archived |

Achievement add/edit/tick/delete moved to the `vision` module (ADR 0037) —
see `docs/modules/vision.md`.

## Edge Cases

Systematically audited in `docs/modules/paths-edgecases.md` and hardened
(proto-harden, 2026-09-04). Decided behaviors:

- **No Paths at all**: `/paths` empty state explains the Path concept + a
  prominent **Create your first Path**.
- **Path with no achievements**: the Vision summary simply omits the
  achievements line; the board's own empty state invites the first add (the
  achievements checklist moved to `vision` — ADR 0037).
- **Path with no Goals / empty Vision**: each section renders its own placeholder
  and its "add / open" affordance; the overview never looks broken.
- **All achievements achieved**: the summary's `X/Y` line reads `Y/Y` — a quiet
  done signal; the fuller treatment lives on the board's tiles.
- **Create Path with empty name**: Create shows an inline error; never creates an
  unnamed Path. Empty achievement rows are dropped.
- **Unsaved input in the New Path modal**: a dirty form asks to confirm before
  discarding on Cancel / Escape / backdrop.
- **Duplicate Path name**: allowed (personal tool) — no uniqueness constraint.
- **Very long Path / achievement text**: card title clamps to 2 lines with
  `break-words`; the archived list truncates; the overview `<h1>` wraps.
- **Deleting / archiving the last active Path**: allowed; the grid drops to its
  empty state (archived Paths still reachable via the link).
- **Archive**: immediate + Undo toast that restores the exact prior state.
- **Delete**: `AlertDialog` with a cascade summary (real counts — achievements
  read from the Vision); confirmation toast; no undo (permanent).
- **Reorder**: each move shows an Undo toast; the drag handle and Move up/down
  are inert with only one Path.
- **Archived Path overview**: read-only — a restore banner, and the board (one
  tab over) disables editing — until unarchived.
- **LocalStorage write fails / blocked**: an app-wide banner (every screen);
  edits stay in memory for the session but won't survive a reload.
- **LocalStorage value corrupt**: a dedicated recovery screen on every Paths
  route — "we couldn't read your saved Paths" (distinct from the empty state) +
  a confirmed reset.
- **Deep-link to a deleted `:pathId`**: `PathNotFound` state with a way back.
- **Timezone**: achievement-tile dates and win-day keys use the
  local calendar date, not UTC.

Deferred (see `paths-edgecases.md` → Hardening status): input length limits (#13),
a touch-reorder discoverability hint (#14), an async double-submit guard (#17,
harmless while creation is synchronous), and an app-wide date-format convention
(#18).

## Integration Points

- **vision**: one `Vision` per Path. The overview embeds a read-only Vision
  summary (snippet, `X/Y achievements` progress, thumbnails) and links to
  `/paths/:pathId/vision`. Deleting the Path cascades the Vision and all its
  tiles, achievements included. Creating a Path seeds its achievement rows
  onto the new Vision through `useVision` (ADR 0037) — the `paths` hook never
  writes the `visions` key itself, and achievement counts on cards, the
  archived list and the delete dialog read back through `useVision`.
- **goals**: every `Goal` belongs to exactly one Path. The overview embeds the
  Path's Goal tree inline via `PathGoalsSection` (owned by `goals`, ADR 0043) —
  priority order, deadline countdowns, reorder, lifecycle menu, New Goal. A
  Goal row opens `/paths/:pathId/goals/:goalId` (Goal progress). Goals are
  created under a Path; deleting the Path cascades its Goals and their Actions.
- **winlog**: the per-Path `WinBalance` is embedded on the overview; the
  card grid shows the win line. Goal/Action completions under the Path feed
  it. (Achievement ticks never fed it despite earlier claims to the contrary —
  feeding them is deferred; see `docs/changes/achievements-as-vision-tiles.md`.)
- **today**: the Today view sections are grouped by Path and ordered by the manual
  Path order set here (drag-to-reorder).
- **capture-triage**: a triaged `Action` can be assigned standalone directly to a
  Path (no Goal); such Actions are scoped by the Path and cascade on delete.
  The overview's **Actions without a goal** section reads/writes through
  `useActions`, the same hook `capture-triage` owns.
- **actions**: the Path overview's standalone-Actions section reuses
  `ActionRowItem`, `QuickAddActionRow`, and `ScheduleActionDialog` from the
  `actions`/`today` modules rather than re-implementing row behavior.
- **app-shell**: `/paths` is nav item #2; the overview's nested routes
  (`/paths/:pathId/vision`, `/paths/:pathId/goals/:goalId`) are registered by
  those modules under the shell's router.
