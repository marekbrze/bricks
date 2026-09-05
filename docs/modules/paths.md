# Paths

## Vision

`Path` is the container the whole app hangs off — a never-ending life direction
(the sport path, the earnings path), not a project with an end. The `paths` module
owns three things: the **list of Paths** (the entry point to everything), the
**Path overview** (the hub screen that pulls Vision, Goals, Achievements and the
contribution graph into one place), and **Achievements** — the order-independent
"along the way" items ("I can do a pull-up", "muscle-up", "100 push-ups") that
hang directly off a Path and are not tasks.

The mental model has to land here first: a Path is a direction, Achievements are
things you'll be able to do one day (no concrete task required), Goals are the
execution layer, Vision is the picture of the future. Everything else in the app
surfaces *through* the Path overview.

The list is a **card grid** — each card is a rich at-a-glance summary (name, Goal
and Achievement counts, a mini contribution graph, a Vision snippet) so opening
`/paths` already tells the Owner where their energy is going. Archived Paths are
out of the way on their own screen; the main list is only active directions.

## User Flows

### Create a Path

1. User is on `/paths` → clicks **New Path** (primary action, top of the screen).
2. A **single modal** opens: a name field, plus a dynamic list of Achievement text
   rows with **+ add another** and a remove (✕) per row. Vision is not touched here.
3. User types a name, fills one or more Achievement rows (all optional except the
   name), clicks **Create**.
4. Modal closes → the new Path card appears at the **end** of the grid → user lands
   on (or the card links to) the new Path overview.
5. Empty Achievement rows are ignored on submit. Submitting with an empty name is
   blocked (see Edge Cases).

### Browse Paths and open one

1. User opens `/paths` → sees the card grid of active Paths in manual order.
2. Each card shows: name, `N goals · M achievements`, a mini `ContributionGraph`
   for that Path, a short Vision snippet (first note, truncated).
3. User clicks a card → **Path overview** (`/paths/:pathId`).

### Path overview (the hub)

1. User opens `/paths/:pathId` → contextual header with the Path name and a
   **back to Paths** affordance, plus an overflow menu (Rename, Archive, Delete).
2. Under the header sits the Path's **tab bar** — Overview · Actions · Goals ·
   Vision — carried by every one of those four screens (ADR 0026). They are
   separate routes, so back/forward and "open in a new tab" keep working.
3. Overview sections, top to bottom:
   - **Vision summary** — a condensed read-only view of the Vision board (a few
     notes / thumbnails) + **Open Vision board** → `/paths/:pathId/vision`
     (owned by the `vision` module).
   - **Goals and Actions** — counts plus **Open Actions** →
     `/paths/:pathId/actions`. The overview stays a summary; the work itself
     lives on that tab.
   - **Achievements** — checklist with an `X/Y achieved` counter (see flow below).
   - **Contribution graph** — the full per-Path `ContributionGraph` (owned by the
     `winlog` module, embedded here).
4. From here the user branches into `actions`, `vision`, `goals`, or `winlog`;
   `paths` itself only fully owns the Achievements section and the Path-level
   actions.

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

1. On the Path overview, the **Achievements** section shows a checklist:
   header `Achievements · 3/8 achieved`, then the items.
2. **Add**: an inline **+ add achievement** row at the bottom — type text, Enter /
   blur commits, stays in `open` state.
3. **Edit**: click the item text → it becomes editable inline → Enter / blur saves.
4. **Mark achieved**: tick the checkbox → state `achieved`, today's date is
   stamped and shown next to the item; it feeds `WinLog` / `ContributionGraph`.
5. **Un-mark**: untick → back to `open`, the date is cleared (mistakes happen —
   this is deliberately reversible).
6. **Delete**: a remove control on the row (hover / focus) → item is gone
   immediately (lightweight; no cascade, no heavy confirm — see Edge Cases).
7. Order is not meaningful — Achievements are order-independent. New items append.

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
  of active Paths (name — clamped to 2 lines, `N goals · M achievements`, mini
  contribution graph, Vision snippet, drag handle, overflow menu); **View
  archived** link at the end. Empty state when there are no Paths.
- **New Path modal**: name input + repeatable Achievement rows (+ add another / ✕),
  Cancel / Create. Name required (inline error). A dirty form asks to confirm
  before discarding on Cancel / Escape / backdrop.
- **Path overview** (`/paths/:pathId`): contextual header (name, back, overflow:
  Rename / Archive / Delete); the Path tab bar; stacked sections — Vision summary
  (+ open board), **Goals and Actions** summary (+ open Actions), Achievements
  checklist (inline add/edit/check/delete, `X/Y achieved` header with a done
  treatment at `Y/Y`), per-Path contribution graph. **Archived Paths render
  read-only**: a restore banner at the top, and the Achievements section disables
  editing until unarchived.
- **Path Actions tab** (`/paths/:pathId/actions`): header (name, back, tab bar) →
  Show completed + New goal → this Path's Goal groups, standalone Actions, and
  closed Goals with open work, all draggable. An "Unassigned" fallback catches
  this Path's orphaned Actions. Read-only while archived.
- **Path tab bar** (`PathTabs`, on all four Path screens): Overview · Actions ·
  Goals · Vision as plain links with `aria-current`; scrolls horizontally on
  narrow widths.
- **Archived Paths** (`/paths/archived`): muted list of archived Paths with
  Unarchive / Delete per row; back to `/paths`. Empty state when nothing archived.
- **Delete confirmation** (`AlertDialog`): destructive cascade summary (counts
  flagged as estimates), Cancel / Delete Path.
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
| Create Path | Single modal: name + initial Achievement rows; Vision untouched | `Path` | Name required; empty Achievement rows dropped |
| Rename Path | Overflow menu → inline / small dialog | `Path` | |
| Add Achievements on create | Repeatable rows in the New Path modal | `Achievement` | Seeded in `open` state |
| Reorder Paths | Drag handle on cards + keyboard move-up/down fallback | `Path` | Drives Today view section order; each move shows an Undo toast |
| Archive Path | Overflow menu → immediate + Undo toast (restores exact prior state); contents kept | `Path` | Reversible; from the overview it also navigates back to `/paths` |
| Unarchive Path | From `/paths/archived` or the archived overview’s restore banner; returns to end of active order; confirmation toast | `Path` | |
| Delete Path | Overflow menu / archived list → `AlertDialog` with a cascade summary (estimated counts) | `Path` | Cascades to Vision, Achievements, Goals, Actions; confirmation toast, no undo |
| View Path overview | The hub screen: Vision summary + Goals/Actions summary + Achievements + graph | `Path` | Vision / graph rendered by other modules |
| Open a Path tab | Overview / Actions / Goals / Vision from the Path tab bar | `Path` | Separate routes, `aria-current` marks the active one |
| View Path Actions | This Path's Goal groups + standalone Actions, in the Actions view's shape | `Action` | `/paths/:pathId/actions`; components shared with `actions` |
| Manage a Path's Actions | Schedule, complete, rename, move, delete, toggle frog, quick-add | `Action` | Rows/dialogs reused from `actions`; quick-add and dragging disabled while archived |
| Add Achievement | Inline **+ add achievement** row on the overview | `Achievement` | Appends; order not meaningful |
| Edit Achievement | Click text → inline edit | `Achievement` | |
| Mark achieved | Tick checkbox → `achieved` + local date | `Achievement` | Feeds `WinLog` / `ContributionGraph`; re-ticking keeps the original date |
| Un-mark achieved | Untick → `open`, date cleared | `Achievement` | Deliberately reversible |
| Delete Achievement | Row remove control | `Achievement` | Lightweight, no heavy confirm |

No new actions, entities, or glossary terms were discovered in this interview —
everything maps to existing `docs/ACTIONS.md` and `docs/ENTITY_MAP.md`.

## Edge Cases

Systematically audited in `docs/modules/paths-edgecases.md` and hardened
(proto-harden, 2026-09-04). Decided behaviors:

- **No Paths at all**: `/paths` empty state explains the Path concept + a
  prominent **Create your first Path**.
- **Path with no Achievements**: the Achievements section shows its own empty
  state with the inline add row still present; the counter is hidden at `0`.
- **Path with no Goals / empty Vision**: each section renders its own placeholder
  and its "add / open" affordance; the overview never looks broken.
- **All Achievements achieved**: the `Y/Y achieved` counter gets a check icon and
  full-strength colour — a quiet done treatment, non-blocking.
- **Create Path with empty name**: Create shows an inline error; never creates an
  unnamed Path. Empty Achievement rows are dropped.
- **Unsaved input in the New Path modal**: a dirty form asks to confirm before
  discarding on Cancel / Escape / backdrop.
- **Duplicate Path name**: allowed (personal tool) — no uniqueness constraint.
- **Very long Path / Achievement text**: card title clamps to 2 lines with
  `break-words`; the archived list truncates; the overview `<h1>` wraps.
- **Deleting / archiving the last active Path**: allowed; the grid drops to its
  empty state (archived Paths still reachable via the link).
- **Archive**: immediate + Undo toast that restores the exact prior state.
- **Delete**: `AlertDialog` with an estimated cascade summary; confirmation
  toast; no undo (permanent).
- **Reorder**: each move shows an Undo toast; the drag handle and Move up/down
  are inert with only one Path.
- **Un-mark then re-mark an Achievement**: the original `achievedOn` is kept, not
  overwritten with today.
- **Archived Path overview**: read-only — a restore banner plus a disabled
  Achievements section — until unarchived.
- **LocalStorage write fails / blocked**: an app-wide banner (every screen);
  edits stay in memory for the session but won't survive a reload.
- **LocalStorage value corrupt**: a dedicated recovery screen on every Paths
  route — "we couldn't read your saved Paths" (distinct from the empty state) +
  a confirmed reset.
- **Deep-link to a deleted `:pathId`**: `PathNotFound` state with a way back.
- **Timezone**: Achievement dates and contribution-graph day keys use the local
  calendar date, not UTC.

Deferred (see `paths-edgecases.md` → Hardening status): input length limits (#13),
a touch-reorder discoverability hint (#14), an async double-submit guard (#17,
harmless while creation is synchronous), and an app-wide date-format convention
(#18).

## Integration Points

- **vision**: one `Vision` per Path. The overview embeds a read-only Vision
  summary and links to `/paths/:pathId/vision`. Deleting the Path cascades the
  Vision and all its tiles.
- **goals**: every `Goal` belongs to exactly one Path. The overview lists the
  Path's Goals (priority order, deadline countdowns) and links to
  `/paths/:pathId/goals`. Goals are created under a Path; deleting the Path
  cascades its Goals and their Actions.
- **winlog**: the per-Path `ContributionGraph` is embedded on the overview; the
  card grid shows a mini version. `Achievement` mark-achieved events and
  Goal/Action completions under the Path feed it.
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
  (`/paths/:pathId/vision`, `/paths/:pathId/goals`) are registered by those
  modules under the shell's router.
